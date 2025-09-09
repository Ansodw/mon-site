// On récupère la clé secrète depuis les variables d'environnement de Netlify
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event) => {
  try {
    // On récupère le panier envoyé depuis le front-end
    const { items } = JSON.parse(event.body);

    // On transforme notre panier pour que Stripe le comprenne
    const lineItems = items.map(item => ({
      price_data: {
        currency: 'eur',
        product_data: {
          name: item.nom,
        },
        unit_amount: item.prix * 100, // Le prix doit être en centimes
      },
      quantity: item.quantite,
    }));

    // On crée une session de paiement avec Stripe
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      // Les URL de redirection après le paiement
      success_url: `${process.env.URL}/confirmation.html`, // URL du site déployé
      cancel_url: `${process.env.URL}/panier.html`,
    });

    // On renvoie l'ID de la session au front-end
    return {
      statusCode: 200,
      body: JSON.stringify({ id: session.id }),
    };
  } catch (error) {
    return { statusCode: 500, body: error.toString() };
  }
};