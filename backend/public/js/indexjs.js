console.log("Index JS loaded");

/* =========================
   TYPING EFFECT (HERO)
========================= */
document.addEventListener("DOMContentLoaded", () => {
    const words = [
        "Website & App",
        "SaaS Platform",
        "Startup",
        "Web App",
        "Mobile App"
    ];

    const textEl = document.getElementById("typing-text");
    
    if (!textEl) return; // Safety check
    
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let started = false;

    function typeEffect() {
        const currentWord = words[wordIndex];

        if (!isDeleting) {
            textEl.textContent = currentWord.slice(0, charIndex++);
            if (charIndex > currentWord.length) {
                setTimeout(() => isDeleting = true, 1200);
            }
        } else {
            textEl.textContent = currentWord.slice(0, charIndex--);
            if (charIndex === 0) {
                isDeleting = false;
                wordIndex = (wordIndex + 1) % words.length;
            }
        }

        setTimeout(typeEffect, isDeleting ? 60 : 90);
    }

    // Scroll Trigger
    const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !started) {
                started = true;
                typeEffect();
            }
        });
    }, { threshold: 0.6 });

    const heroTitle = document.querySelector(".hero-title");
    if (heroTitle) {
        observer.observe(heroTitle);
    }
});
/* =========================
   PRICING CALCULATOR
========================= */
function calculate() {
    const pages = document.getElementById('pages').value;
    const base = document.getElementById('projectType').value;
    const tech = document.getElementById('tech').value;

    const price = pages * base * tech;
    document.getElementById('price').innerText = price;
    return price;
}

// Auto-calculate on input change
document.addEventListener('DOMContentLoaded', () => {
    const pricingInputs = document.querySelectorAll('#pages, #projectType, #tech');
    if (pricingInputs.length > 0) {
        pricingInputs.forEach(el => el.addEventListener('input', calculate));
        calculate(); // Initial calculation
    }
});

/* =========================
   FAQ ACCORDION
========================= */
document.addEventListener('DOMContentLoaded', () => {
    const faqItems = document.querySelectorAll(".faq-item");

    faqItems.forEach(item => {
        const question = item.querySelector(".faq-q");
        const answer = item.querySelector(".faq-a");

        if (!question || !answer) return;

        // Reset on load
        answer.style.maxHeight = null;

        question.addEventListener("click", (e) => {
            e.stopPropagation();

            // Close all other FAQs
            faqItems.forEach(other => {
                if (other !== item) {
                    other.classList.remove("active");
                    const otherAnswer = other.querySelector(".faq-a");
                    if (otherAnswer) {
                        otherAnswer.style.maxHeight = null;
                    }
                }
            });

            // Toggle current
            const isOpen = item.classList.contains("active");
            item.classList.toggle("active");

            if (!isOpen) {
                answer.style.maxHeight = answer.scrollHeight + "px";
            } else {
                answer.style.maxHeight = null;
            }
        });
    });
});

/* =========================
   NOTE: openOrder() and closeOrder() functions
   are now in main.js with auth protection
========================= */