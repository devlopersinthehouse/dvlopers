/* =========================
   GLOBAL VARIABLES
========================= */
const card = document.querySelector('.auth-card');
const techLayer = document.querySelector('.tech-bg');

const techIcons = [
    { icon: 'fa-html5', glow: 'glow-html' },
    { icon: 'fa-css3-alt', glow: 'glow-css' },
    { icon: 'fa-js', glow: 'glow-js' },
    { icon: 'fa-react', glow: 'glow-react' },
    { icon: 'fa-node-js', glow: 'glow-node' },
    { icon: 'fa-python', glow: 'glow-python' },
    { icon: 'fa-github', glow: 'glow-github' }
];

const iconsOnScreen = [];

/* =========================
   TAB SWITCHING
========================= */
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        tab.classList.add('active');

        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        const forgotForm = document.getElementById('forgotForm');

        loginForm.style.display = tab.dataset.form === 'login' ? 'block' : 'none';
        registerForm.style.display = tab.dataset.form === 'register' ? 'block' : 'none';
        forgotForm.style.display = 'none';

        clearMessages();
    });
});

/* =========================
   NAVIGATION LINKS
========================= */
document.getElementById('toRegister').addEventListener('click', () => {
    document.querySelector('.tab[data-form="register"]').click();
});

document.getElementById('toLogin').addEventListener('click', () => {
    document.querySelector('.tab[data-form="login"]').click();
});

document.getElementById('forgotLink').addEventListener('click', () => {
    document.getElementById('loginForm').style.display = 'none';
    document.getElementById('registerForm').style.display = 'none';
    document.getElementById('forgotForm').style.display = 'block';
    clearMessages();
});

document.getElementById('backToLoginLink').addEventListener('click', () => {
    document.getElementById('forgotForm').style.display = 'none';
    document.getElementById('loginForm').style.display = 'block';
    clearMessages();
});

/* =========================
   PASSWORD SHOW/HIDE
========================= */
document.querySelectorAll('.show-pass').forEach(icon => {
    icon.addEventListener('click', () => {
        const target = document.getElementById(icon.dataset.target);
        target.type = target.type === 'password' ? 'text' : 'password';
    });
});

/* =========================
   MESSAGE HELPERS
========================= */
function showMessage(id, text, type) {
    const el = document.getElementById(id);
    el.textContent = text;
    el.className = `message ${type}`;
    
    // Shake effect on error
    if (type === 'error' && card) {
        card.classList.add('shake');
        setTimeout(() => card.classList.remove('shake'), 500);
    }
}

function clearMessages() {
    ['loginMessage', 'registerMessage', 'forgotMessage'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.textContent = '';
            el.className = 'message';
        }
    });
}

/* =========================
   PHONE NUMBER VALIDATION (REQUIRED)
========================= */
function validatePhone() {
    const phoneInput = document.getElementById('regPhone');
    const phoneGroup = document.getElementById('phoneGroup');
    const phoneError = document.getElementById('phoneError');
    const phoneValid = document.getElementById('phoneValid');

    if (!phoneInput || !phoneGroup) return false;

    const phone = phoneInput.value.trim();

    // Remove previous states
    phoneGroup.classList.remove('valid', 'invalid');
    if (phoneError) phoneError.style.display = 'none';
    if (phoneValid) phoneValid.style.display = 'none';

    // REQUIRED - empty not allowed
    if (phone === '') {
        phoneGroup.classList.add('invalid');
        if (phoneError) {
            phoneError.textContent = 'Mobile number is required';
            phoneError.style.display = 'block';
        }
        return false;
    }

    // Strict validation: +countrycode + 10-15 digits (E.164 format)
    const phoneRegex = /^\+[1-9]\d{9,14}$/;

    if (phoneRegex.test(phone)) {
        phoneGroup.classList.add('valid');
        if (phoneValid) phoneValid.style.display = 'block';
        return true;
    } else {
        phoneGroup.classList.add('invalid');
        if (phoneError) {
            phoneError.textContent = 'Invalid format. Example: +919876543210';
            phoneError.style.display = 'block';
        }
        return false;
    }
}

// Real-time validation
const phoneInput = document.getElementById('regPhone');
if (phoneInput) {
    phoneInput.addEventListener('input', validatePhone);
    phoneInput.addEventListener('blur', validatePhone);
}

/* =========================
   LOGIN HANDLER
========================= */
document.getElementById('loginBtn').addEventListener('click', async () => {
    const email = document.getElementById('loginEmail').value.trim();
    const password = document.getElementById('loginPassword').value;
    const loader = document.getElementById('loginLoader');
    const btn = document.getElementById('loginBtn');

    // Validation
    if (!email || !password) {
        showMessage('loginMessage', 'Please fill in all fields', 'error');
        return;
    }

    loader.style.display = 'block';
    btn.disabled = true;
    clearMessages();

    try {
        const res = await fetch('/api/auth/login', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email, password })
        });

        const data = await res.json();
        loader.style.display = 'none';
        btn.disabled = false;

        if (res.ok) {
            showMessage('loginMessage', 'Login successful! Redirecting...', 'success');
            setTimeout(() => {
                window.location.href = '/';
            }, 1500);
        } else {
            let msg = data.message || 'Invalid credentials';
            
            if (msg.toLowerCase().includes('verify') || msg.toLowerCase().includes('verification')) {
                msg = 'Please verify your email first. Check your inbox (and spam folder) for the verification link.';
            }
            
            showMessage('loginMessage', msg, 'error');
        }
    } catch (err) {
        loader.style.display = 'none';
        btn.disabled = false;
        showMessage('loginMessage', 'Network error. Please try again.', 'error');
        console.error('Login error:', err);
    }
});

/* =========================
   REGISTER HANDLER – WITH REQUIRED PHONE VALIDATION
========================= */
document.getElementById('registerBtn').addEventListener('click', async () => {
    const name = document.getElementById('regName').value.trim();
    const email = document.getElementById('regEmail').value.trim();
    const password = document.getElementById('regPassword').value;
    const phone = document.getElementById('regPhone')?.value.trim() || '';
    const loader = document.getElementById('regLoader');
    const btn = document.getElementById('registerBtn');

    // Validation
    if (!name || !email || !password || !phone) {
        showMessage('registerMessage', 'All fields are required including mobile number', 'error');
        return;
    }

    if (password.length < 6) {
        showMessage('registerMessage', 'Password must be at least 6 characters', 'error');
        return;
    }

    // Phone validation
    if (!validatePhone()) {
        showMessage('registerMessage', 'Please enter a valid mobile number (e.g. +919876543210)', 'error');
        return;
    }

    loader.style.display = 'block';
    btn.disabled = true;
    clearMessages();

    try {
        const res = await fetch('/api/auth/register', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, password, phone }) // ← phone bheja
        });

        const data = await res.json();
        loader.style.display = 'none';
        btn.disabled = false;

        if (res.ok) {
            showMessage('registerMessage', 
                'Account created successfully! Please check your email for the verification link. You can login after verification.', 
                'success'
            );
            
            // Clear form
            document.getElementById('regName').value = '';
            document.getElementById('regEmail').value = '';
            document.getElementById('regPassword').value = '';
            document.getElementById('regPhone').value = '';
        } else {
            showMessage('registerMessage', data.message || 'Registration failed. Try again.', 'error');
        }
    } catch (err) {
        loader.style.display = 'none';
        btn.disabled = false;
        showMessage('registerMessage', 'Network error. Please try again.', 'error');
        console.error('Registration error:', err);
    }
});

/* =========================
   FORGOT PASSWORD HANDLER
========================= */
document.getElementById('forgotBtn').addEventListener('click', async () => {
    const email = document.getElementById('forgotEmail').value.trim();
    const loader = document.getElementById('forgotLoader');
    const btn = document.getElementById('forgotBtn');

    if (!email) {
        showMessage('forgotMessage', 'Please enter your email', 'error');
        return;
    }

    loader.style.display = 'block';
    btn.disabled = true;
    clearMessages();

    try {
        const res = await fetch('/api/auth/forgot', {
            method: 'POST',
            credentials: 'include',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email })
        });

        const data = await res.json();
        loader.style.display = 'none';
        btn.disabled = false;

        showMessage('forgotMessage', data.message, res.ok ? 'success' : 'error');

        if (res.ok) {
            document.getElementById('forgotEmail').value = '';
        }
    } catch (err) {
        loader.style.display = 'none';
        btn.disabled = false;
        showMessage('forgotMessage', 'Network error. Please try again.', 'error');
        console.error('Forgot password error:', err);
    }
});

/* =========================
   ENTER KEY SUBMIT
========================= */
document.getElementById('loginEmail').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

document.getElementById('loginPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('loginBtn').click();
});

document.getElementById('regPassword').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('registerBtn').click();
});

document.getElementById('forgotEmail').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') document.getElementById('forgotBtn').click();
});

/* =========================
   FLOATING TECH ICONS (Existing – No Change)
========================= */
function getIconCount() {
    const w = window.innerWidth;
    if (w >= 1440) return 28;
    if (w >= 1200) return 22;
    if (w >= 992) return 18;
    if (w >= 768) return 14;
    if (w >= 480) return 10;
    return 7;
}

function createIcons() {
    if (!techLayer) return;
    
    techLayer.innerHTML = '';
    iconsOnScreen.length = 0;

    const ICON_COUNT = getIconCount();

    for (let i = 0; i < ICON_COUNT; i++) {
        const data = techIcons[Math.floor(Math.random() * techIcons.length)];

        const el = document.createElement('i');
        el.className = `fa-brands ${data.icon} tech-icon ${data.glow}`;

        el.style.left = Math.random() * 100 + 'vw';
        el.style.top = Math.random() * 100 + 'vh';

        const baseSpeed = window.innerWidth < 768 ? 32 : 22;
        el.style.animationDuration = baseSpeed + Math.random() * 18 + 's';
        el.style.animationDelay = Math.random() * -20 + 's';

        techLayer.appendChild(el);
        iconsOnScreen.push(el);
    }
}

/* Mouse proximity glow effect */
document.addEventListener('mousemove', (e) => {
    iconsOnScreen.forEach(icon => {
        const rect = icon.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;

        const dist = Math.hypot(e.clientX - cx, e.clientY - cy);

        if (dist < 160) {
            icon.classList.add('active');
        } else {
            icon.classList.remove('active');
        }
    });
});

/* Initialize icons */
createIcons();

/* Regenerate on resize (debounced) */
let resizeTimer;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(createIcons, 300);
});