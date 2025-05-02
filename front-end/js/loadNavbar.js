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