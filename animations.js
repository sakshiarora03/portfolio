/* ═══════════════════════════════════════════════════════════════════════════
   SAKSHI ARORA - PORTFOLIO
   Animations - GSAP ScrollTrigger & Animation Effects
   CORRECTED VERSION - All selectors match HTML structure
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   1. GSAP REGISTRATION & CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

gsap.config({
    nullTargetWarn: false,
    trialWarn: false,
});

const EASE = {
    smooth: 'power2.out',
    smoothInOut: 'power2.inOut',
    bounce: 'back.out(1.7)',
    elastic: 'elastic.out(1, 0.5)',
    expo: 'expo.out',
    expoInOut: 'expo.inOut',
    power4: 'power4.out',
    power4InOut: 'power4.inOut',
};

const DURATION = {
    fast: 0.3,
    normal: 0.6,
    slow: 0.9,
    verySlow: 1.2,
};

const STAGGER = {
    fast: 0.05,
    normal: 0.1,
    slow: 0.15,
    text: 0.03,
};


/* ═══════════════════════════════════════════════════════════════════════════
   2. ANIMATION UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

const AnimUtils = {
    isGSAPReady() {
        return typeof gsap !== 'undefined' && typeof ScrollTrigger !== 'undefined';
    },

    fadeIn(element, options = {}) {
        const defaults = {
            duration: DURATION.normal,
            opacity: 0,
            y: 30,
            ease: EASE.power4,
            delay: 0,
        };
        const config = { ...defaults, ...options };
        return gsap.from(element, {
            duration: config.duration,
            opacity: config.opacity,
            y: config.y,
            ease: config.ease,
            delay: config.delay,
        });
    },

    fadeInStagger(elements, options = {}) {
        const defaults = {
            duration: DURATION.normal,
            opacity: 0,
            y: 40,
            ease: EASE.power4,
            stagger: STAGGER.normal,
            delay: 0,
        };
        const config = { ...defaults, ...options };
        return gsap.from(elements, {
            duration: config.duration,
            opacity: config.opacity,
            y: config.y,
            ease: config.ease,
            stagger: config.stagger,
            delay: config.delay,
        });
    },

    scrollReveal(element, animationProps = {}, triggerProps = {}) {
        const defaultAnimation = {
            duration: DURATION.normal,
            opacity: 0,
            y: 60,
            ease: EASE.power4,
        };
        const defaultTrigger = {
            trigger: element,
            start: 'top 85%',
            end: 'bottom 15%',
            toggleActions: 'play none none reverse',
        };
        return gsap.from(element, {
            ...defaultAnimation,
            ...animationProps,
            scrollTrigger: {
                ...defaultTrigger,
                ...triggerProps,
            },
        });
    },

    killAll() {
        ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    },

    refresh() {
        ScrollTrigger.refresh();
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   3. INTERACTIVE HERO ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const HeroAnimations = {
    timeline: null,
    isAnimated: false,

    init() {
        if (window.PortfolioApp && window.PortfolioApp.Utils) {
            window.PortfolioApp.Utils.on('loaderComplete', () => {
                this.animate();
            });
        } else {
            setTimeout(() => this.animate(), 2500);
        }
    },

    animate() {
        if (this.isAnimated) return;
        this.isAnimated = true;

        this.timeline = gsap.timeline({
            defaults: { ease: EASE.power4 },
        });

        this.splitHeroName();

        this.timeline
            .to('.hero-name-line .char', {
                opacity: 1,
                y: 0,
                duration: DURATION.slow,
                stagger: STAGGER.text,
            }, 0)
            .to('.interactive-subtitle', {
                opacity: 1,
                y: 0,
                duration: DURATION.slow,
            }, 0.4)
            .to('.interactive-hint', {
                opacity: 1,
                y: 0,
                duration: DURATION.normal,
            }, 0.6)
            .to('.scroll-cta', {
                opacity: 1,
                y: 0,
                duration: DURATION.normal,
            }, 0.8);

        return this.timeline;
    },

    splitHeroName() {
        const heroNameLine = document.querySelector('.hero-name-line');
        if (!heroNameLine) return;

        const text = heroNameLine.textContent;
        heroNameLine.innerHTML = '';
        heroNameLine.setAttribute('aria-label', text);

        text.split('').forEach((char) => {
            const span = document.createElement('span');
            span.className = 'char';
            span.textContent = char === ' ' ? '\u00A0' : char;
            span.style.display = 'inline-block';
            span.setAttribute('aria-hidden', 'true');
            heroNameLine.appendChild(span);
        });

        gsap.set('.hero-name-line .char', { opacity: 0, y: '100%' });
        gsap.set('.interactive-subtitle', { opacity: 0, y: 20 });
        gsap.set('.interactive-hint', { opacity: 0, y: 20 });
        gsap.set('.scroll-cta', { opacity: 0, y: 20 });
    },

    replay() {
        this.isAnimated = false;
        gsap.set('.hero-name-line .char', { opacity: 0, y: '100%' });
        gsap.set('.interactive-subtitle', { opacity: 0, y: 20 });
        gsap.set('.interactive-hint', { opacity: 0, y: 20 });
        gsap.set('.scroll-cta', { opacity: 0, y: 20 });
        this.animate();
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   4. COUNTER ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const CounterAnimations = {
    animated: new Set(),

    init() {
        this.observeCounters();
    },

    observeCounters() {
        const counters = document.querySelectorAll('.stat-value[data-count]');

        if (!counters.length) return;

        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    this.animateCounter(entry.target);
                }
            });
        }, { threshold: 0.5 });

        counters.forEach(counter => observer.observe(counter));
    },

    animateCounter(element) {
        if (this.animated.has(element)) return;
        this.animated.add(element);

        const target = parseFloat(element.dataset.count);
        const isDecimal = element.dataset.decimal === 'true';
        const suffix = element.dataset.suffix || '';
        const duration = 2;

        const counter = { value: 0 };

        gsap.to(counter, {
            value: target,
            duration: duration,
            ease: EASE.expo,
            onUpdate: () => {
                if (isDecimal) {
                    element.textContent = counter.value.toFixed(2);
                } else {
                    element.textContent = Math.floor(counter.value) + suffix;
                }
            },
            onComplete: () => {
                if (isDecimal) {
                    element.textContent = target.toFixed(2);
                } else {
                    element.textContent = Math.floor(target) + suffix;
                }
            },
        });
    },

    reset() {
        this.animated.clear();
        const counters = document.querySelectorAll('.stat-value[data-count]');
        counters.forEach(counter => {
            counter.textContent = '0';
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   5. SECTION HEADER ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const SectionHeaderAnimations = {
    init() {
        const headers = document.querySelectorAll('.section-header');

        headers.forEach(header => {
            const number = header.querySelector('.section-number');
            const label = header.querySelector('.section-label');
            const title = header.querySelector('.section-title');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: header,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            });

            if (number) {
                tl.from(number, {
                    opacity: 0,
                    x: -20,
                    duration: DURATION.normal,
                    ease: EASE.power4,
                }, 0);
            }

            if (label) {
                tl.from(label, {
                    opacity: 0,
                    x: -30,
                    duration: DURATION.normal,
                    ease: EASE.power4,
                }, 0.1);
            }

            if (title) {
                tl.from(title, {
                    opacity: 0,
                    y: 40,
                    duration: DURATION.slow,
                    ease: EASE.power4,
                }, 0.2);
            }
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   6. ABOUT SECTION ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const AboutAnimations = {
    init() {
        this.animateIDCard();
        this.animateBio();
        this.animateTerminal();
        this.animateQuickStats();
    },

    animateIDCard() {
        const idCard = document.getElementById('id-card');
        if (!idCard) return;

        gsap.from(idCard, {
            scrollTrigger: {
                trigger: idCard,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            scale: 0.9,
            y: 50,
            duration: DURATION.slow,
            ease: EASE.power4,
        });
    },

    animateBio() {
        const bioParagraphs = document.querySelectorAll('.about-bio p');
        if (!bioParagraphs.length) return;

        gsap.from(bioParagraphs, {
            scrollTrigger: {
                trigger: '.about-bio',
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 30,
            duration: DURATION.normal,
            stagger: STAGGER.slow,
            ease: EASE.power4,
        });
    },

    animateTerminal() {
        const terminal = document.querySelector('.terminal');
        if (!terminal) return;

        gsap.from(terminal, {
            scrollTrigger: {
                trigger: terminal,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 40,
            duration: DURATION.normal,
            ease: EASE.power4,
        });
    },

    animateQuickStats() {
        const statsContainer = document.querySelector('.quick-stats');
        if (!statsContainer) return;

        const stats = statsContainer.querySelectorAll('.stat-card');

        gsap.from(stats, {
            scrollTrigger: {
                trigger: statsContainer,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 30,
            scale: 0.95,
            duration: DURATION.normal,
            stagger: STAGGER.normal,
            ease: EASE.power4,
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   7. TIMELINE (EDUCATION) ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const TimelineAnimations = {
    init() {
        this.animateTimelineItems();
        this.animateTimelineLine();
    },

    animateTimelineItems() {
        const timelineItems = document.querySelectorAll('.timeline-item');

        timelineItems.forEach((item) => {
            const dot = item.querySelector('.timeline-dot');
            const content = item.querySelector('.timeline-content');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: item,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
            });

            if (dot) {
                tl.from(dot, {
                    scale: 0,
                    duration: DURATION.fast,
                    ease: EASE.bounce,
                }, 0);
            }

            if (content) {
                tl.from(content, {
                    opacity: 0,
                    x: 50,
                    duration: DURATION.normal,
                    ease: EASE.power4,
                }, 0.1);
            }
        });
    },

    animateTimelineLine() {
        const timeline = document.querySelector('.timeline');
        if (!timeline) return;

        gsap.fromTo(timeline,
            { '--line-progress': '0%' },
            {
                '--line-progress': '100%',
                ease: 'none',
                scrollTrigger: {
                    trigger: timeline,
                    start: 'top 80%',
                    end: 'bottom 20%',
                    scrub: 1,
                },
            }
        );
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   8. SKILLS SECTION ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const SkillsAnimations = {
    init() {
        this.animateSkillCards();
        this.animateSkillPills();
    },

    animateSkillCards() {
        const cards = document.querySelectorAll('.skill-card');
        if (!cards.length) return;

        gsap.from(cards, {
            scrollTrigger: {
                trigger: '.skills-grid',
                start: 'top 75%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 80,
            rotateX: 15,
            transformOrigin: 'top center',
            duration: DURATION.slow,
            stagger: {
                amount: 0.4,
                from: 'start',
            },
            ease: EASE.power4,
        });

        const icons = document.querySelectorAll('.skill-icon');
        gsap.from(icons, {
            scrollTrigger: {
                trigger: '.skills-grid',
                start: 'top 75%',
                toggleActions: 'play none none reverse',
            },
            scale: 0,
            rotation: -180,
            duration: DURATION.normal,
            stagger: {
                amount: 0.4,
                from: 'start',
            },
            ease: EASE.bounce,
            delay: 0.3,
        });

        cards.forEach(card => {
            const items = card.querySelectorAll('.skill-list li');
            gsap.from(items, {
                scrollTrigger: {
                    trigger: card,
                    start: 'top 80%',
                    toggleActions: 'play none none reverse',
                },
                opacity: 0,
                x: -20,
                duration: DURATION.fast,
                stagger: STAGGER.fast,
                ease: EASE.power4,
                delay: 0.4,
            });
        });
    },

    animateSkillPills() {
        const pillsContainer = document.querySelector('.skills-extra');
        if (!pillsContainer) return;

        const pills = pillsContainer.querySelectorAll('.skill-tag');

        gsap.from(pills, {
            scrollTrigger: {
                trigger: pillsContainer,
                start: 'top 85%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            scale: 0.5,
            duration: DURATION.fast,
            stagger: {
                amount: 0.6,
                from: 'random',
            },
            ease: EASE.bounce,
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   9. PROJECTS SECTION ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const ProjectsAnimations = {
    init() {
        this.animateProjectCards();
        this.animateCarouselNav();
    },

    animateProjectCards() {
        const cards = document.querySelectorAll('.project-card');

        cards.forEach((card) => {
            const visual = card.querySelector('.project-visual');
            const tags = card.querySelectorAll('.project-tags .project-tag');
            const title = card.querySelector('.project-title');
            const description = card.querySelector('.project-description');
            const link = card.querySelector('.project-link');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    scroller: '.projects-track',
                    horizontal: true,
                    start: 'left 85%',
                    toggleActions: 'play none none reverse',
                },
            });

            tl.from(card, {
                opacity: 0,
                y: 100,
                scale: 0.9,
                duration: DURATION.slow,
                ease: EASE.power4,
            }, 0);

            if (visual) {
                tl.from(visual, {
                    opacity: 0,
                    scale: 1.1,
                    duration: DURATION.normal,
                    ease: EASE.smooth,
                }, 0.2);
            }

            if (tags.length) {
                tl.from(tags, {
                    opacity: 0,
                    y: 10,
                    duration: DURATION.fast,
                    stagger: STAGGER.fast,
                    ease: EASE.power4,
                }, 0.4);
            }

            if (title) {
                tl.from(title, {
                    opacity: 0,
                    y: 20,
                    duration: DURATION.fast,
                    ease: EASE.power4,
                }, 0.5);
            }

            if (description) {
                tl.from(description, {
                    opacity: 0,
                    y: 15,
                    duration: DURATION.fast,
                    ease: EASE.power4,
                }, 0.55);
            }

            if (link) {
                tl.from(link, {
                    opacity: 0,
                    x: -20,
                    duration: DURATION.fast,
                    ease: EASE.power4,
                }, 0.6);
            }
        });
    },

    animateCarouselNav() {
        const nav = document.querySelector('.carousel-nav');
        if (!nav) return;

        const buttons = nav.querySelectorAll('.carousel-btn');

        gsap.from(buttons, {
            scrollTrigger: {
                trigger: nav,
                start: 'top 90%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            scale: 0,
            duration: DURATION.normal,
            stagger: STAGGER.normal,
            ease: EASE.bounce,
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   10. CERTIFICATIONS ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const CertificationsAnimations = {
    init() {
        this.animateCertCards();
        this.animateAchievementCard();
    },

    animateCertCards() {
        const cards = document.querySelectorAll('.cert-card');

        cards.forEach((card) => {
            const icon = card.querySelector('.cert-icon');
            const title = card.querySelector('.cert-title');
            const issuer = card.querySelector('.cert-issuer');

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: card,
                    start: 'top 85%',
                    toggleActions: 'play none none reverse',
                },
            });

            tl.from(card, {
                opacity: 0,
                x: -50,
                duration: DURATION.normal,
                ease: EASE.power4,
            }, 0);

            if (icon) {
                tl.from(icon, {
                    opacity: 0,
                    scale: 0,
                    rotation: -45,
                    duration: DURATION.fast,
                    ease: EASE.bounce,
                }, 0.2);
            }

            if (title) {
                tl.from(title, {
                    opacity: 0,
                    y: 10,
                    duration: DURATION.fast,
                    ease: EASE.power4,
                }, 0.3);
            }

            if (issuer) {
                tl.from(issuer, {
                    opacity: 0,
                    duration: DURATION.fast,
                    ease: EASE.power4,
                }, 0.35);
            }
        });
    },

    animateAchievementCard() {
        const card = document.querySelector('.achievement-card');
        if (!card) return;

        const rank = card.querySelector('.achievement-rank');
        const title = card.querySelector('.achievement-title');
        const description = card.querySelector('.achievement-description');
        const badge = card.querySelector('.achievement-badge');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
        });

        tl.from(card, {
            opacity: 0,
            y: 60,
            scale: 0.95,
            duration: DURATION.slow,
            ease: EASE.power4,
        }, 0);

        if (rank) {
            tl.from(rank, {
                opacity: 0,
                scale: 0.5,
                duration: DURATION.normal,
                ease: EASE.bounce,
            }, 0.2);
        }

        if (title) {
            tl.from(title, {
                opacity: 0,
                y: 20,
                duration: DURATION.fast,
                ease: EASE.power4,
            }, 0.4);
        }

        if (description) {
            tl.from(description, {
                opacity: 0,
                y: 15,
                duration: DURATION.fast,
                ease: EASE.power4,
            }, 0.5);
        }

        if (badge) {
            tl.from(badge, {
                opacity: 0,
                scale: 0,
                duration: DURATION.fast,
                ease: EASE.bounce,
            }, 0.6);
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   11. CONTACT SECTION ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const ContactAnimations = {
    init() {
        this.animateContactMethods();
        this.animateResumeCard();
    },

    animateContactMethods() {
        // Removed effects to ensure visibility and prevent loading issues
    },

    animateResumeCard() {
        // Removed effects to ensure visibility and prevent loading issues
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   12. PARALLAX EFFECTS
   ═══════════════════════════════════════════════════════════════════════════ */

const ParallaxEffects = {
    init() {
        this.scrollCTAParallax();
    },

    scrollCTAParallax() {
        const scrollCta = document.querySelector('.scroll-cta');
        if (!scrollCta) return;

        gsap.to(scrollCta, {
            scrollTrigger: {
                trigger: '.interactive-hero',
                start: 'top top',
                end: '30% top',
                scrub: true,
            },
            opacity: 0,
            y: -30,
            ease: 'none',
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   13. SCROLL-TRIGGERED REVEALS
   ═══════════════════════════════════════════════════════════════════════════ */

const ScrollReveals = {
    init() {
        this.revealSections();
        this.revealFooter();
    },

    revealSections() {
        const sections = document.querySelectorAll('section');

        sections.forEach(section => {
            ScrollTrigger.create({
                trigger: section,
                start: 'top 80%',
                onEnter: () => section.classList.add('in-view'),
                onLeaveBack: () => section.classList.remove('in-view'),
            });
        });
    },

    revealFooter() {
        const footer = document.querySelector('.footer');
        if (!footer) return;

        const content = footer.querySelector('.footer-content');
        const links = footer.querySelectorAll('.footer-links a');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: footer,
                start: 'top 95%',
                toggleActions: 'play none none reverse',
            },
        });

        if (content) {
            tl.from(content, {
                opacity: 0,
                y: 20,
                duration: DURATION.normal,
                ease: EASE.power4,
            }, 0);
        }

        if (links.length) {
            tl.from(links, {
                opacity: 0,
                y: 10,
                duration: DURATION.fast,
                stagger: STAGGER.fast,
                ease: EASE.power4,
            }, 0.2);
        }
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   14. PAGE TRANSITION EFFECTS
   ═══════════════════════════════════════════════════════════════════════════ */

const PageTransitions = {
    init() {
        window.scrollTo(0, 0);
        this.handleInitialHash();
    },

    handleInitialHash() {
        const hash = window.location.hash;
        if (!hash) return;

        setTimeout(() => {
            const target = document.querySelector(hash);
            if (target) {
                const isMobile = window.innerWidth <= 768;
                const offset = isMobile ? 70 : 20;
                const offsetTop = target.getBoundingClientRect().top + window.pageYOffset;

                gsap.to(window, {
                    duration: DURATION.slow,
                    scrollTo: {
                        y: offsetTop - offset,
                        autoKill: false,
                    },
                    ease: EASE.power4InOut,
                });
            }
        }, 2500);
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   15. BOTTOM NAVIGATION ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const BottomNavAnimations = {
    init() {
        const bottomNav = document.querySelector('.bottom-nav');
        if (!bottomNav) return;

        gsap.from(bottomNav, {
            y: 100,
            opacity: 0,
            duration: DURATION.slow,
            ease: EASE.power4,
            delay: 2.5,
        });
    },
};


/* ═══════════════════════════════════════════════════════════════════════════
   GITHUB SECTION ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

const GitHubAnimations = {
    init() {
        this.animateProfileCard();
        this.animateContributionCard();
    },

    animateProfileCard() {
        const card = document.querySelector('.gh-profile-card');
        if (!card) return;

        const avatar = card.querySelector('.gh-avatar');
        const stats = card.querySelectorAll('.gh-stat-item');
        const btn = card.querySelector('.gh-profile-btn');

        const tl = gsap.timeline({
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
        });

        tl.from(card, {
            opacity: 0,
            y: 60,
            scale: 0.95,
            duration: DURATION.slow,
            ease: EASE.power4,
        }, 0);

        if (avatar) {
            tl.from(avatar, {
                opacity: 0,
                scale: 0,
                duration: DURATION.normal,
                ease: EASE.bounce,
            }, 0.2);
        }

        if (stats.length) {
            tl.from(stats, {
                opacity: 0,
                y: 20,
                duration: DURATION.fast,
                stagger: STAGGER.fast,
                ease: EASE.power4,
            }, 0.4);
        }

        if (btn) {
            tl.from(btn, {
                opacity: 0,
                y: 15,
                duration: DURATION.fast,
                ease: EASE.power4,
            }, 0.6);
        }
    },

    animateContributionCard() {
        const card = document.querySelector('.gh-contribution-card');
        if (!card) return;

        gsap.from(card, {
            scrollTrigger: {
                trigger: card,
                start: 'top 80%',
                toggleActions: 'play none none reverse',
            },
            opacity: 0,
            y: 60,
            duration: DURATION.slow,
            ease: EASE.power4,
        });
    },
};

/* ═══════════════════════════════════════════════════════════════════════════
   16. INITIALIZE ALL ANIMATIONS
   ═══════════════════════════════════════════════════════════════════════════ */

function initializeAnimations() {
    if (!AnimUtils.isGSAPReady()) {
        console.warn('GSAP or ScrollTrigger not loaded. Animations disabled.');
        return;
    }

    // Initialize all animation modules
    // Disabled all entrance effects to ensure content is fully visible immediately
    // HeroAnimations.init();
    CounterAnimations.init();
    // SectionHeaderAnimations.init();
    // AboutAnimations.init();
    // TimelineAnimations.init();
    // SkillsAnimations.init();
    // ProjectsAnimations.init();
    // CertificationsAnimations.init();
    // ContactAnimations.init();
    // GitHubAnimations.init(); // Disabled to maintain global load visibility
    // ParallaxEffects.init();
    // ScrollReveals.init();
    PageTransitions.init();
    // BottomNavAnimations.init();

    // Refresh ScrollTrigger after all animations are set up
    ScrollTrigger.refresh();

    console.log('%c🎬 Animations Initialized', 'color: #87a878; font-size: 12px;');
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAnimations);
} else {
    initializeAnimations();
}

// Handle resize
window.addEventListener('resize', () => {
    clearTimeout(window.animationResizeTimeout);
    window.animationResizeTimeout = setTimeout(() => {
        ScrollTrigger.refresh();
    }, 250);
});


/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

window.PortfolioAnimations = {
    AnimUtils,
    HeroAnimations,
    CounterAnimations,
    SectionHeaderAnimations,
    AboutAnimations,
    TimelineAnimations,
    SkillsAnimations,
    ProjectsAnimations,
    CertificationsAnimations,
    ContactAnimations,
    ParallaxEffects,
    ScrollReveals,
    PageTransitions,
    BottomNavAnimations,
    EASE,
    DURATION,
    STAGGER,
};
