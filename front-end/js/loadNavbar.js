document.addEventListener('DOMContentLoaded', function() {
    fetch('/front-end/html/nav.html')
        .then(response => response.text())
        .then(data => {
            document.querySelector('nav').innerHTML = data;
            
            // Marca la página activa
            const currentPage = window.location.pathname;
            const menuItems = document.querySelectorAll('.nav-link, .dropdown-item');
            
            menuItems.forEach(item => {
                if (item.getAttribute('href') === currentPage) {
                    item.classList.add('active');
                }
            });
        });
});
document.addEventListener('DOMContentLoaded', function() {
    const nav = document.querySelector('nav');
    nav.innerHTML = `
        <div class="nav-content">
            <div class="logo">
                <a href="/front-end/html/index.html">
                    <img src="/Imagenes/LogoHobbVerse1.png" alt="Logo HobbVerse">
                </a>
            </div>
            <ul class="nav-links">
                <li><a href="/front-end/html/index.html">Inicio</a></li>
                <li><a href="/front-end/html/productos.html">Productos</a></li>
                <li><a href="/front-end/html/sobreNosotros.html">Sobre Nosotros</a></li>
                <li><a href="/front-end/html/contactenos.html">Contáctenos</a></li>
                <li class="login-link"><a href="/front-end/html/login.html">Iniciar Sesión</a></li>
            </ul>
        </div>
    `;
});