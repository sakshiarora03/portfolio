/* ═══════════════════════════════════════════════════════════════════════════
   SAKSHI ARORA - PORTFOLIO
   Main JavaScript - Core Interactions & Functionality
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   1. GLOBAL STATE & CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

const App = {
    state: {
        isLoaded: false,
        isLoading: true,
        isMobile: false,
        isTouch: false,
        scrollY: 0,
        mouseX: 0,
        mouseY: 0,
        cursorX: 0,
        cursorY: 0,
        cursorRingX: 0,
        cursorRingY: 0,
        activeSection: '',
    },

    config: {
        mobileBreakpoint: 768,
        tabletBreakpoint: 1024,
        loaderDuration: 2200,
        cursorLerpFactor: 0.15,
        cursorRingLerpFactor: 0.08,
        magneticStrength: 0.3,
        tiltMaxAngle: 8,
    },

    elements: {},
    animationFrames: {},
    observers: {},
};


/* ═══════════════════════════════════════════════════════════════════════════
   2. UTILITY FUNCTIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const Utils = {
    lerp(start, end, factor) {
        return start + (end - start) * factor;
    },

    clamp(num, min, max) {
        return Math.min(Math.max(num, min), max);
    },

    map(value, inMin, inMax, outMin, outMax) {
        return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
    },

    debounce(func, wait, immediate = false) {
        let timeout;
        return function executedFunction(...args) {
            const context = this;
            const later = () => {
                timeout = null;
                if (!immediate) func.apply(context, args);
            };
            const callNow = immediate && !timeout;
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
            if (callNow) func.apply(context, args);
        };
    },

    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            const context = this;
            if (!inThrottle) {
                func.apply(context, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    isTouchDevice() {
        return (
            'ontouchstart' in window ||
            navigator.maxTouchPoints > 0 ||
            navigator.msMaxTouchPoints > 0
        );
    },

    isMobileDevice() {
        return window.innerWidth <= App.config.mobileBreakpoint;
    },

    getOffset(element) {
        const rect = element.getBoundingClientRect();
        return {
            top: rect.top + window.pageYOffset,
            left: rect.left + window.pageXOffset,
            width: rect.width,
            height: rect.height,
        };
    },

    isInViewport(element, threshold = 0) {
        if (!element) return false;
        const rect = element.getBoundingClientRect();
        return (
            rect.top <= (window.innerHeight || document.documentElement.clientHeight) + threshold &&
            rect.bottom >= -threshold &&
            rect.left <= (window.innerWidth || document.documentElement.clientWidth) + threshold &&
            rect.right >= -threshold
        );
    },

    emit(eventName, detail = {}) {
        window.dispatchEvent(new CustomEvent(eventName, { detail }));
    },

    on(eventName, callback) {
        window.addEventListener(eventName, callback);
    },

    off(eventName, callback) {
        window.removeEventListener(eventName, callback);
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   3. DOM ELEMENTS CACHE
   ═══════════════════════════════════════════════════════════════════════════ */

function cacheElements() {
    App.elements = {
        // Cursor
        cursorDot: document.getElementById('cursor-dot'),
        cursorRing: document.getElementById('cursor-ring'),

        // Progress & Loader
        scrollProgress: document.getElementById('scroll-progress'),
        loader: document.getElementById('loader'),

        // Top Navigation (Mobile)
        nav: document.getElementById('nav'),
        navToggle: document.getElementById('nav-toggle'),
        mobileMenu: document.getElementById('mobile-menu'),
        mobileMenuLinks: document.querySelectorAll('.mobile-menu-link'),
        navLinks: document.querySelectorAll('.nav-link'),

        // Bottom Navigation (Desktop)
        bottomNav: document.getElementById('bottom-nav'),
        bottomNavLinks: document.querySelectorAll('.bottom-nav-link'),

        // Hero
        interactiveCanvas: document.getElementById('interactive-canvas'),
        heroNameLine: document.querySelector('.hero-name-line'),

        // About Section
        idCard: document.getElementById('id-card'),
        lanyardCanvas: document.getElementById('lanyard-canvas'),
        terminal: document.querySelector('.terminal'),
        terminalLines: document.querySelectorAll('.terminal-line'),

        // Stats
        statValues: document.querySelectorAll('.stat-value[data-count]'),

        // Skills Section
        skillsCanvas: document.getElementById('skills-canvas'),

        // Projects Carousel
        projectsTrack: document.getElementById('projects-track'),
        carouselPrev: document.getElementById('carousel-prev'),
        carouselNext: document.getElementById('carousel-next'),

        // Interactive elements
        glassCards: document.querySelectorAll('.glass-card'),
        magneticElements: document.querySelectorAll('.magnetic'),
        tiltElements: document.querySelectorAll('[data-tilt]'),
        buttons: document.querySelectorAll('.btn'),
        tags: document.querySelectorAll('.tag'),
        socialLinks: document.querySelectorAll('.social-link'),

        // Sections
        sections: document.querySelectorAll('section[id]'),
        sectionHeaders: document.querySelectorAll('.section-header'),
    };
}


/* ═══════════════════════════════════════════════════════════════════════════
   4. CUSTOM CURSOR
   ═══════════════════════════════════════════════════════════════════════════ */

const Cursor = {
    isVisible: true,
    isHovering: false,
    isClicking: false,

    init() {
        if (App.state.isTouch || App.state.isMobile) {
            this.hide();
            document.body.style.cursor = 'auto';
            return;
        }

        this.bindEvents();
        this.render();
    },

    bindEvents() {
        document.addEventListener('mousemove', (e) => {
            App.state.mouseX = e.clientX;
            App.state.mouseY = e.clientY;
        });

        document.addEventListener('mouseenter', () => this.show());
        document.addEventListener('mouseleave', () => this.hide());

        document.addEventListener('mousedown', () => this.onMouseDown());
        document.addEventListener('mouseup', () => this.onMouseUp());

        this.bindHoverEvents();
    },

    bindHoverEvents() {
        const interactiveElements = [
            ...App.elements.buttons,
            ...App.elements.glassCards,
            ...App.elements.tags,
            ...App.elements.socialLinks,
            ...App.elements.navLinks,
            ...App.elements.mobileMenuLinks,
            ...App.elements.bottomNavLinks,
            ...document.querySelectorAll('a'),
            ...document.querySelectorAll('button'),
        ];

        interactiveElements.forEach(el => {
            if (!el) return;
            el.addEventListener('mouseenter', () => this.onHoverStart());
            el.addEventListener('mouseleave', () => this.onHoverEnd());
        });
    },

    show() {
        this.isVisible = true;
        if (App.elements.cursorDot) {
            App.elements.cursorDot.style.opacity = '1';
        }
        if (App.elements.cursorRing) {
            App.elements.cursorRing.style.opacity = '0.6';
        }
    },

    hide() {
        this.isVisible = false;
        if (App.elements.cursorDot) {
            App.elements.cursorDot.style.opacity = '0';
        }
        if (App.elements.cursorRing) {
            App.elements.cursorRing.style.opacity = '0';
        }
    },

    onMouseDown() {
        this.isClicking = true;
        if (App.elements.cursorRing) {
            App.elements.cursorRing.classList.add('click');
        }
    },

    onMouseUp() {
        this.isClicking = false;
        if (App.elements.cursorRing) {
            App.elements.cursorRing.classList.remove('click');
        }
    },

    onHoverStart() {
        this.isHovering = true;
        if (App.elements.cursorRing) {
            App.elements.cursorRing.classList.add('hover');
        }
    },

    onHoverEnd() {
        this.isHovering = false;
        if (App.elements.cursorRing) {
            App.elements.cursorRing.classList.remove('hover');
        }
    },

    render() {
        App.state.cursorX = Utils.lerp(
            App.state.cursorX,
            App.state.mouseX,
            App.config.cursorLerpFactor
        );
        App.state.cursorY = Utils.lerp(
            App.state.cursorY,
            App.state.mouseY,
            App.config.cursorLerpFactor
        );

        App.state.cursorRingX = Utils.lerp(
            App.state.cursorRingX,
            App.state.mouseX,
            App.config.cursorRingLerpFactor
        );
        App.state.cursorRingY = Utils.lerp(
            App.state.cursorRingY,
            App.state.mouseY,
            App.config.cursorRingLerpFactor
        );

        if (App.elements.cursorDot) {
            App.elements.cursorDot.style.left = `${App.state.cursorX}px`;
            App.elements.cursorDot.style.top = `${App.state.cursorY}px`;
        }

        if (App.elements.cursorRing) {
            App.elements.cursorRing.style.left = `${App.state.cursorRingX}px`;
            App.elements.cursorRing.style.top = `${App.state.cursorRingY}px`;
        }

        App.animationFrames.cursor = requestAnimationFrame(() => this.render());
    },

    destroy() {
        if (App.animationFrames.cursor) {
            cancelAnimationFrame(App.animationFrames.cursor);
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   5. SCROLL PROGRESS BAR
   ═══════════════════════════════════════════════════════════════════════════ */

const ScrollProgress = {
    init() {
        this.update();
        window.addEventListener('scroll', Utils.throttle(() => this.update(), 10));
    },

    update() {
        const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
        const scrollHeight = document.documentElement.scrollHeight - window.innerHeight;
        const progress = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0;

        App.state.scrollY = scrollTop;

        if (App.elements.scrollProgress) {
            App.elements.scrollProgress.style.width = `${progress}%`;
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   6. LOADER
   ═══════════════════════════════════════════════════════════════════════════ */

const Loader = {
    init() {
        setTimeout(() => this.hide(), App.config.loaderDuration);
    },

    hide() {
        if (App.elements.loader) {
            App.elements.loader.classList.add('hidden');

            App.state.isLoaded = true;
            App.state.isLoading = false;

            Utils.emit('loaderComplete');

            // Start terminal animation after short delay
            setTimeout(() => {
                TerminalAnimation.start();
            }, 800);

            setTimeout(() => {
                if (App.elements.loader) {
                    App.elements.loader.style.display = 'none';
                }
            }, 700);
        }
    },

    show() {
        if (App.elements.loader) {
            App.elements.loader.style.display = 'flex';
            App.elements.loader.classList.remove('hidden');
            App.state.isLoaded = false;
            App.state.isLoading = true;
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   7. TOP NAVIGATION (Mobile Only)
   ═══════════════════════════════════════════════════════════════════════════ */

const Navigation = {
    lastScrollY: 0,
    isScrolled: false,

    init() {
        this.bindEvents();
        this.checkScroll();
    },

    bindEvents() {
        window.addEventListener('scroll', Utils.throttle(() => this.checkScroll(), 50));
        window.addEventListener('scroll', Utils.throttle(() => this.updateActiveSection(), 100));
    },

    checkScroll() {
        const scrollY = window.pageYOffset;

        if (scrollY > 50 && !this.isScrolled) {
            this.isScrolled = true;
            App.elements.nav?.classList.add('scrolled');
        } else if (scrollY <= 50 && this.isScrolled) {
            this.isScrolled = false;
            App.elements.nav?.classList.remove('scrolled');
        }

        this.lastScrollY = scrollY;
    },

    updateActiveSection() {
        const sections = App.elements.sections;
        if (!sections.length) return;

        let currentSection = '';
        const scrollPosition = window.pageYOffset + 200;

        sections.forEach(section => {
            const sectionTop = section.offsetTop;
            const sectionHeight = section.offsetHeight;
            const sectionId = section.getAttribute('id');

            if (scrollPosition >= sectionTop && scrollPosition < sectionTop + sectionHeight) {
                currentSection = sectionId;
            }
        });

        if (currentSection && currentSection !== App.state.activeSection) {
            App.state.activeSection = currentSection;

            // Update mobile nav links
            App.elements.navLinks.forEach(link => {
                link.classList.remove('active');
                if (link.getAttribute('href') === `#${currentSection}`) {
                    link.classList.add('active');
                }
            });

            // Update bottom nav
            BottomNavigation.setActive(currentSection);
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   8. BOTTOM NAVIGATION (Desktop - Dock Style)
   ═══════════════════════════════════════════════════════════════════════════ */

const BottomNavigation = {
    init() {
        if (!App.elements.bottomNav) return;

        this.bindEvents();
        this.initMagnification();
    },

    bindEvents() {
        App.elements.bottomNavLinks.forEach(link => {
            link.addEventListener('click', (e) => this.handleClick(e, link));
        });
    },

    handleClick(e, link) {
        const href = link.getAttribute('href');

        // Skip if it's a download link
        if (link.hasAttribute('download')) return;

        if (!href || href === '#' || !href.startsWith('#')) return;

        e.preventDefault();

        const target = document.querySelector(href);
        if (!target) return;

        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;
        const offset = 30;

        window.scrollTo({
            top: offsetTop - offset,
            behavior: 'smooth'
        });

        history.pushState(null, '', href);
    },

    setActive(sectionId) {
        if (!App.elements.bottomNavLinks) return;

        App.elements.bottomNavLinks.forEach(link => {
            link.classList.remove('active');
            const href = link.getAttribute('href');
            if (href === `#${sectionId}`) {
                link.classList.add('active');
            }
        });
    },

    initMagnification() {
        const nav = App.elements.bottomNav;
        const links = Array.from(App.elements.bottomNavLinks);

        if (!nav || !links.length) return;

        nav.addEventListener('mousemove', (e) => {
            const navRect = nav.getBoundingClientRect();
            const mouseX = e.clientX - navRect.left;

            links.forEach((link, index) => {
                const linkRect = link.getBoundingClientRect();
                const linkCenterX = linkRect.left - navRect.left + linkRect.width / 2;
                const distance = Math.abs(mouseX - linkCenterX);
                const maxDistance = 80;

                if (distance < maxDistance) {
                    const scale = Utils.map(distance, 0, maxDistance, 1.3, 1);
                    const translateY = Utils.map(distance, 0, maxDistance, -6, 0);

                    if (!link.classList.contains('active')) {
                        link.style.transform = `scale(${scale}) translateY(${translateY}px)`;
                    }
                } else {
                    if (!link.classList.contains('active')) {
                        link.style.transform = '';
                    }
                }
            });
        });

        nav.addEventListener('mouseleave', () => {
            links.forEach(link => {
                if (!link.classList.contains('active')) {
                    link.style.transform = '';
                }
            });
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   9. MOBILE MENU
   ═══════════════════════════════════════════════════════════════════════════ */

const MobileMenu = {
    isOpen: false,

    init() {
        this.bindEvents();
    },

    bindEvents() {
        if (App.elements.navToggle) {
            App.elements.navToggle.addEventListener('click', () => this.toggle());
        }

        App.elements.mobileMenuLinks.forEach(link => {
            link.addEventListener('click', () => this.close());
        });

        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isOpen) {
                this.close();
            }
        });

        window.addEventListener('resize', Utils.debounce(() => {
            if (window.innerWidth > App.config.mobileBreakpoint && this.isOpen) {
                this.close();
            }
        }, 200));
    },

    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    },

    open() {
        this.isOpen = true;
        App.elements.navToggle?.classList.add('active');
        App.elements.mobileMenu?.classList.add('active');
        document.body.style.overflow = 'hidden';
    },

    close() {
        this.isOpen = false;
        App.elements.navToggle?.classList.remove('active');
        App.elements.mobileMenu?.classList.remove('active');
        document.body.style.overflow = '';
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   10. MAGNETIC EFFECT
   ═══════════════════════════════════════════════════════════════════════════ */

const MagneticEffect = {
    init() {
        if (App.state.isTouch || App.state.isMobile) return;
        this.bindEvents();
    },

    bindEvents() {
        App.elements.magneticElements.forEach(el => {
            el.addEventListener('mousemove', (e) => this.onMouseMove(e, el));
            el.addEventListener('mouseleave', (e) => this.onMouseLeave(e, el));
        });
    },

    onMouseMove(e, el) {
        const rect = el.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const deltaX = (e.clientX - centerX) * App.config.magneticStrength;
        const deltaY = (e.clientY - centerY) * App.config.magneticStrength;

        el.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        el.style.transition = 'transform 0.2s ease-out';
    },

    onMouseLeave(e, el) {
        el.style.transform = 'translate(0, 0)';
        el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   11. TILT EFFECT
   ═══════════════════════════════════════════════════════════════════════════ */

const TiltEffect = {
    init() {
        if (App.state.isTouch || App.state.isMobile) return;
        this.bindEvents();
    },

    bindEvents() {
        App.elements.tiltElements.forEach(el => {
            el.addEventListener('mouseenter', () => this.onMouseEnter(el));
            el.addEventListener('mousemove', (e) => this.onMouseMove(e, el));
            el.addEventListener('mouseleave', () => this.onMouseLeave(el));
        });
    },

    onMouseEnter(el) {
        el.style.transition = 'none';
    },

    onMouseMove(e, el) {
        const rect = el.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        const centerX = rect.width / 2;
        const centerY = rect.height / 2;

        const maxAngle = App.config.tiltMaxAngle;

        const rotateX = ((y - centerY) / centerY) * -maxAngle;
        const rotateY = ((x - centerX) / centerX) * maxAngle;

        const percentX = (x / rect.width) * 100;
        const percentY = (y / rect.height) * 100;

        el.style.setProperty('--mouse-x', `${percentX}%`);
        el.style.setProperty('--mouse-y', `${percentY}%`);

        el.style.transform = `
            perspective(1000px) 
            rotateX(${rotateX}deg) 
            rotateY(${rotateY}deg) 
            scale3d(1.02, 1.02, 1.02)
        `;
    },

    onMouseLeave(el) {
        el.style.transition = 'transform 0.5s cubic-bezier(0.34, 1.56, 0.64, 1)';
        el.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)';
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   12. PROJECTS CAROUSEL
   ═══════════════════════════════════════════════════════════════════════════ */

const Carousel = {
    track: null,
    cards: [],
    isDragging: false,
    startX: 0,
    scrollLeft: 0,

    init() {
        this.track = App.elements.projectsTrack;
        if (!this.track) return;

        this.cards = this.track.querySelectorAll('.project-card');
        if (!this.cards.length) return;

        this.bindEvents();
    },

    bindEvents() {
        if (App.elements.carouselPrev) {
            App.elements.carouselPrev.addEventListener('click', () => this.prev());
        }

        if (App.elements.carouselNext) {
            App.elements.carouselNext.addEventListener('click', () => this.next());
        }

        this.track.addEventListener('mousedown', (e) => this.onDragStart(e));
        this.track.addEventListener('mousemove', (e) => this.onDragMove(e));
        this.track.addEventListener('mouseup', () => this.onDragEnd());
        this.track.addEventListener('mouseleave', () => this.onDragEnd());

        this.track.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: true });
        this.track.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: true });
        this.track.addEventListener('touchend', () => this.onDragEnd());
    },

    getCardWidth() {
        if (!this.cards.length) return 0;
        const card = this.cards[0];
        const gap = parseInt(window.getComputedStyle(this.track).gap) || 20;
        return card.offsetWidth + gap;
    },

    prev() {
        const cardWidth = this.getCardWidth();
        this.track.scrollBy({
            left: -cardWidth,
            behavior: 'smooth'
        });
    },

    next() {
        const cardWidth = this.getCardWidth();
        this.track.scrollBy({
            left: cardWidth,
            behavior: 'smooth'
        });
    },

    onDragStart(e) {
        this.isDragging = true;
        this.startX = e.pageX - this.track.offsetLeft;
        this.scrollLeft = this.track.scrollLeft;
        this.track.style.cursor = 'grabbing';
        this.track.style.userSelect = 'none';
    },

    onDragMove(e) {
        if (!this.isDragging) return;
        e.preventDefault();

        const x = e.pageX - this.track.offsetLeft;
        const walk = (x - this.startX) * 1.5;
        this.track.scrollLeft = this.scrollLeft - walk;
    },

    onDragEnd() {
        this.isDragging = false;
        this.track.style.cursor = 'grab';
        this.track.style.userSelect = '';
    },

    onTouchStart(e) {
        this.startX = e.touches[0].pageX - this.track.offsetLeft;
        this.scrollLeft = this.track.scrollLeft;
    },

    onTouchMove(e) {
        const x = e.touches[0].pageX - this.track.offsetLeft;
        const walk = (x - this.startX) * 1.5;
        this.track.scrollLeft = this.scrollLeft - walk;
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   13. SMOOTH SCROLL
   ═══════════════════════════════════════════════════════════════════════════ */

const SmoothScroll = {
    init() {
        this.bindEvents();
    },

    bindEvents() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', (e) => this.onClick(e, anchor));
        });
    },

    onClick(e, anchor) {
        const href = anchor.getAttribute('href');
        if (!href || href === '#') return;

        if (anchor.hasAttribute('download')) return;

        const target = document.querySelector(href);
        if (!target) return;

        e.preventDefault();

        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;
        const offset = App.state.isMobile ? (App.elements.nav?.offsetHeight || 70) : 30;

        window.scrollTo({
            top: offsetTop - offset,
            behavior: 'smooth'
        });

        history.pushState(null, '', href);

        if (MobileMenu.isOpen) {
            MobileMenu.close();
        }
    },

    scrollTo(selector, offset = 0) {
        const target = document.querySelector(selector);
        if (!target) return;

        const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;
        const navOffset = App.state.isMobile ? (App.elements.nav?.offsetHeight || 70) : 30;

        window.scrollTo({
            top: offsetTop - navOffset + offset,
            behavior: 'smooth'
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   14. TERMINAL ANIMATION
   ═══════════════════════════════════════════════════════════════════════════ */

const TerminalAnimation = {
    lines: [],
    currentLine: 0,
    isAnimating: false,
    hasStarted: false,

    init() {
        this.lines = Array.from(App.elements.terminalLines || []);
    },

    start() {
        if (this.hasStarted || !this.lines.length) return;
        this.hasStarted = true;
        this.isAnimating = true;
        this.animateNextLine();
    },

    animateNextLine() {
        if (this.currentLine >= this.lines.length) {
            this.isAnimating = false;
            return;
        }

        const line = this.lines[this.currentLine];
        const delay = parseFloat(line.dataset.delay) || this.currentLine;

        setTimeout(() => {
            line.classList.add('visible');
            this.currentLine++;
            this.animateNextLine();
        }, delay * 150 + 100);
    },

    reset() {
        this.currentLine = 0;
        this.isAnimating = false;
        this.hasStarted = false;
        this.lines.forEach(line => {
            line.classList.remove('visible');
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   15. ID CARD PHYSICS (Syncs with Lanyard Canvas)
   ═══════════════════════════════════════════════════════════════════════════ */

const IDCardPhysics = {
    card: null,
    wrapper: null,
    mouse: { x: 0, y: 0 },
    rotation: { x: 0, y: 0 },
    isActive: false,
    time: 0,

    init() {
        this.card = App.elements.idCard;
        this.wrapper = document.getElementById('lanyard-wrapper');

        if (!this.card || !this.wrapper || App.state.isMobile) return;

        this.bindEvents();
        this.render();
    },

    bindEvents() {
        this.wrapper.addEventListener('mousemove', (e) => {
            const rect = this.wrapper.getBoundingClientRect();
            this.mouse.x = (e.clientX - rect.left) / rect.width - 0.5;
            this.mouse.y = (e.clientY - rect.top) / rect.height - 0.5;
            this.isActive = true;
        });

        this.wrapper.addEventListener('mouseleave', () => {
            this.isActive = false;
        });
    },

    render() {
        this.time += 0.016; // ~60fps

        if (this.card) {
            // Lerp rotation based on mouse
            const targetX = this.isActive ? this.mouse.y * -12 : 0;
            const targetY = this.isActive ? this.mouse.x * 12 : 0;

            this.rotation.x = Utils.lerp(this.rotation.x, targetX, 0.08);
            this.rotation.y = Utils.lerp(this.rotation.y, targetY, 0.08);

            // Subtle floating effect
            const floatY = Math.sin(this.time * 0.8) * 4;
            const floatRotate = Math.sin(this.time * 0.5) * 1.5;

            // NOTE: We only apply rotation here - position is handled by canvas-scenes.js LanyardScene
            // This avoids conflict between two systems trying to position the same element
            this.card.style.transform = `
                translateX(-50%)
                translateY(${floatY}px)
                rotateX(${this.rotation.x}deg)
                rotateY(${this.rotation.y + floatRotate}deg)
            `;
        }

        requestAnimationFrame(() => this.render());
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   16. RESIZE HANDLER
   ═══════════════════════════════════════════════════════════════════════════ */

const ResizeHandler = {
    init() {
        this.update();
        window.addEventListener('resize', Utils.debounce(() => this.update(), 200));
    },

    update() {
        const wasMobile = App.state.isMobile;

        App.state.isMobile = Utils.isMobileDevice();
        App.state.isTouch = Utils.isTouchDevice();

        Utils.emit('appResize', {
            width: window.innerWidth,
            height: window.innerHeight,
            isMobile: App.state.isMobile,
            wasMobile: wasMobile,
        });

        if (wasMobile !== App.state.isMobile) {
            Utils.emit('breakpointChange', {
                isMobile: App.state.isMobile,
            });
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   17. VISIBILITY OBSERVER
   ═══════════════════════════════════════════════════════════════════════════ */

const VisibilityObserver = {
    init() {
        this.observeSections();
        this.observeAboutSection();
        this.observeCanvases();
    },

    observeSections() {
        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.1,
        };

        const callback = (entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.id;

                Utils.emit('sectionVisibility', {
                    sectionId: sectionId,
                    isVisible: entry.isIntersecting,
                    intersectionRatio: entry.intersectionRatio,
                });

                if (entry.isIntersecting) {
                    entry.target.classList.add('in-view');
                }
            });
        };

        App.observers.sections = new IntersectionObserver(callback, options);

        App.elements.sections.forEach(section => {
            App.observers.sections.observe(section);
        });
    },

    observeAboutSection() {
        const aboutSection = document.getElementById('about');
        if (!aboutSection) return;

        const options = {
            root: null,
            rootMargin: '0px',
            threshold: 0.2,
        };

        const callback = (entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !TerminalAnimation.hasStarted) {
                    TerminalAnimation.start();
                }
            });
        };

        App.observers.about = new IntersectionObserver(callback, options);
        App.observers.about.observe(aboutSection);
    },

    observeCanvases() {
        const canvasSections = ['interactive-hero', 'skills'];

        const options = {
            root: null,
            rootMargin: '100px',
            threshold: 0,
        };

        const callback = (entries) => {
            entries.forEach(entry => {
                const sectionId = entry.target.id;

                Utils.emit('canvasVisibility', {
                    sectionId: sectionId,
                    isVisible: entry.isIntersecting,
                });
            });
        };

        App.observers.canvases = new IntersectionObserver(callback, options);

        canvasSections.forEach(id => {
            const section = document.getElementById(id);
            if (section) {
                App.observers.canvases.observe(section);
            }
        });
    },

    destroy() {
        Object.values(App.observers).forEach(observer => {
            if (observer) observer.disconnect();
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   18. BUTTON EFFECTS
   ═══════════════════════════════════════════════════════════════════════════ */

const ButtonEffects = {
    init() {
        this.addRippleEffect();
    },

    addRippleEffect() {
        App.elements.buttons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                const rect = btn.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                const ripple = document.createElement('span');
                ripple.className = 'btn-ripple';
                ripple.style.cssText = `
                    position: absolute;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    transform: scale(0);
                    animation: ripple 0.6s linear;
                    pointer-events: none;
                    left: ${x}px;
                    top: ${y}px;
                    width: 20px;
                    height: 20px;
                    margin-left: -10px;
                    margin-top: -10px;
                `;

                btn.style.position = 'relative';
                btn.style.overflow = 'hidden';
                btn.appendChild(ripple);

                setTimeout(() => ripple.remove(), 600);
            });
        });

        if (!document.getElementById('ripple-styles')) {
            const style = document.createElement('style');
            style.id = 'ripple-styles';
            style.textContent = `
                @keyframes ripple {
                    to {
                        transform: scale(20);
                        opacity: 0;
                    }
                }
            `;
            document.head.appendChild(style);
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   19. TAG EFFECTS
   ═══════════════════════════════════════════════════════════════════════════ */

const TagEffects = {
    init() {
        if (App.state.isTouch) return;

        App.elements.tags.forEach(tag => {
            tag.addEventListener('mouseenter', () => {
                tag.style.transform = 'translateY(-2px) scale(1.05)';
            });

            tag.addEventListener('mouseleave', () => {
                tag.style.transform = 'translateY(0) scale(1)';
            });
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   20. CONTACT METHOD EFFECTS
   ═══════════════════════════════════════════════════════════════════════════ */

const ContactEffects = {
    init() {
        if (App.state.isTouch || App.state.isMobile) return;

        const contactMethods = document.querySelectorAll('.contact-method');

        contactMethods.forEach(method => {
            method.addEventListener('mousemove', (e) => {
                const rect = method.getBoundingClientRect();
                const x = e.clientX - rect.left;
                const y = e.clientY - rect.top;

                method.style.setProperty('--glow-x', `${x}px`);
                method.style.setProperty('--glow-y', `${y}px`);
            });
        });

        if (!document.getElementById('contact-glow-styles')) {
            const style = document.createElement('style');
            style.id = 'contact-glow-styles';
            style.textContent = `
                .contact-method::after {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(
                        250px circle at var(--glow-x, 50%) var(--glow-y, 50%),
                        rgba(212, 166, 83, 0.12),
                        transparent 40%
                    );
                    opacity: 0;
                    transition: opacity 0.3s;
                    pointer-events: none;
                    border-radius: inherit;
                    z-index: 0;
                }
                .contact-method:hover::after {
                    opacity: 1;
                }
            `;
            document.head.appendChild(style);
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   21. KEYBOARD NAVIGATION
   ═══════════════════════════════════════════════════════════════════════════ */

const KeyboardNav = {
    init() {
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
    },

    handleKeyDown(e) {
        if (e.key === 'Escape') {
            if (MobileMenu.isOpen) {
                MobileMenu.close();
            }
        }

        const projectsSection = document.getElementById('projects');
        if (projectsSection && Utils.isInViewport(projectsSection)) {
            if (e.key === 'ArrowLeft') {
                Carousel.prev();
            }
            if (e.key === 'ArrowRight') {
                Carousel.next();
            }
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   22. PERFORMANCE MONITOR (Debug Only)
   ═══════════════════════════════════════════════════════════════════════════ */

const PerformanceMonitor = {
    enabled: false,

    init() {
        if (!this.enabled) return;

        this.createDisplay();
        this.startMonitoring();
    },

    createDisplay() {
        const display = document.createElement('div');
        display.id = 'perf-monitor';
        display.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            background: rgba(0, 0, 0, 0.85);
            color: #00ff00;
            font-family: monospace;
            font-size: 11px;
            padding: 10px;
            border-radius: 6px;
            z-index: 99999;
            pointer-events: none;
            line-height: 1.5;
        `;
        document.body.appendChild(display);
        this.display = display;
    },

    startMonitoring() {
        let frames = 0;
        let lastTime = performance.now();

        const update = () => {
            frames++;
            const currentTime = performance.now();

            if (currentTime >= lastTime + 1000) {
                const fps = Math.round((frames * 1000) / (currentTime - lastTime));
                const memory = performance.memory
                    ? Math.round(performance.memory.usedJSHeapSize / 1048576)
                    : 'N/A';

                this.display.innerHTML = `
                    FPS: ${fps}<br>
                    Memory: ${memory} MB<br>
                    Section: ${App.state.activeSection || 'hero'}
                `;

                frames = 0;
                lastTime = currentTime;
            }

            requestAnimationFrame(update);
        };

        requestAnimationFrame(update);
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   23. INITIALIZE APP
   ═══════════════════════════════════════════════════════════════════════════ */

function initializeApp() {
    // Detect device capabilities
    App.state.isMobile = Utils.isMobileDevice();
    App.state.isTouch = Utils.isTouchDevice();

    // Cache DOM elements
    cacheElements();

    // Initialize all modules
    Loader.init();
    ScrollProgress.init();
    Navigation.init();
    BottomNavigation.init();
    MobileMenu.init();
    ResizeHandler.init();
    Cursor.init();
    MagneticEffect.init();
    TiltEffect.init();
    Carousel.init();
    SmoothScroll.init();
    TerminalAnimation.init();
    IDCardPhysics.init();
    VisibilityObserver.init();
    ButtonEffects.init();
    TagEffects.init();
    ContactEffects.init();
    KeyboardNav.init();
    GitHubIntegration.init();
    PerformanceMonitor.init();

    // Log initialization
    console.log('%c✨ Portfolio Initialized', 'color: #d4a653; font-size: 14px; font-weight: bold;');
    console.log('%cBuilt by Sakshi Arora', 'color: #e07a5f; font-size: 12px;');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}



/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

window.PortfolioApp = {
    App,
    Utils,
    Cursor,
    ScrollProgress,
    Loader,
    Navigation,
    BottomNavigation,
    MobileMenu,
    MagneticEffect,
    TiltEffect,
    Carousel,
    SmoothScroll,
    TerminalAnimation,
    IDCardPhysics,
};

/* ═══════════════════════════════════════════════════════════════════════════
   GITHUB API INTEGRATION
   ═══════════════════════════════════════════════════════════════════════════ */

const GitHubIntegration = {
    username: 'SakshiArora', // Change this to actual GitHub username

    init() {
        this.fetchProfile();
        this.generateContributionGraph();
    },

    async fetchProfile() {
        try {
            const response = await fetch(`https://api.github.com/users/${this.username}`);

            if (!response.ok) {
                this.setFallbackData();
                return;
            }

            const data = await response.json();

            // Update avatar
            const avatarImg = document.getElementById('gh-avatar-img');
            // if (avatarImg && data.avatar_url) {
            //     avatarImg.src = data.avatar_url;
            //     avatarImg.alt = `${data.login} GitHub avatar`;
            // }

            // Update username
            const usernameEl = document.getElementById('gh-username-text');
            if (usernameEl) usernameEl.textContent = data.login || this.username;

            // Update bio
            const bioEl = document.getElementById('gh-bio');
            if (bioEl && data.bio) bioEl.textContent = data.bio;

            // Update stats with animation
            this.animateStat('gh-repos', data.public_repos || 0);
            this.animateStat('gh-followers', data.followers || 0);
            this.animateStat('gh-following', data.following || 0);

            // Update profile link
            const profileBtn = document.querySelector('.gh-profile-btn');
            if (profileBtn && data.html_url) {
                profileBtn.href = data.html_url;
            }

        } catch (error) {
            console.warn('GitHub API fetch failed:', error);
            this.setFallbackData();
        }
    },

    setFallbackData() {
        const reposEl = document.getElementById('gh-repos');
        const followersEl = document.getElementById('gh-followers');
        const followingEl = document.getElementById('gh-following');

        if (reposEl) reposEl.textContent = '3+';
        if (followersEl) followersEl.textContent = '--';
        if (followingEl) followingEl.textContent = '--';
    },

    animateStat(elementId, targetValue) {
        const element = document.getElementById(elementId);
        if (!element || typeof gsap === 'undefined') {
            if (element) element.textContent = targetValue;
            return;
        }

        const counter = { value: 0 };
        gsap.to(counter, {
            value: targetValue,
            duration: 1.5,
            ease: 'expo.out',
            delay: 0.5,
            onUpdate: () => {
                element.textContent = Math.floor(counter.value);
            },
            onComplete: () => {
                element.textContent = targetValue;
            },
        });
    },

    generateContributionGraph() {
        const graphEl = document.getElementById('gh-graph');
        if (!graphEl) return;

        // Generate a simulated contribution graph (52 weeks)
        const weeks = 52;
        const daysPerWeek = 7;

        const grid = document.createElement('div');
        grid.className = 'gh-contribution-grid';

        let totalContributions = 0;

        for (let w = 0; w < weeks; w++) {
            const weekEl = document.createElement('div');
            weekEl.className = 'gh-contribution-week';

            for (let d = 0; d < daysPerWeek; d++) {
                const dayEl = document.createElement('div');
                dayEl.className = 'gh-contribution-day';

                // Simulate contribution levels (0-4)
                let level = 0;
                const rand = Math.random();

                if (rand > 0.7) level = 1;
                if (rand > 0.82) level = 2;
                if (rand > 0.9) level = 3;
                if (rand > 0.96) level = 4;

                // Make recent weeks more active
                if (w > 40) {
                    const recentRand = Math.random();
                    if (recentRand > 0.5) level = Math.min(level + 1, 4);
                }

                dayEl.setAttribute('data-level', level);

                if (level > 0) {
                    totalContributions += level;
                }

                // Tooltip data
                const date = new Date();
                date.setDate(date.getDate() - ((weeks - w) * 7 + (daysPerWeek - d)));
                dayEl.title = `${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}`;

                weekEl.appendChild(dayEl);
            }

            grid.appendChild(weekEl);
        }

        // Replace loading with graph
        graphEl.innerHTML = '';
        graphEl.appendChild(grid);

        // Update total
        const totalEl = document.getElementById('gh-graph-total');
        if (totalEl) {
            totalEl.textContent = `${totalContributions} contributions in the last year`;
        }

        // Animate graph appearing
        if (typeof gsap !== 'undefined') {
            // const days = grid.querySelectorAll('.gh-contribution-day');
            // gsap.from(days, {
            //     scale: 0,
            //     opacity: 0,
            //     duration: 0.02,
            //     stagger: {
            //         amount: 1.5,
            //         from: 'start',
            //     },
            //     ease: 'power2.out',
            //     scrollTrigger: {
            //         trigger: graphEl,
            //         start: 'top 85%',
            //         toggleActions: 'play none none none',
            //     },
            // }); // Disabled to maintain global load visibility
        }
    },
};

