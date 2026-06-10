/* ==========================================================================
   Axiom Interactivity & Animations Script
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {

    // Initialize Scroll Reveal Animations
    initScrollReveal();

    // Initialize Sticky Navbar Hiding Behaviour
    initStickyNavbar();

    // Initialize Hero Badge Mouse Parallax
    initHeroMouseParallax();

    // Initialize Features Carousel
    initFeaturesCarousel();

    // Initialize Testimonials Slider
    initTestimonialsSlider();

    // Initialize Newsletter Form
    initNewsletterForm();

    // Initialize Scroll Progress Indicator
    initScrollProgress();

    // Initialize Mobile Menu
    initMobileMenu();

    // Initialize Magnetic CTA Buttons
    initMagneticButtons();

    // Initialize Stats Counter Animation
    initStatsCounter();
});

/* ==========================================================================
   1. Scroll Reveal Animations (Intersection Observer)
   ========================================================================== */
function initScrollReveal() {
    const revealElements = document.querySelectorAll(
        '.reveal-type, .reveal-fade-up, .reveal-left, .reveal-right, .reveal-scale, .reveal-fade'
    );

    const observerOptions = {
        root: null, // viewport
        threshold: 0.15, // trigger when 15% visible
        rootMargin: '0px 0px -50px 0px' // offset bottom slightly for natural feel
    };

    const revealObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                // Optional: Unobserve if we only want animate once
                revealObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    revealElements.forEach(el => {
        revealObserver.observe(el);
    });
}

/* ==========================================================================
   2. Sticky Navbar Hiding on Scroll Down
   ========================================================================== */
function initStickyNavbar() {
    const navbar = document.getElementById('main-navbar');
    let lastScrollY = window.scrollY;

    window.addEventListener('scroll', () => {
        const currentScrollY = window.scrollY;

        // Toggle background shadow class
        if (currentScrollY > 50) {
            navbar.classList.add('nav-scrolled');
        } else {
            navbar.classList.remove('nav-scrolled');
        }

        // Toggle visibility based on scroll direction
        if (currentScrollY > lastScrollY && currentScrollY > 150) {
            // Scrolling down - hide navbar
            navbar.classList.add('nav-hidden');
        } else {
            // Scrolling up - show navbar
            navbar.classList.remove('nav-hidden');
        }

        lastScrollY = currentScrollY;
    }, { passive: true });
}

/* ==========================================================================
   3. Hero Badge Mouse Movement Parallax
   ========================================================================== */
function initHeroMouseParallax() {
    const visualWrapper = document.querySelector('.hero-visual-wrapper');
    const heroSection = document.querySelector('.hero-section');
    if (!visualWrapper) return;

    const badgeYellow = document.getElementById('badge-yellow');
    const badgeDark = document.getElementById('badge-dark');
    const badgePink = document.getElementById('badge-pink');
    const badgeBlue = document.getElementById('badge-blue');
    const phoneDevice = document.getElementById('hero-phone-container');

    // Define multipliers for depth (higher value = moves more) and Z displacement
    const layers = [
        { el: badgeYellow, mult: 0.08, z: 40 },
        { el: badgeDark, mult: -0.06, z: 20 },
        { el: badgePink, mult: 0.05, z: 30 },
        { el: badgeBlue, mult: -0.04, z: 15 }
    ];

    // Background spotlight mapping
    if (heroSection) {
        heroSection.addEventListener('mousemove', (e) => {
            const rect = heroSection.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            heroSection.style.setProperty('--mouse-x', `${x}%`);
            heroSection.style.setProperty('--mouse-y', `${y}%`);
        }, { passive: true });
    }

    visualWrapper.addEventListener('mousemove', (e) => {
        const rect = visualWrapper.getBoundingClientRect();
        
        // Normalize mouse coordinates relative to visual wrapper center (-1 to 1)
        const relX = (e.clientX - rect.left - (rect.width / 2)) / (rect.width / 2);
        const relY = (e.clientY - rect.top - (rect.height / 2)) / (rect.height / 2);

        // Animate floating badges with translation, depth, and dynamic wobble
        layers.forEach(layer => {
            if (layer.el) {
                const moveX = relX * layer.mult * 100;
                const moveY = relY * layer.mult * 100;
                const rotZ = relX * 6; // Slight wobble
                layer.el.style.transform = `translate3d(${moveX}px, ${moveY}px, ${layer.z}px) rotateZ(${rotZ}deg)`;
            }
        });

        // Rotate the 3D phone model dynamically
        if (phoneDevice) {
            const rotX = 12 - (relY * 25); // Default pitch is 12deg, varies +/- 25deg
            const rotY = -18 + (relX * 30); // Default yaw is -18deg, varies +/- 30deg
            phoneDevice.style.transform = `rotateX(${rotX}deg) rotateY(${rotY}deg) rotateZ(0deg)`;
        }
    });

    // Reset offsets when mouse leaves wrapper
    visualWrapper.addEventListener('mouseleave', () => {
        layers.forEach(layer => {
            if (layer.el) {
                layer.el.style.transform = `translate3d(0px, 0px, 0px) rotateZ(0deg)`;
                layer.el.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
            }
        });
        
        if (phoneDevice) {
            phoneDevice.style.transform = `rotateX(12deg) rotateY(-18deg) rotateZ(0deg)`;
            phoneDevice.style.transition = 'transform 0.8s cubic-bezier(0.16, 1, 0.3, 1)';
        }

        // Remove transitions style after duration so mousemove is instantaneous again
        setTimeout(() => {
            layers.forEach(layer => {
                if (layer.el) {
                    layer.el.style.transition = '';
                }
            });
            if (phoneDevice) {
                phoneDevice.style.transition = '';
            }
        }, 800);
    });
}

/* ==========================================================================
   4. Features Section Carousel Slider
   ========================================================================== */
function initFeaturesCarousel() {
    const track = document.getElementById('features-track');
    const btnPrev = document.getElementById('features-prev');
    const btnNext = document.getElementById('features-next');
    
    if (!track || !btnPrev || !btnNext) return;

    let currentIndex = 0;
    const cards = track.querySelectorAll('.feature-card');
    const totalCards = cards.length;

    // Calculate maximum slide index
    function getMaxIndex() {
        const cardWidth = cards[0].offsetWidth + 30; // Card width + gap (30px)
        const wrapperWidth = track.parentElement.offsetWidth;
        const visibleCards = Math.floor(wrapperWidth / cardWidth) || 1;
        return Math.max(0, totalCards - visibleCards);
    }

    function slideTo(index) {
        const cardWidth = cards[0].offsetWidth + 30; // Width + gap
        const maxIndex = getMaxIndex();

        // Bound current index
        currentIndex = Math.min(Math.max(0, index), maxIndex);

        // Slide animation via css translation
        const translateAmt = -currentIndex * cardWidth;
        track.style.transform = `translate3d(${translateAmt}px, 0, 0)`;

        // Toggle disabled styling on nav buttons
        btnPrev.style.opacity = currentIndex === 0 ? '0.3' : '1';
        btnPrev.style.pointerEvents = currentIndex === 0 ? 'none' : 'auto';
        
        btnNext.style.opacity = currentIndex === maxIndex ? '0.3' : '1';
        btnNext.style.pointerEvents = currentIndex === maxIndex ? 'none' : 'auto';
    }

    btnPrev.addEventListener('click', () => {
        slideTo(currentIndex - 1);
    });

    btnNext.addEventListener('click', () => {
        slideTo(currentIndex + 1);
    });

    // Handle responsiveness adjustments on resize
    let resizeTimer;
    window.addEventListener('resize', () => {
        clearTimeout(resizeTimer);
        resizeTimer = setTimeout(() => {
            slideTo(currentIndex);
        }, 150);
    });

    // Initial state
    slideTo(0);
}

/* ==========================================================================
   5. Testimonials Carousel Slider
   ========================================================================== */
function initTestimonialsSlider() {
    const track = document.getElementById('testimonials-track');
    const dots = document.querySelectorAll('#testimonials-dots .dot');
    
    if (!track || dots.length === 0) return;

    let currentIndex = 0;
    const totalSlides = dots.length;
    let autoSlideInterval;

    function showSlide(index) {
        // Wrap index around boundaries
        currentIndex = (index + totalSlides) % totalSlides;

        // Slide track translation
        const translateAmt = -currentIndex * 100;
        track.style.transform = `translate3d(${translateAmt}%, 0, 0)`;

        // Update active class state on navigation dots
        dots.forEach((dot, idx) => {
            if (idx === currentIndex) {
                dot.classList.add('active');
            } else {
                dot.classList.remove('active');
            }
        });
    }

    // Attach click events on navigation dots
    dots.forEach((dot, idx) => {
        dot.addEventListener('click', () => {
            showSlide(idx);
            resetAutoSlide(); // Pause timer on click
        });
    });

    // Auto sliding timer setup
    function startAutoSlide() {
        autoSlideInterval = setInterval(() => {
            showSlide(currentIndex + 1);
        }, 6000); // changes every 6s
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    // Initialize auto slide
    startAutoSlide();
    
    // Pause auto slide on mouse interactions
    const container = document.getElementById('testimonials-slider-container');
    if (container) {
        container.addEventListener('mouseenter', () => clearInterval(autoSlideInterval));
        container.addEventListener('mouseleave', startAutoSlide);
    }
}

/* ==========================================================================
   6. Newsletter Signup form handling
   ========================================================================== */
function initNewsletterForm() {
    const form = document.getElementById('newsletter-form');
    const input = document.getElementById('newsletter-email');
    const successMsg = document.getElementById('newsletter-success');

    if (!form || !input || !successMsg) return;

    // Check pre-filled browser states
    const formGroup = input.parentElement;
    if (input.value !== '') {
        formGroup.classList.add('has-value');
    }

    input.addEventListener('focus', () => {
        formGroup.classList.add('has-value');
    });

    input.addEventListener('blur', () => {
        if (input.value === '') {
            formGroup.classList.remove('has-value');
        }
    });

    form.addEventListener('submit', (e) => {
        e.preventDefault();

        // Perform email validator checklist
        if (input.checkValidity() && document.getElementById('newsletter-consent').checked) {
            // Elegant submission transition
            form.style.opacity = '0';
            
            setTimeout(() => {
                form.classList.add('hidden');
                successMsg.style.display = 'block';
            }, 300);
        }
    });
}

/* ==========================================================================
   7. Scroll Progress Indicator Bar
   ========================================================================== */
function initScrollProgress() {
    const progressBar = document.getElementById('scroll-progress');
    if (!progressBar) return;

    window.addEventListener('scroll', () => {
        const scrollTotal = document.documentElement.scrollHeight - window.innerHeight;
        const scrollPercent = scrollTotal > 0 ? (window.scrollY / scrollTotal) * 100 : 0;
        progressBar.style.width = `${scrollPercent}%`;
    }, { passive: true });
}

/* ==========================================================================
   8. Fullscreen Mobile Navigation Menu
   ========================================================================== */
function initMobileMenu() {
    const toggle = document.getElementById('mobile-toggle');
    const menu = document.getElementById('mobile-menu');
    if (!toggle || !menu) return;

    const links = menu.querySelectorAll('.mobile-nav-link, .mobile-menu-cta');
    links.forEach((link, idx) => {
        link.style.setProperty('--idx', idx + 1);
    });

    function toggleMenu() {
        const isActive = menu.classList.toggle('active');
        document.body.classList.toggle('mobile-nav-active', isActive);
    }

    toggle.addEventListener('click', toggleMenu);
    
    // Close menu when links are clicked (scroll actions)
    links.forEach(link => {
        link.addEventListener('click', () => {
            menu.classList.remove('active');
            document.body.classList.remove('mobile-nav-active');
        });
    });
}

/* ==========================================================================
   9. Premium Magnetic CTA Buttons Pull Effect
   ========================================================================== */
function initMagneticButtons() {
    const magnetics = document.querySelectorAll('.btn-magnetic');
    if (window.innerWidth <= 768) return; // Disable magnetic pull on mobile touch

    magnetics.forEach(btn => {
        btn.addEventListener('mousemove', (e) => {
            const rect = btn.getBoundingClientRect();
            const x = e.clientX - rect.left - (rect.width / 2);
            const y = e.clientY - rect.top - (rect.height / 2);

            // Pull button 35% closer to cursor
            btn.style.transform = `translate3d(${x * 0.35}px, ${y * 0.35}px, 0)`;
            btn.style.transition = 'transform 0.1s ease-out';
        });

        btn.addEventListener('mouseleave', () => {
            // Smooth rebound layout reset
            btn.style.transform = 'translate3d(0px, 0px, 0px)';
            btn.style.transition = 'transform 0.5s cubic-bezier(0.16, 1, 0.3, 1)';
        });
    });
}

/* ==========================================================================
   10. Stats Bar Counter Animation
   ========================================================================== */
function initStatsCounter() {
    const statItems = document.querySelectorAll('.stat-item');
    if (!statItems.length) return;

    const observerOptions = {
        root: null,
        threshold: 0.5,
        rootMargin: '0px'
    };

    const counterObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    statItems.forEach(item => {
        counterObserver.observe(item);
    });
}
