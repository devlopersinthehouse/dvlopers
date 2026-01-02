/* =========================
   LOADING SCREEN
========================= */
window.addEventListener('load', () => {
    const loadingScreen = document.getElementById('loadingScreen');
    const loadingProgress = document.getElementById('loadingProgress');
    const loadingText = document.getElementById('loadingText');

    // Safety check - agar elements nahi hain to skip karo
    if (!loadingScreen || !loadingProgress || !loadingText) {
        console.log('Loading screen elements not found - skipping');
        return;
    }

    let progress = 0;
    const interval = setInterval(() => {
        progress += Math.random() * 30;
        if (progress > 100) progress = 100;

        loadingProgress.style.width = progress + '%';
        loadingText.textContent = progress < 100 ? `Loading... ${Math.floor(progress)}%` : 'Ready!';

        if (progress >= 100) {
            clearInterval(interval);
            setTimeout(() => {
                loadingScreen.style.opacity = '0';
                setTimeout(() => {
                    loadingScreen.style.display = 'none';
                    document.body.style.overflow = 'auto';
                }, 500);
            }, 300);
        }
    }, 100);
});

// Prevent scroll during loading (only if loading screen exists)
if (document.getElementById('loadingScreen')) {
    document.body.style.overflow = 'hidden';
}

/* =========================
   SCROLL PROGRESS BAR
========================= */
window.addEventListener('scroll', () => {
    const scrollProgress = document.getElementById('scrollProgress');
    if (!scrollProgress) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const scrollHeight = document.documentElement.scrollHeight - document.documentElement.clientHeight;
    const scrollPercent = (scrollTop / scrollHeight) * 100;
    
    scrollProgress.style.width = scrollPercent + '%';
});

/* =========================
   BACK TO TOP BUTTON
========================= */
const backToTop = document.getElementById('backToTop');

if (backToTop) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            backToTop.classList.add('visible');
        } else {
            backToTop.classList.remove('visible');
        }
    });

    backToTop.addEventListener('click', () => {
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

/* =========================
   PAGE TRANSITIONS
========================= */
// Fade out on link click
document.addEventListener('DOMContentLoaded', () => {
    // Fade in page on load
    document.body.style.opacity = '0';
    setTimeout(() => {
        document.body.style.transition = 'opacity 0.5s ease';
        document.body.style.opacity = '1';
    }, 100);

    // Add transition to all internal links
    const links = document.querySelectorAll('a[href^="/"], a[href^="./"], a[href^="../"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            // Skip if it's a hash link (for same page navigation)
            if (href.startsWith('#')) return;
            
            // Skip if it's the current page
            if (href === window.location.pathname || href === './') return;

            e.preventDefault();
            
            document.body.style.opacity = '0';
            
            setTimeout(() => {
                window.location.href = href;
            }, 500);
        });
    });
});

/* =========================
   SMOOTH REVEAL ON SCROLL
========================= */
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.classList.add('reveal');
            observer.unobserve(entry.target);
        }
    });
}, observerOptions);

// Observe all sections
document.addEventListener('DOMContentLoaded', () => {
    const sections = document.querySelectorAll('section, .service-card, .faq-item');
    if (sections.length > 0) {
        sections.forEach(section => {
            section.classList.add('reveal-hidden');
            observer.observe(section);
        });
    }
});
