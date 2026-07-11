// Gray the placeholder text on selects until a real option is chosen
document.querySelectorAll('.contact-form select').forEach((sel) => {
    const sync = () => sel.classList.toggle('placeholder', sel.value === '');
    sync();
    sel.addEventListener('change', sync);
});

// Custom error states (replacing the browser's default validation bubbles).
// Field-agnostic: works for however many required fields the CMS defines.
const contactForm = document.querySelector('.contact-form');
const requiredFields = [...contactForm.querySelectorAll('[required]')].map((input) => ({
    input,
    error: document.getElementById(input.id + '-error'),
}));

const showError = (input, msgEl, invalid) => {
    input.classList.toggle('error', invalid);
    if (msgEl) msgEl.hidden = !invalid;
};

// Required + (for <input type="email">) must be a valid address.
// On blur we only flag a badly-formatted value; emptiness is only flagged on submit.
const validateField = ({ input, error }, force = false) => {
    const value = input.value.trim();
    const isEmail = input.type === 'email';
    const invalid = force
        ? value === '' || (isEmail && !input.checkValidity())
        : value !== '' && isEmail && !input.checkValidity();
    showError(input, error, invalid);
    return value !== '' && (!isEmail || input.checkValidity());
};

requiredFields.forEach((field) => {
    field.input.addEventListener('blur', () => validateField(field));
    field.input.addEventListener('input', () => {
        if (field.input.classList.contains('error')) validateField(field);
    });
});

contactForm.addEventListener('submit', (e) => {
    let firstInvalid = null;
    requiredFields.forEach((field) => {
        const ok = validateField(field, true);
        if (!ok && !firstInvalid) firstInvalid = field.input;
    });
    if (firstInvalid) {
        e.preventDefault();
        firstInvalid.focus();
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
    el.textContent = "Something went wrong. Please try again in a moment.";
    el.style.backgroundColor = '#fee2e2';
    el.style.color = '#991b1b';
    el.classList.remove('hidden');
}
