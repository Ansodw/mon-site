// script.js

// NOTRE CATALOGUE DE PRODUITS
const produits = {
  'bague-doree': {
    nom: 'Bague Dorée',
    prix: 29.90,
    image: 'images/bague.jpg',
    description: 'Une magnifique bague dorée, parfaite pour toutes les occasions. Fabriquée avec des matériaux de haute qualité, elle ne manquera pas de faire tourner les têtes.'
  },
  'collier-pendentifs': {
    nom: 'Collier Pendentifs',
    prix: 49.00,
    image: 'images/collier.jpg',
    description: 'Ce collier élégant avec ses multiples pendentifs est la touche finale parfaite pour votre tenue. Un design unique et moderne.'
  },
  'bracelet-perles': {
    nom: 'Bracelet Perles',
    prix: 19.90,
    image: 'images/bracelet.jpg',
    description: 'Un bracelet délicat composé de perles fines et de charms en forme d\'étoile. Idéal pour un look bohème-chic.'
  },
  'robe-ete': {
    nom: 'Robe d\'Été',
    prix: 89.90,
    image: 'images/robe.jpg',
    description: 'Légère et fluide, cette robe d\'été rose est parfaite pour les journées ensoleillées. Son tissu en soie vous gardera au frais avec style.'
  }
};

// Écouteur principal qui se lance une fois que la page est prête
document.addEventListener('DOMContentLoaded', () => {
    // Fonctions à lancer sur toutes les pages
    updateCartCount();

    // Fonctions spécifiques à certaines pages
    if (document.querySelector('.product-grid')) {
        setupAnimations();
    }
    if (document.getElementById('contenu-panier')) {
        afficherPanier();
    }
    if (document.getElementById('product-detail')) {
        afficherPageProduit();
    }
});

// --- FONCTIONS DU PANIER ET DE LA BOUTIQUE ---

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

function afficherPanier() {
    const panier = JSON.parse(localStorage.getItem('panier')) || [];
    const contenuPanier = document.getElementById('contenu-panier');
    const totalPanierEl = document.getElementById('total-panier');
    const panierContainer = document.getElementById('panier-container');

    if (!contenuPanier) return;

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

function updateCartCount() {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    const cartCount = document.getElementById('cart-count');
    if (cartCount) {
        cartCount.textContent = panier.reduce((total, item) => total + item.quantite, 0);
    }
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

function showNotification(message) {
    const notification = document.getElementById('notification');
    if(!notification) return;
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => {
        notification.classList.remove('show');
    }, 3000);
}


// --- FONCTION DE LA PAGE PRODUIT ---

function afficherPageProduit() {
  const productDetailContainer = document.getElementById('product-detail');
  if (!productDetailContainer) return;

  const params = new URLSearchParams(window.location.search);
  const productId = params.get('id');
  const produit = produits[productId];

  if (produit) {
    document.title = produit.nom + ' - Ma Boutique';
    productDetailContainer.innerHTML = `
      <div class="product-image-container">
        <img src="${produit.image}" alt="${produit.nom}" />
      </div>
      <div class="product-info-container">
        <h1>${produit.nom}</h1>
        <p class="product-page-price">${produit.prix.toFixed(2)} €</p>
        <p class="product-description">${produit.description}</p>
        <button class="add-to-cart-btn" onclick="ajouterAuPanier('${produit.nom.replace(/'/g, "\\'")}', ${produit.prix}, '${produit.image}')">Ajouter au panier</button>
      </div>
    `;
  } else {
    productDetailContainer.innerHTML = '<h2>Oups !</h2><p>Ce produit n\'a pas été trouvé. <a href="index.html" class="button-link">Retour à l\'accueil</a></p>';
  }
}

// --- ANIMATIONS ---

function setupAnimations() {
  const observerOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.1
  };

  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        // On cible le parent (le lien) pour l'animation
        entry.target.parentElement.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);

  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => {
    observer.observe(card);
  });
}

// --- PAIEMENT STRIPE ---

// On ne déclare la variable stripe que si on est sur la page du panier
if (document.getElementById('checkout-button')) {
    const stripe = Stripe('pk_test_51S5XjiJcEpPxg9V0UJ58OnsCXtmdIbBhKy4pn3FrYRoC5MNg3421xJnWQG6VpS7i6f3eIliPRRhATnmACz6uul0m00Pfsi1xgv');
    const checkoutButton = document.getElementById('checkout-button');

    checkoutButton.addEventListener('click', async () => {
        checkoutButton.disabled = true;
        checkoutButton.textContent = 'Chargement...';
        
        const panier = JSON.parse(localStorage.getItem('panier')) || [];

        try {
            const response = await fetch('/.netlify/functions/create-checkout', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ items: panier }),
            }).then(res => res.json());

            if (!response.id) {
                throw new Error('La réponse du serveur ne contient pas d\'ID de session.');
            }

            const result = await stripe.redirectToCheckout({ sessionId: response.id });

            if (result.error) {
                throw new Error(result.error.message);
            }
        } catch (error) {
            console.error("Erreur lors du checkout:", error);
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Valider la commande';
        }
    });
}