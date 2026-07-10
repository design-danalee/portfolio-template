// Gray the placeholder text on selects until a real option is chosen
document.querySelectorAll('.contact-form select').forEach((sel) => {
    const sync = () => sel.classList.toggle('placeholder', sel.value === '');
    sync();
    sel.addEventListener('change', sync);
});

// Custom error states (replacing the browser's default validation bubbles)
const contactForm = document.querySelector('.contact-form');
const nameInput = document.getElementById('name');
const nameError = document.getElementById('name-error');
const emailInput = document.getElementById('email');
const emailError = document.getElementById('email-error');

const showError = (input, msgEl, invalid) => {
    input.classList.toggle('error', invalid);
    msgEl.hidden = !invalid;
};

// Name is required
const validateName = (force = false) => {
    const invalid = nameInput.value.trim() === '';
    showError(nameInput, nameError, invalid);
    return !invalid;
};
// Email is required and must be a valid address.
// On blur we only flag a badly-formatted value; emptiness is only flagged on submit.
const validateEmail = (force = false) => {
    const value = emailInput.value.trim();
    const invalid = force ? (value === '' || !emailInput.checkValidity())
                          : (value !== '' && !emailInput.checkValidity());
    showError(emailInput, emailError, invalid);
    return value !== '' && emailInput.checkValidity();
};

nameInput.addEventListener('blur', () => validateName());
nameInput.addEventListener('input', () => {
    if (nameInput.classList.contains('error')) validateName();
});
emailInput.addEventListener('blur', () => validateEmail());
emailInput.addEventListener('input', () => {
    if (emailInput.classList.contains('error')) validateEmail();
});

contactForm.addEventListener('submit', (e) => {
    const nameOk = validateName(true);
    const emailOk = validateEmail(true);
    if (!nameOk || !emailOk) {
        e.preventDefault();
        (!nameOk ? nameInput : emailInput).focus();
    }
});

const params = new URLSearchParams(window.location.search);
const status = params.get('status');
const el = document.getElementById('form-status');
if (status === 'success') {
    el.textContent = "Message sent! I'll be in touch soon.";
    el.style.backgroundColor = 'lightseagreen';
    el.style.color = 'white';
    el.classList.remove('hidden');
} else if (status === 'error') {
    el.textContent = "Something went wrong. Try emailing me directly at danalee.seattle@gmail.com.";
    el.style.backgroundColor = '#fee2e2';
    el.style.color = '#991b1b';
    el.classList.remove('hidden');
}
