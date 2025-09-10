// script.js - VERSION FINALE COMPLÈTE

// Variable globale qui contiendra nos produits une fois chargés
let produits = {};

// Écouteur principal qui se lance une fois que la page est prête
document.addEventListener('DOMContentLoaded', async () => {
    // On charge les produits depuis le fichier JSON créé par le CMS
    try {
        const response = await fetch('/produits.json');
        const produitsData = await response.json();
        
        // On transforme le tableau en objet pour que le reste du code fonctionne
        produitsData.forEach(p => {
            // On utilise le "slug" comme clé unique pour chaque produit
            produits[p.slug] = p;
        });

    } catch (error) {
        console.error("Erreur de chargement des produits:", error);
    }

    // --- Lancement des fonctions une fois les produits chargés ---
    updateCartCount();

    if (document.querySelector('.product-grid')) {
        afficherTousLesProduits();
        setupAnimations();
    }
    if (document.getElementById('contenu-panier')) {
        afficherPanier();
    }
    if (document.getElementById('product-detail')) {
        afficherPageProduit();
    }
});


// --- FONCTION QUI AFFICHE LES PRODUITS SUR L'ACCUEIL ---

function afficherTousLesProduits() {
    const container = document.getElementById('product-grid-container');
    if (!container) return;
    
    container.innerHTML = ''; // On vide la grille
    
    // On boucle sur chaque produit chargé et on crée sa carte
    for (const slug in produits) {
        const p = produits[slug];
        // On s'assure que le prix est un nombre avant d'appeler toFixed
        const prix = typeof p.prix === 'number' ? p.prix.toFixed(2) : 'N/A';
        const nomPropre = p.nom ? p.nom.replace(/'/g, "\\'") : '';

        const productCardHTML = `
            <a href="produit.html?id=${slug}" class="product-card-link">
                <div class="product-card" data-category="${p.categorie || ''}">
                    <img src="/${p.image}" alt="${p.nom}" />
                    <h3>${p.nom}</h3>
                    <p class="price">${prix} €</p>
                    <button onclick="event.preventDefault(); ajouterAuPanier('${nomPropre}', ${p.prix}, '/${p.image}')">Ajouter au panier</button>
                </div>
            </a>
        `;
        container.innerHTML += productCardHTML;
    }
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
    const prix = typeof produit.prix === 'number' ? produit.prix.toFixed(2) : 'N/A';
    const nomPropre = produit.nom ? produit.nom.replace(/'/g, "\\'") : '';
    
    productDetailContainer.innerHTML = `
      <div class="product-image-container">
        <img src="/${produit.image}" alt="${produit.nom}" />
      </div>
      <div class="product-info-container">
        <h1>${produit.nom}</h1>
        <p class="product-page-price">${prix} €</p>
        <p class="product-description">${produit.description}</p>
        <button class="add-to-cart-btn" onclick="ajouterAuPanier('${nomPropre}', ${produit.prix}, '/${produit.image}')">Ajouter au panier</button>
      </div>
    `;
  } else {
    productDetailContainer.innerHTML = '<h2>Oups !</h2><p>Ce produit n\'a pas été trouvé. Il est possible qu\'il soit en cours de création. <a href="index.html" class="button-link">Retour à l\'accueil</a></p>';
  }
}


// --- FONCTIONS DU PANIER ---

function ajouterAuPanier(nom, prix, image) {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    let itemExistant = panier.find(item => item.nom === nom);
    if (itemExistant) { itemExistant.quantite++; }
    else { panier.push({ nom, prix, image, quantite: 1 }); }
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
        const itemHtml = `<div class="panier-item"><div class="panier-item-info"><img src="${item.image}" alt="${item.nom}" class="panier-item-image"><div class="panier-item-details"><span class="item-name">${item.nom}</span><span class="item-price">${item.prix.toFixed(2)} €</span></div></div><div class="item-quantity"><button onclick="changerQuantite(${index}, -1)">-</button><input type="text" value="${item.quantite}" readonly><button onclick="changerQuantite(${index}, 1)">+</button></div><span class="item-total-price">${(item.prix * item.quantite).toFixed(2)} €</span><i class="fas fa-trash remove-item" onclick="supprimerDuPanier(${index})"></i></div>`;
        contenuPanier.innerHTML += itemHtml;
        total += item.prix * item.quantite;
    });
    totalPanierEl.textContent = `Total : ${total.toFixed(2)} €`;
}

function updateCartCount() {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    const cartCount = document.getElementById('cart-count');
    if (cartCount) { cartCount.textContent = panier.reduce((total, item) => total + item.quantite, 0); }
}

function changerQuantite(index, delta) {
    let panier = JSON.parse(localStorage.getItem('panier')) || [];
    if (panier[index]) {
        panier[index].quantite += delta;
        if (panier[index].quantite <= 0) { panier.splice(index, 1); }
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

function showNotification(message) {
    const notification = document.getElementById('notification');
    if (!notification) return;
    notification.textContent = message;
    notification.classList.add('show');
    setTimeout(() => { notification.classList.remove('show'); }, 3000);
}

// --- ANIMATIONS ---

function setupAnimations() {
  const observerOptions = { root: null, rootMargin: '0px', threshold: 0.1 };
  const observer = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.parentElement.classList.add('is-visible');
        observer.unobserve(entry.target);
      }
    });
  }, observerOptions);
  const productCards = document.querySelectorAll('.product-card');
  productCards.forEach(card => { observer.observe(card); });
}

// --- PAIEMENT STRIPE ---

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
            if (!response.id) { throw new Error('La réponse du serveur ne contient pas d\'ID de session.'); }
            const result = await stripe.redirectToCheckout({ sessionId: response.id });
            if (result.error) { throw new Error(result.error.message); }
        } catch (error) {
            console.error("Erreur lors du checkout:", error);
            checkoutButton.disabled = false;
            checkoutButton.textContent = 'Valider la commande';
        }
    });
}