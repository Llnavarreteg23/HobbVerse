import * as adminFunctions from './admin.js';

const iconSelected = document.getElementById("iconSelected");
const hobbieaSelected = document.querySelector(".hobbieaSelected");
const hobbieClicked = document.getElementsByClassName("hobbiea");
const hobbieImageContainer = document.getElementById("hobbieImageContainer");

const categoryIcons = {
    "lectura": "bi-book",
    "deportes": "bi-person-walking",
    "música": "bi bi-music-note",
    "pintura": "bi-palette",
    "videojuegos": "bi-controller",
    "peliculas": "bi-film",
    "crochet": "bi-scissors"
};

export default function renderCategory(category, name) {
    const localProducts = JSON.parse(localStorage.getItem('hobbverse_products')) || [];

    const filteredLocalProducts = localProducts.filter(p => p.category === name);

    hobbieImageContainer.innerHTML = "";

    if (filteredLocalProducts.length > 0) {
        filteredLocalProducts.forEach(producto => {
            const card = document.createElement("div");
            card.className = "producto-card";
            card.innerHTML = `
                <div id="carousel-${producto.id}" class="carousel slide" data-bs-ride="carousel">
    <div class="carousel-indicators">
        <button type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide-to="0" class="active"></button>
        ${(producto.additionalImages || []).map((_, index) => `
            <button type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide-to="${index + 1}"></button>
        `).join('')}
    </div>
    <div class="carousel-inner">
        <div class="carousel-item active">
            <img src="${producto.mainImage}" class="d-block w-100" alt="Imagen principal">
        </div>
        ${(producto.additionalImages || []).map(img => `
            <div class="carousel-item">
                <img src="${img}" class="d-block w-100" alt="Imagen adicional">
            </div>
        `).join('')}
        </div>
            <button class="carousel-control-prev" type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide="prev">
                <span class="carousel-control-prev-icon"></span>
                <span class="visually-hidden">Anterior</span>
            </button>
            <button class="carousel-control-next" type="button" data-bs-target="#carousel-${producto.id}" data-bs-slide="next">
                <span class="carousel-control-next-icon"></span>
                <span class="visually-hidden">Siguiente</span>
            </button>
        </div>

                <div class="product-details">
                    <h3>${producto.nombre || producto.name}</h3>
                    ${producto.autor ? `<p><strong>Autor:</strong> ${producto.autor}</p>` : ""}
                    <p><strong>Precio:</strong> $${(producto.precio || producto.price).toLocaleString()}</p>
                    <p><strong>Descripción:</strong>${(producto.descripcion || producto.description).toLocaleString()}</p>
                    <button class="buy-button">Agregar al carrito</button>
                </div>
            `;
            hobbieImageContainer.appendChild(card);
        });
    } else {
        hobbieImageContainer.innerHTML = "<p>No hay productos disponibles para esta categoría.</p>";
    }
}

Array.from(hobbieClicked).forEach(link => {
    link.addEventListener("click", function(event) {
        event.preventDefault();

        Array.from(hobbieClicked).forEach(item => item.classList.remove("selected"));

        this.classList.add("selected");

        const category = this.dataset.category;
        const name = this.textContent.trim();

        hobbieaSelected.textContent = name;

        iconSelected.className = categoryIcons[category];

        renderCategory(category, name);
    });
});

document.addEventListener("DOMContentLoaded", function () {
    console.log("Página cargada, verificando productos en localStorage...");
    
    const defaultCategoryLink = Array.from(hobbieClicked).find(link => link.textContent.trim() === "Lectura");

    if (defaultCategoryLink) {
        defaultCategoryLink.classList.add("selected");

        hobbieaSelected.textContent = defaultCategoryLink.textContent.trim();
        iconSelected.className = categoryIcons[defaultCategoryLink.dataset.category];
    }

    renderCategory("lectura", "Lectura");
});

