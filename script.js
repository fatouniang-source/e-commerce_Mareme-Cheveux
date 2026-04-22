/* =========================
   PANIER & NOTIFICATIONS
========================= */

const boutons = document.querySelectorAll(".ajouter-panier");
const notification = document.getElementById("notification");
const panierIcon = document.querySelector(".panier-menu");

function getPanier() {
  return JSON.parse(localStorage.getItem("panier")) || [];
}

function savePanier(panier) {
  localStorage.setItem("panier", JSON.stringify(panier));
}

function updatePanierCount() {
  const panierCount = document.getElementById("panier-count");
  if (!panierCount) return;
  panierCount.textContent = getPanier().length;
}

function showNotification(message) {
  if (!notification) return;
  notification.textContent = message;
  notification.classList.add("show");
  setTimeout(() => notification.classList.remove("show"), 2000);
}

/* =========================
   ANIMATION IMAGE
========================= */
function animateToCart(img) {
  if (!img || !panierIcon) return;

  const clone = img.cloneNode(true);
  const start = img.getBoundingClientRect();
  const end = panierIcon.getBoundingClientRect();

  clone.style.position = "fixed";
  clone.style.left = start.left + "px";
  clone.style.top = start.top + "px";
  clone.style.width = start.width + "px";
  clone.style.transition = "all 0.8s ease";
  clone.style.zIndex = 1000;

  document.body.appendChild(clone);

  setTimeout(() => {
    clone.style.left = end.left + "px";
    clone.style.top = end.top + "px";
    clone.style.width = "20px";
    clone.style.opacity = "0";
  }, 50);

  setTimeout(() => clone.remove(), 900);
}

/* =========================
   AJOUT AU PANIER
========================= */
boutons.forEach(bouton => {
  bouton.addEventListener("click", () => {
    const nom = bouton.dataset.nom;
    const prix = parseFloat(bouton.dataset.prix);

    const panier = getPanier();
    panier.push({ nom, prix });
    savePanier(panier);

    const img = bouton.parentElement.querySelector("img");
    animateToCart(img);

    updatePanierCount();
    showNotification(`${nom} ajouté au panier`);
  });
});

updatePanierCount();

/* =========================
   PAGE PANIER
========================= */
const panierList = document.getElementById("panier-list");
const totalDisplay = document.getElementById("total");
const viderPanierBtn = document.getElementById("vider-panier");
const commanderBtn = document.getElementById("commander");

function displayPanier() {
  if (!panierList) return;

  const panier = getPanier();
  panierList.innerHTML = "";

  if (panier.length === 0) {
    panierList.innerHTML = "<p>Votre panier est vide.</p>";
    if (totalDisplay) totalDisplay.textContent = "";
    if (commanderBtn) commanderBtn.style.display = "none";
    return;
  }

  if (commanderBtn) commanderBtn.style.display = "inline-block";

  let total = 0;

  panier.forEach((item, index) => {
    total += item.prix;
    panierList.innerHTML += `
      <div>
        <span>${item.nom} - ${item.prix}f</span>
        <button class="supprimer" data-index="${index}">Supprimer</button>
      </div>
    `;
  });

  totalDisplay.textContent = `Total : ${total}f`;

  document.querySelectorAll(".supprimer").forEach(btn => {
    btn.addEventListener("click", () => {
      const panier = getPanier();
      panier.splice(btn.dataset.index, 1);
      savePanier(panier);
      displayPanier();
      updatePanierCount();
    });
  });
}

if (viderPanierBtn) {
  viderPanierBtn.addEventListener("click", () => {
    localStorage.removeItem("panier");
    displayPanier();
    updatePanierCount();
  });
}

displayPanier();

/* =========================
   COMMANDER → WHATSAPP
========================= */
if (commanderBtn) {
  commanderBtn.addEventListener("click", () => {
    const panier = getPanier();
    if (panier.length === 0) return;

    let message = "Bonjour 👋 Je souhaite passer commande.%0A%0A";
    let total = 0;

    panier.forEach((item, i) => {
      message += `${i + 1}. ${item.nom} - ${item.prix}f%0A`;
      total += item.prix;
    });

    message += `%0ATotal : ${total}f`;

    window.open(
      `https://wa.me/221767517425?text=${message}`,
      "_blank"
    );

    const commandes = JSON.parse(localStorage.getItem("commandes")) || [];
    const now = new Date();

    panier.forEach(item => {
      commandes.push({
        nom: item.nom,
        prix: item.prix,
        date: now.toLocaleDateString("fr-FR"),
        heure: now.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" })
      });
    });

    localStorage.setItem("commandes", JSON.stringify(commandes));
  });
}

/* =========================
   COMMANDES
========================= */
const commandesList = document.getElementById("commandes-list");
const viderCommandesBtn = document.getElementById("vider-commandes");

function displayCommandes() {
  if (!commandesList) return;

  const commandes = JSON.parse(localStorage.getItem("commandes")) || [];
  commandesList.innerHTML = "";

  if (commandes.length === 0) {
    commandesList.innerHTML = "<p>Aucune commande envoyée pour le moment.</p>";
    return;
  }

  commandes.forEach(item => {
    commandesList.innerHTML += `
      <div>
        <strong>${item.nom}</strong> – ${item.prix}f<br>
        <small>Commandé le : ${item.date} à ${item.heure}</small>
      </div>
    `;
  });
}

if (viderCommandesBtn) {
  viderCommandesBtn.addEventListener("click", () => {
    localStorage.removeItem("commandes");
    displayCommandes();
  });
}

displayCommandes();


/* =========================
FILTRE PAR CATÉGORIES
========================= */

const filtres = document.querySelectorAll(".filtre-btn");
const produits = document.querySelectorAll(".produit");

filtres.forEach(bouton => {
bouton.addEventListener("click", () => {
const categorie = bouton.dataset.categorie;

produits.forEach(produit => {
if (categorie === "tout" || produit.dataset.categorie === categorie) {
produit.style.display = "";
} else {
produit.style.display = "none";
}
});
});
});


// FILTRE AUTOMATIQUE VIA URL
const urlParams = new URLSearchParams(window.location.search);
const categorieURL = urlParams.get("categorie"); // ex: "parfums"

if (categorieURL && categorieURL !== "tout") {
    produits.forEach(produit => {
        if (produit.dataset.categorie === categorieURL) {
            produit.style.display = ""; // montrer
        } else {
            produit.style.display = "none"; // cacher
        }
    });

    // Activer le bouton de filtre correspondant
    filtres.forEach(btn => {
        if (btn.dataset.categorie === categorieURL) {
            btn.classList.add("active");
        } else {
            btn.classList.remove("active");
        }
    });
}


/* =========================
RECHERCHE PRODUIT
========================= */

const searchInput = document.getElementById("search-input");

if (searchInput) {
searchInput.addEventListener("input", () => {
const recherche = searchInput.value.toLowerCase().trim();

produits.forEach(produit => {
const nomProduit = produit.querySelector("h3").textContent.toLowerCase();

if (nomProduit.includes(recherche)) {
produit.style.display = "";
} else {
produit.style.display = "none";
}
});
});
}


/* =========================
TRI DES PRODUITS
========================= */

const triSelect = document.getElementById("tri-select");
const produitsContainer = document.querySelector(".produits-list");

function getPrix(produit) {
const prixText = produit.querySelector("p").textContent;
return parseFloat(prixText.replace(/[^\d]/g, ""));
}

if (triSelect && produitsContainer) {
triSelect.addEventListener("change", () => {
const option = triSelect.value;
const produitsArray = Array.from(produits);

if (option === "prix-asc") {
produitsArray.sort((a, b) => getPrix(a) - getPrix(b));
}

if (option === "prix-desc") {
produitsArray.sort((a, b) => getPrix(b) - getPrix(a));
}

if (option === "nom-asc") {
produitsArray.sort((a, b) =>
a.querySelector("h3").textContent.localeCompare(
b.querySelector("h3").textContent,
"fr",
{ sensitivity: "base" }
)
);
}

if (option === "nom-desc") {
produitsArray.sort((a, b) =>
b.querySelector("h3").textContent.localeCompare(
a.querySelector("h3").textContent,
"fr",
{ sensitivity: "base" }
)
);
}

// Réinjection dans le DOM
produitsArray.forEach(produit => produitsContainer.appendChild(produit));
});
}




