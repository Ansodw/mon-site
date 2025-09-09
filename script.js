// script.js

// Remplacez par VOTRE clé PUBLIABLE Stripe
const stripe = Stripe('pk_test_51S5XjiJcEpPxg9V0UJ58OnsCXtmdIbBhKy4pn3FrYRoC5MNg3421xJnWQG6VpS7i6f3eIliPRRhATnmACz6uul0m00Pfsi1xgv');
const checkoutButton = document.getElementById('checkout-button');

document.addEventListener('DOMContentLoaded', () => {
    updateCartCount();
    if (document.getElementById('contenu-panier')) {
        afficherPanier();
    }
    const firstFilterButton = document.querySelector('.filtres button');
    if(firstFilterButton) {
        firstFilterButton.classList.add('active');
    }
});

function ajouterAuPanier(nom, prix, image) {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    let itemExistant = panier.find(item => item.nom === nom);

    if (itemExistant) {
        itemExistant.quantite++;
    } else {
        panier.push({ nom, prix, image, quantite: 1 });
    }

    localStorage.setItem('panier', JSON.stringify(panier));
    showNotification(`${nom} a été ajouté au panier !`);
    updateCartCount();
}

function showNotification(message) {
    const notification = document.getElementById('notification');
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}

function updateCartCount() {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = panier.reduce((total, item) => total + item.quantite, 0);
    }
}

function filtrerProduits(categorie) {
    const produits = document.querySelectorAll('.product-card');
    produits.forEach(produit => {
        const cat = produit.getAttribute('data-category');
        produit.style.display = (categorie === 'tous' || cat === categorie) ? 'block' : 'none';
    });

    const buttons = document.querySelectorAll('.filtres button');
    buttons.forEach(button => {
        button.classList.remove('active');
        if (button.getAttribute('onclick').includes(`'${categorie}'`)) {
            button.classList.add('active');
        }
    });
}

function afficherPanier() {
    const panier = JSON.parse(localStorage.getItem('panier')) || [];
    const contenuPanier = document.getElementById('contenu-panier');
    const totalPanierEl = document.getElementById('total-panier');
    const panierContainer = document.getElementById('panier-container');

    if (!contenuPanier) return; // Sécurité pour les autres pages

    contenuPanier.innerHTML = '';

    if (panier.length === 0) {
        panierContainer.innerHTML = '<h2>Votre panier est vide.</h2><a href="index.html" class="button-link">Continuer mes achats</a>';
        return;
    }

    let total = 0;
    panier.forEach((item, index) => {
        const itemHtml = `
            <div class="panier-item">
                <div class="panier-item-info">
                    <img src="${item.image}" alt="${item.nom}" class="panier-item-image">
                    <div class="panier-item-details">
                        <span class="item-name">${item.nom}</span>
                        <span class="item-price">${item.prix.toFixed(2)} €</span>
                    </div>
                </div>
                <div class="item-quantity">
                    <button onclick="changerQuantite(${index}, -1)">-</button>
                    <input type="text" value="${item.quantite}" readonly>
                    <button onclick="changerQuantite(${index}, 1)">+</button>
                </div>
                <span class="item-total-price">${(item.prix * item.quantite).toFixed(2)} €</span>
                <i class="fas fa-trash remove-item" onclick="supprimerDuPanier(${index})"></i>
            </div>
        `;
        contenuPanier.innerHTML += itemHtml;
        total += item.prix * item.quantite;
    });

    totalPanierEl.textContent = `Total : ${total.toFixed(2)} €`;
}

function changerQuantite(index, delta) {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    if (panier[index]) {
        panier[index].quantite += delta;
        if (panier[index].quantite <= 0) {
            panier.splice(index, 1);
        }
    }
    localStorage.setItem('panier', JSON.stringify(panier));
    afficherPanier();
    updateCartCount();
}

function supprimerDuPanier(index) {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    panier.splice(index, 1);
    localStorage.setItem('panier', JSON.stringify(panier));
    afficherPanier();
    updateCartCount();
}

function viderPanier() {
    localStorage.removeItem('panier');
    afficherPanier();
    updateCartCount();
}

// ### CORRECTION : Ce bloc est maintenant à l'extérieur de viderPanier() ###
if (checkoutButton) {
  checkoutButton.addEventListener('click', async () => {
    const panier = JSON.parse(localStorage.getItem('panier')) || [];
    
    // On appelle notre fonction back-end
    const response = await fetch('/.netlify/functions/create-checkout', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ items: panier }),
    }).then(res => res.json());

    // On redirige le client vers la page de paiement Stripe
    const result = await stripe.redirectToCheckout({
      sessionId: response.id,
    });

    if (result.error) {
      alert(result.error.message);
    }
  });
}