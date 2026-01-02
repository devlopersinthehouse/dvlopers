// Smooth scroll with offset for fixed header
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const target = document.querySelector(this.getAttribute('href'));
        if (target) {
            const headerOffset = 70; // adjust if header has height
            const elementPosition = target.offsetTop;
            const offsetPosition = elementPosition - headerOffset;

            window.scrollTo({
                top: offsetPosition,
                behavior: 'smooth'
            });
        }
    });
});

// Side navigation menu toggle
function openMenu() {
    const sideNav = document.getElementById("sideNav");
    sideNav.classList.add("active");

    // delay so click that opened menu doesn't instantly close it
    setTimeout(() => {
        document.addEventListener("click", handleOutsideClick);
    }, 0);
}

function closeMenu() {
    const sideNav = document.getElementById("sideNav");
    sideNav.classList.remove("active");

    document.removeEventListener("click", handleOutsideClick);
}

function handleOutsideClick(e) {
    const sideNav = document.getElementById("sideNav");

    // if click is NOT inside sideNav → close
    if (!sideNav.contains(e.target)) {
        closeMenu();
    }
}

// background grid and dots animation

const canvas = document.getElementById("bgDots");
const ctx = canvas.getContext("2d");

let dots = [];
let mouse = { x: null, y: null };

function resizeCanvas() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    createDots();
}

function createDots() {
    dots = [];
    const count = Math.floor((canvas.width * canvas.height) / 16000);

    for (let i = 0; i < count; i++) {
        dots.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.2,
            vy: (Math.random() - 0.5) * 0.2,
            size: Math.random() * 1.5 + 0.5
        });
    }
}

function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    dots.forEach(dot => {
        // Floating motion
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        // Mouse interaction
        let glow = 0;
        if (mouse.x !== null) {
            const dx = mouse.x - dot.x;
            const dy = mouse.y - dot.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 120) {
                glow = (120 - dist) / 120;
                dot.x -= dx * 0.002;
                dot.y -= dy * 0.002;
            }
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${0.3 + glow})`;
        ctx.shadowBlur = glow * 14;
        ctx.shadowColor = "rgba(120,255,200,0.9)";
        ctx.fill();
        ctx.shadowBlur = 0;
    });

    requestAnimationFrame(animate);
}

/* Mouse tracking */
window.addEventListener("mousemove", e => {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
});

window.addEventListener("mouseleave", () => {
    mouse.x = null;
    mouse.y = null;
});

/* Resize */
window.addEventListener("resize", resizeCanvas);

/* Init */
resizeCanvas();
animate();
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