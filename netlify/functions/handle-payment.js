// netlify/functions/handle-payment.js

const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

exports.handler = async ({ body, headers }) => {
  try {
    const stripeEvent = stripe.webhooks.constructEvent(
      body,
      headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );

    if (stripeEvent.type === 'checkout.session.completed') {
      const session = stripeEvent.data.object;
      
      const orderNumber = `CMD-${Date.now()}`;
      const customerEmail = session.customer_details.email;
      const amountTotal = (session.amount_total / 100).toFixed(2);

      // Le message à envoyer
      const msg = {
        to: customerEmail,
        // REMPLACE PAR TON ADRESSE VÉRIFIÉE SUR SENDGRID
        from: 'anesskhedim@gmail.com', 
        subject: `Merci ! Confirmation de votre commande #${orderNumber}`,
        html: `
          <div style="font-family: Arial, sans-serif; color: #333;">
            <h2>Merci pour votre achat !</h2>
            <p>Bonjour,</p>
            <p>Nous avons bien reçu votre commande <strong>n°${orderNumber}</strong> d'un montant total de <strong>${amountTotal} €</strong>.</p>
            <p>Vous recevrez bientôt une facture officielle de la part de Stripe.</p>
            <p>À bientôt sur Ma Boutique !</p>
          </div>
        `,
      };
      
      // On envoie l'e-mail
      await sgMail.send(msg);
      
      console.log(`E-mail de confirmation envoyé pour la commande ${orderNumber}`);
    }

    return {
      statusCode: 200,
      body: JSON.stringify({ received: true }),
    };
  } catch (err) {
    console.log(`Erreur Webhook : ${err.message}`);
    return {
      statusCode: 400,
      body: `Webhook Error: ${err.message}`,
    };
  }
};