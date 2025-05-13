document.getElementById('loginForm').addEventListener('submit', function(event) {
  event.preventDefault();

  const email = document.getElementById('email');
  const password = document.getElementById('password');
  const emailError = document.getElementById('email-error');
  const passwordError = document.getElementById('password-error');

  let hasError = false;

  // Ocultar errores al inicio
  emailError.style.display = 'none';
  passwordError.style.display = 'none';

  // Validar email
  if (email.value.trim() === '') {
    emailError.textContent = '*Este campo es obligatorio';
    emailError.style.display = 'block';
    hasError = true;
  }

  // Validar password
  if (password.value.trim() === '') {
    passwordError.textContent = '*Este campo es obligatorio';
    passwordError.style.display = 'block';
    hasError = true;
  }

  if (hasError) return;


  

  // Validar si ya está registrado
  let users = JSON.parse(localStorage.getItem('usuarios')) || [];
  const userExists = users.some(user => user.email === email.value.trim());

  if (userExists) {
    emailError.textContent = 'Este correo ya está registrado';
    emailError.style.display = 'block';
    return;
  }

  // Guardar usuario si todo está bien
  const newUser = {
    email: email.value.trim(),
    password: password.value.trim()
  };
  users.push(newUser);
  localStorage.setItem('usuarios', JSON.stringify(users));

  const alertContainer = document.getElementById('alert-container');
alertContainer.innerHTML = `
  <div class="alert alert-success alert-dismissible fade show" role="alert">
    ¡Nos encanta tenerte aquí de nuevo!
    <button type="button" class="btn-close" data-bs-dismiss="alert" aria-label="Cerrar"></button>
  </div>
`;
});
