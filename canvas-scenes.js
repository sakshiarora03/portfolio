/* ═══════════════════════════════════════════════════════════════════════════
   SAKSHI ARORA - PORTFOLIO
   Canvas Scenes - 2D Canvas Animations
   
   This file contains 2D canvas animations:
   - Interactive Hero: Floating draggable shapes
   - Lanyard: Physics-based rope (HTML ID card is positioned by rope end)
   - Skills Network: Floating connected nodes
   ═══════════════════════════════════════════════════════════════════════════ */

/* ═══════════════════════════════════════════════════════════════════════════
   CONFIGURATION
   ═══════════════════════════════════════════════════════════════════════════ */

const CONFIG = {
    colors: {
        gold: 0xd4a653,
        goldRgb: { r: 212, g: 166, b: 83 },
        coral: 0xe07a5f,
        coralRgb: { r: 224, g: 122, b: 95 },
        sage: 0x87a878,
        sageRgb: { r: 135, g: 168, b: 120 },
        cream: 0xf4f0e8,
        creamRgb: { r: 244, g: 240, b: 232 },
        background: 0x08080c,
        backgroundRgb: { r: 8, g: 8, b: 12 },
    },

    interactive: {
        shapeCount: 15,
        maxSpeed: 2.5,
        friction: 0.97,
        mouseForce: 0.6,
        returnForce: 0.015,
        connectionDistance: 200,
    },

    lanyard: {
        segmentCount: 25,
        ropeLength: 180,
        gravity: 0.35,
        damping: 0.98,
        stiffness: 0.85,
    },

    network: {
        nodeCount: 30,
        connectionDistance: 150,
        nodeSpeed: 0.25,
    },
};

/* ═══════════════════════════════════════════════════════════════════════════
   UTILITIES
   ═══════════════════════════════════════════════════════════════════════════ */

const SceneUtils = {
    lerp: (a, b, t) => a + (b - a) * t,
    random: (min, max) => Math.random() * (max - min) + min,
    randomInt: (min, max) => Math.floor(Math.random() * (max - min + 1)) + min,
    distance: (x1, y1, x2, y2) => Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2),
    clamp: (val, min, max) => Math.min(Math.max(val, min), max),
    getPixelRatio: () => Math.min(window.devicePixelRatio, 2),

    isMobile: () => {
        return window.innerWidth <= 768 ||
            ('ontouchstart' in window) ||
            (navigator.maxTouchPoints > 0);
    },

    isReducedMotion: () => {
        return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    },
};

/* ═══════════════════════════════════════════════════════════════════════════
   INTERACTIVE HERO CANVAS - Floating Draggable Shapes
   ═══════════════════════════════════════════════════════════════════════════ */

class InteractiveHeroScene {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas #${canvasId} not found`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.isActive = true;
        this.shapes = [];
        this.mouse = { x: 0, y: 0, isDown: false, isDragging: false };
        this.draggedShape = null;
        this.time = 0;
        this.width = 0;
        this.height = 0;

        this.init();
    }

    init() {
        this.setupCanvas();
        this.createShapes();
        this.bindEvents();
        this.animate();
    }

    setupCanvas() {
        this.resize();
        window.addEventListener('resize', () => this.resize());
    }

    resize() {
        const dpr = SceneUtils.getPixelRatio();
        const rect = this.canvas.parentElement?.getBoundingClientRect() ||
            { width: window.innerWidth, height: window.innerHeight };

        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(dpr, dpr);

        if (this.shapes.length > 0) {
            this.repositionShapes();
        }
    }

    repositionShapes() {
        this.shapes.forEach(shape => {
            shape.x = SceneUtils.clamp(shape.x, shape.size, this.width - shape.size);
            shape.y = SceneUtils.clamp(shape.y, shape.size, this.height - shape.size);
            shape.originX = shape.x;
            shape.originY = shape.y;
        });
    }

    createShapes() {
        this.shapes = [];

        const shapeTypes = ['circle', 'ring', 'square', 'triangle', 'diamond', 'cross', 'dots'];
        const colors = [
            CONFIG.colors.goldRgb,
            CONFIG.colors.coralRgb,
            CONFIG.colors.sageRgb,
            CONFIG.colors.creamRgb,
        ];

        const count = SceneUtils.isMobile() ?
            Math.floor(CONFIG.interactive.shapeCount * 0.6) :
            CONFIG.interactive.shapeCount;

        for (let i = 0; i < count; i++) {
            const size = SceneUtils.random(25, 70);
            const padding = size + 50;

            const shape = {
                x: SceneUtils.random(padding, this.width - padding),
                y: SceneUtils.random(padding, this.height - padding),
                originX: 0,
                originY: 0,
                vx: SceneUtils.random(-0.3, 0.3),
                vy: SceneUtils.random(-0.3, 0.3),
                size: size,
                rotation: SceneUtils.random(0, Math.PI * 2),
                rotationSpeed: SceneUtils.random(-0.015, 0.015),
                type: shapeTypes[i % shapeTypes.length],
                color: colors[i % colors.length],
                alpha: SceneUtils.random(0.12, 0.3),
                pulseOffset: SceneUtils.random(0, Math.PI * 2),
                pulseSpeed: SceneUtils.random(1.5, 2.5),
            };

            shape.originX = shape.x;
            shape.originY = shape.y;

            this.shapes.push(shape);
        }
    }

    bindEvents() {
        this.canvas.addEventListener('mousedown', (e) => this.onMouseDown(e));
        this.canvas.addEventListener('mousemove', (e) => this.onMouseMove(e));
        this.canvas.addEventListener('mouseup', () => this.onMouseUp());
        this.canvas.addEventListener('mouseleave', () => this.onMouseUp());

        this.canvas.addEventListener('touchstart', (e) => this.onTouchStart(e), { passive: false });
        this.canvas.addEventListener('touchmove', (e) => this.onTouchMove(e), { passive: false });
        this.canvas.addEventListener('touchend', () => this.onMouseUp());

        this.setupVisibilityObserver();
    }

    setupVisibilityObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isActive = entry.isIntersecting;
            });
        }, { threshold: 0.1 });

        const section = document.getElementById('interactive-hero');
        if (section) observer.observe(section);
    }

    onMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;
        this.mouse.isDown = true;

        this.draggedShape = this.getShapeAtPosition(this.mouse.x, this.mouse.y);
    }

    onMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = e.clientX - rect.left;
        this.mouse.y = e.clientY - rect.top;

        if (this.mouse.isDown && this.draggedShape) {
            this.mouse.isDragging = true;
            this.draggedShape.x = this.mouse.x;
            this.draggedShape.y = this.mouse.y;
            this.draggedShape.vx = 0;
            this.draggedShape.vy = 0;
        }
    }

    onMouseUp() {
        if (this.mouse.isDragging && this.draggedShape) {
            this.draggedShape.vx = SceneUtils.random(-2, 2);
            this.draggedShape.vy = SceneUtils.random(-2, 2);
        }
        this.mouse.isDown = false;
        this.mouse.isDragging = false;
        this.draggedShape = null;
    }

    onTouchStart(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;
        this.mouse.isDown = true;
        this.draggedShape = this.getShapeAtPosition(this.mouse.x, this.mouse.y);
    }

    onTouchMove(e) {
        e.preventDefault();
        const touch = e.touches[0];
        const rect = this.canvas.getBoundingClientRect();
        this.mouse.x = touch.clientX - rect.left;
        this.mouse.y = touch.clientY - rect.top;

        if (this.mouse.isDown && this.draggedShape) {
            this.mouse.isDragging = true;
            this.draggedShape.x = this.mouse.x;
            this.draggedShape.y = this.mouse.y;
        }
    }

    getShapeAtPosition(x, y) {
        for (let i = this.shapes.length - 1; i >= 0; i--) {
            const shape = this.shapes[i];
            const dist = SceneUtils.distance(x, y, shape.x, shape.y);
            if (dist < shape.size * 0.8) {
                return shape;
            }
        }
        return null;
    }

    updateShapes() {
        const { friction, returnForce, mouseForce, maxSpeed } = CONFIG.interactive;

        this.shapes.forEach(shape => {
            if (shape === this.draggedShape) return;

            shape.x += shape.vx;
            shape.y += shape.vy;

            shape.vx *= friction;
            shape.vy *= friction;

            const padding = shape.size;
            if (shape.x < padding) {
                shape.x = padding;
                shape.vx *= -0.7;
            }
            if (shape.x > this.width - padding) {
                shape.x = this.width - padding;
                shape.vx *= -0.7;
            }
            if (shape.y < padding) {
                shape.y = padding;
                shape.vy *= -0.7;
            }
            if (shape.y > this.height - padding) {
                shape.y = this.height - padding;
                shape.vy *= -0.7;
            }

            const dx = shape.originX - shape.x;
            const dy = shape.originY - shape.y;
            shape.vx += dx * returnForce;
            shape.vy += dy * returnForce;

            if (!this.mouse.isDragging) {
                const mouseDist = SceneUtils.distance(this.mouse.x, this.mouse.y, shape.x, shape.y);
                if (mouseDist < 150 && mouseDist > 0) {
                    const force = (150 - mouseDist) / 150;
                    const angle = Math.atan2(shape.y - this.mouse.y, shape.x - this.mouse.x);
                    shape.vx += Math.cos(angle) * force * mouseForce;
                    shape.vy += Math.sin(angle) * force * mouseForce;
                }
            }

            const speed = Math.sqrt(shape.vx * shape.vx + shape.vy * shape.vy);
            if (speed > maxSpeed) {
                shape.vx = (shape.vx / speed) * maxSpeed;
                shape.vy = (shape.vy / speed) * maxSpeed;
            }

            shape.rotation += shape.rotationSpeed;
        });
    }

    drawShape(shape) {
        const { x, y, size, rotation, type, color, alpha, pulseOffset, pulseSpeed } = shape;

        const pulse = Math.sin(this.time * pulseSpeed + pulseOffset) * 0.08 + 1;
        const currentSize = size * pulse;

        this.ctx.save();
        this.ctx.translate(x, y);
        this.ctx.rotate(rotation);
        this.ctx.globalAlpha = alpha;

        const { r, g, b } = color;

        switch (type) {
            case 'circle':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, currentSize / 2, 0, Math.PI * 2);
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.25)`;
                this.ctx.fill();
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.5)`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                break;

            case 'ring':
                this.ctx.beginPath();
                this.ctx.arc(0, 0, currentSize / 2, 0, Math.PI * 2);
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
                this.ctx.lineWidth = 2.5;
                this.ctx.stroke();
                this.ctx.beginPath();
                this.ctx.arc(0, 0, currentSize / 3, 0, Math.PI * 2);
                this.ctx.stroke();
                break;

            case 'square':
                const halfSize = currentSize / 2;
                this.ctx.beginPath();
                this.ctx.rect(-halfSize, -halfSize, currentSize, currentSize);
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
                this.ctx.fill();
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                break;

            case 'triangle':
                const h = currentSize * 0.866;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -h / 2);
                this.ctx.lineTo(-currentSize / 2, h / 2);
                this.ctx.lineTo(currentSize / 2, h / 2);
                this.ctx.closePath();
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
                this.ctx.fill();
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                break;

            case 'diamond':
                const dHalf = currentSize / 2;
                this.ctx.beginPath();
                this.ctx.moveTo(0, -dHalf);
                this.ctx.lineTo(dHalf, 0);
                this.ctx.lineTo(0, dHalf);
                this.ctx.lineTo(-dHalf, 0);
                this.ctx.closePath();
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.15)`;
                this.ctx.fill();
                this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.4)`;
                this.ctx.lineWidth = 2;
                this.ctx.stroke();
                break;

            case 'cross':
                const arm = currentSize / 2;
                const thickness = currentSize / 6;
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.2)`;
                this.ctx.fillRect(-thickness, -arm, thickness * 2, arm * 2);
                this.ctx.fillRect(-arm, -thickness, arm * 2, thickness * 2);
                break;

            case 'dots':
                const dotRadius = currentSize / 8;
                const spacing = currentSize / 3;
                this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 0.35)`;
                for (let row = -1; row <= 1; row++) {
                    for (let col = -1; col <= 1; col++) {
                        this.ctx.beginPath();
                        this.ctx.arc(col * spacing, row * spacing, dotRadius, 0, Math.PI * 2);
                        this.ctx.fill();
                    }
                }
                break;
        }

        this.ctx.restore();
    }

    drawConnections() {
        const { connectionDistance } = CONFIG.interactive;
        this.ctx.lineWidth = 1;

        for (let i = 0; i < this.shapes.length; i++) {
            for (let j = i + 1; j < this.shapes.length; j++) {
                const a = this.shapes[i];
                const b = this.shapes[j];
                const dist = SceneUtils.distance(a.x, a.y, b.x, b.y);

                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.12;
                    this.ctx.strokeStyle = `rgba(212, 166, 83, ${alpha})`;
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.stroke();
                }
            }
        }
    }

    drawBackground() {
        const gradient = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, this.width * 0.7
        );
        gradient.addColorStop(0, 'rgba(18, 18, 24, 1)');
        gradient.addColorStop(1, 'rgba(8, 8, 12, 1)');

        this.ctx.fillStyle = gradient;
        this.ctx.fillRect(0, 0, this.width, this.height);

        const glow = this.ctx.createRadialGradient(
            this.width / 2, this.height / 2, 0,
            this.width / 2, this.height / 2, Math.min(this.width, this.height) * 0.5
        );
        glow.addColorStop(0, 'rgba(212, 166, 83, 0.04)');
        glow.addColorStop(0.5, 'rgba(212, 166, 83, 0.02)');
        glow.addColorStop(1, 'transparent');

        this.ctx.fillStyle = glow;
        this.ctx.fillRect(0, 0, this.width, this.height);
    }

    animate() {
        if (!this.isActive) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.time += 0.016;

        this.drawBackground();
        this.updateShapes();
        this.drawConnections();
        this.shapes.forEach(shape => this.drawShape(shape));

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   LANYARD SCENE - Physics-based Rope Animation
   NOTE: Only draws the rope - HTML ID card is positioned via CSS/JS
   ═══════════════════════════════════════════════════════════════════════════ */

class LanyardScene {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas #${canvasId} not found`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.isActive = true;
        this.mouse = { x: 0, y: 0 };
        this.points = [];
        this.time = 0;
        this.width = 0;
        this.height = 0;

        // Reference to HTML ID card
        this.idCard = document.getElementById('id-card');

        this.init();
    }

    init() {
        this.resize();
        this.createRope();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const container = document.getElementById('lanyard-wrapper') ||
            this.canvas.parentElement;

        const rect = container?.getBoundingClientRect() || { width: 400, height: 600 };
        const dpr = SceneUtils.getPixelRatio();

        this.width = rect.width || 400;
        this.height = rect.height || 600;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(dpr, dpr);

        if (this.points.length > 0) {
            this.createRope();
        }
    }

    createRope() {
        this.points = [];

        const startX = this.width / 2;
        const startY = 10;

        const ropeLength = CONFIG.lanyard.ropeLength;
        const segmentLength = ropeLength / CONFIG.lanyard.segmentCount;

        for (let i = 0; i <= CONFIG.lanyard.segmentCount; i++) {
            this.points.push({
                x: startX,
                y: startY + i * segmentLength,
                oldX: startX,
                oldY: startY + i * segmentLength,
                pinned: i === 0,
            });
        }
    }

    bindEvents() {
        const wrapper = document.getElementById('lanyard-wrapper');
        if (wrapper) {
            wrapper.addEventListener('mousemove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            });

            wrapper.addEventListener('touchmove', (e) => {
                const rect = wrapper.getBoundingClientRect();
                const touch = e.touches[0];
                this.mouse.x = touch.clientX - rect.left;
                this.mouse.y = touch.clientY - rect.top;
            }, { passive: true });
        }

        window.addEventListener('resize', () => this.resize());

        this.setupVisibilityObserver();
    }

    setupVisibilityObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isActive = entry.isIntersecting;
            });
        }, { threshold: 0.1 });

        const section = document.getElementById('about');
        if (section) observer.observe(section);
    }

    updatePhysics() {
        const { gravity, damping, stiffness } = CONFIG.lanyard;

        this.points.forEach((point, i) => {
            if (point.pinned) return;

            const vx = (point.x - point.oldX) * damping;
            const vy = (point.y - point.oldY) * damping;

            point.oldX = point.x;
            point.oldY = point.y;

            point.x += vx;
            point.y += vy + gravity;

            // Mouse influence on lower points
            if (i > this.points.length * 0.6) {
                const dx = this.mouse.x - point.x;
                const dy = this.mouse.y - point.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < 120 && dist > 0) {
                    const force = (120 - dist) / 120;
                    point.x += dx * force * 0.02;
                    point.y += dy * force * 0.02;
                }
            }

            // Ambient sway
            if (i > 0 && i < this.points.length - 2) {
                point.x += Math.sin(this.time * 0.6 + i * 0.12) * 0.15;
            }

            // Keep within bounds
            const padding = 20;
            point.x = SceneUtils.clamp(point.x, padding, this.width - padding);
            point.y = SceneUtils.clamp(point.y, 0, this.height - 50);
        });

        // Solve constraints
        const iterations = 5;
        for (let iter = 0; iter < iterations; iter++) {
            const segLen = CONFIG.lanyard.ropeLength / CONFIG.lanyard.segmentCount;

            for (let i = 0; i < this.points.length - 1; i++) {
                const p1 = this.points[i];
                const p2 = this.points[i + 1];

                const dx = p2.x - p1.x;
                const dy = p2.y - p1.y;
                const dist = Math.sqrt(dx * dx + dy * dy);

                if (dist === 0) continue;

                const diff = (segLen - dist) / dist;

                const offsetX = dx * diff * 0.5;
                const offsetY = dy * diff * 0.5;

                if (!p1.pinned) {
                    p1.x -= offsetX * stiffness;
                    p1.y -= offsetY * stiffness;
                }
                if (!p2.pinned) {
                    p2.x += offsetX * stiffness;
                    p2.y += offsetY * stiffness;
                }
            }
        }

        // Update HTML ID card position
        this.updateCardPosition();
    }

    updateCardPosition() {
        if (!this.idCard) return;

        const lastPoint = this.points[this.points.length - 1];
        const prevPoint = this.points[this.points.length - 2];

        // Calculate angle
        const angle = Math.atan2(lastPoint.x - prevPoint.x, lastPoint.y - prevPoint.y);
        const rotationDeg = angle * (180 / Math.PI) * 0.15;

        // Position the card at the end of the rope
        this.idCard.style.top = `${lastPoint.y}px`;
        this.idCard.style.left = `${lastPoint.x}px`;

        // Apply rotation (translateX already in CSS for centering)
        this.idCard.style.transform = `translateX(-50%) rotate(${rotationDeg}deg)`;
    }

    drawRope() {
        const { r, g, b } = CONFIG.colors.goldRgb;

        // Draw rope shadow
        this.ctx.strokeStyle = `rgba(0, 0, 0, 0.25)`;
        this.ctx.lineWidth = 5;
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x + 2, this.points[0].y + 3);
        for (let i = 1; i < this.points.length; i++) {
            const xc = (this.points[i - 1].x + this.points[i].x) / 2 + 2;
            const yc = (this.points[i - 1].y + this.points[i].y) / 2 + 3;
            this.ctx.quadraticCurveTo(this.points[i - 1].x + 2, this.points[i - 1].y + 3, xc, yc);
        }
        this.ctx.stroke();

        // Draw main rope
        this.ctx.strokeStyle = `rgba(${r}, ${g}, ${b}, 0.85)`;
        this.ctx.lineWidth = 3;

        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);

        for (let i = 1; i < this.points.length; i++) {
            const xc = (this.points[i - 1].x + this.points[i].x) / 2;
            const yc = (this.points[i - 1].y + this.points[i].y) / 2;
            this.ctx.quadraticCurveTo(this.points[i - 1].x, this.points[i - 1].y, xc, yc);
        }

        // Connect to last point
        const last = this.points[this.points.length - 1];
        this.ctx.lineTo(last.x, last.y);
        this.ctx.stroke();

        // Draw anchor point (top)
        this.ctx.fillStyle = `rgba(${r}, ${g}, ${b}, 1)`;
        this.ctx.beginPath();
        this.ctx.arc(this.points[0].x, this.points[0].y, 6, 0, Math.PI * 2);
        this.ctx.fill();

        // Draw clip connector at bottom (where card attaches)
        this.ctx.beginPath();
        this.ctx.arc(last.x, last.y, 4, 0, Math.PI * 2);
        this.ctx.fill();
    }

    animate() {
        if (!this.isActive) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.time += 0.02;
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.updatePhysics();
        this.drawRope();

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SKILLS NETWORK GRAPH - Floating Connected Nodes
   ═══════════════════════════════════════════════════════════════════════════ */

class NetworkScene {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        if (!this.canvas) {
            console.warn(`Canvas #${canvasId} not found`);
            return;
        }

        this.ctx = this.canvas.getContext('2d');
        this.isActive = false;
        this.nodes = [];
        this.mouse = { x: -1000, y: -1000 };
        this.time = 0;
        this.width = 0;
        this.height = 0;

        this.init();
    }

    init() {
        this.resize();
        this.createNodes();
        this.bindEvents();
        this.animate();
    }

    resize() {
        const container = this.canvas.parentElement;
        const rect = container?.getBoundingClientRect() || { width: 800, height: 600 };
        const dpr = SceneUtils.getPixelRatio();

        this.width = rect.width;
        this.height = rect.height;

        this.canvas.width = this.width * dpr;
        this.canvas.height = this.height * dpr;
        this.canvas.style.width = `${this.width}px`;
        this.canvas.style.height = `${this.height}px`;

        this.ctx.scale(dpr, dpr);

        if (this.nodes.length > 0) {
            this.createNodes();
        }
    }

    createNodes() {
        this.nodes = [];

        const colors = [
            { r: 212, g: 166, b: 83, a: 0.5 },
            { r: 224, g: 122, b: 95, a: 0.5 },
            { r: 135, g: 168, b: 120, a: 0.5 },
            { r: 244, g: 240, b: 232, a: 0.3 },
        ];

        const count = SceneUtils.isMobile() ?
            Math.floor(CONFIG.network.nodeCount * 0.6) :
            CONFIG.network.nodeCount;

        for (let i = 0; i < count; i++) {
            const color = colors[i % colors.length];

            this.nodes.push({
                x: SceneUtils.random(0, this.width),
                y: SceneUtils.random(0, this.height),
                vx: SceneUtils.random(-0.4, 0.4) * CONFIG.network.nodeSpeed,
                vy: SceneUtils.random(-0.4, 0.4) * CONFIG.network.nodeSpeed,
                radius: SceneUtils.random(2, 5),
                color: color,
                pulseOffset: SceneUtils.random(0, Math.PI * 2),
            });
        }
    }

    bindEvents() {
        window.addEventListener('mousemove', (e) => {
            const rect = this.canvas.getBoundingClientRect();
            if (e.clientX >= rect.left && e.clientX <= rect.right &&
                e.clientY >= rect.top && e.clientY <= rect.bottom) {
                this.mouse.x = e.clientX - rect.left;
                this.mouse.y = e.clientY - rect.top;
            } else {
                this.mouse.x = -1000;
                this.mouse.y = -1000;
            }
        });

        window.addEventListener('resize', () => this.resize());

        this.setupVisibilityObserver();
    }

    setupVisibilityObserver() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                this.isActive = entry.isIntersecting;
            });
        }, { threshold: 0.1 });

        const section = document.getElementById('skills');
        if (section) observer.observe(section);
    }

    update() {
        this.nodes.forEach(node => {
            node.x += node.vx;
            node.y += node.vy;

            if (node.x < -10) node.x = this.width + 10;
            if (node.x > this.width + 10) node.x = -10;
            if (node.y < -10) node.y = this.height + 10;
            if (node.y > this.height + 10) node.y = -10;

            const dx = this.mouse.x - node.x;
            const dy = this.mouse.y - node.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < 100 && dist > 0) {
                const force = (100 - dist) / 100;
                node.vx -= (dx / dist) * force * 0.02;
                node.vy -= (dy / dist) * force * 0.02;
            }

            const speed = Math.sqrt(node.vx * node.vx + node.vy * node.vy);
            const maxSpeed = 0.8;
            if (speed > maxSpeed) {
                node.vx = (node.vx / speed) * maxSpeed;
                node.vy = (node.vy / speed) * maxSpeed;
            }
        });
    }

    draw() {
        const { connectionDistance } = CONFIG.network;

        this.ctx.lineWidth = 0.5;
        for (let i = 0; i < this.nodes.length; i++) {
            for (let j = i + 1; j < this.nodes.length; j++) {
                const a = this.nodes[i];
                const b = this.nodes[j];
                const dist = SceneUtils.distance(a.x, a.y, b.x, b.y);

                if (dist < connectionDistance) {
                    const alpha = (1 - dist / connectionDistance) * 0.12;
                    this.ctx.strokeStyle = `rgba(212, 166, 83, ${alpha})`;
                    this.ctx.setLineDash([4, 4]);
                    this.ctx.lineDashOffset = -this.time * 15;
                    this.ctx.beginPath();
                    this.ctx.moveTo(a.x, a.y);
                    this.ctx.lineTo(b.x, b.y);
                    this.ctx.stroke();
                }
            }
        }
        this.ctx.setLineDash([]);

        // Draw nodes
        this.nodes.forEach(node => {
            const pulse = Math.sin(this.time * 2 + node.pulseOffset) * 0.25 + 1;
            const r = node.radius * pulse;
            const { r: red, g, b, a } = node.color;

            // Glow
            const grad = this.ctx.createRadialGradient(node.x, node.y, 0, node.x, node.y, r * 5);
            grad.addColorStop(0, `rgba(${red}, ${g}, ${b}, ${a * 0.6})`);
            grad.addColorStop(1, 'transparent');
            this.ctx.fillStyle = grad;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, r * 5, 0, Math.PI * 2);
            this.ctx.fill();

            // Core
            this.ctx.fillStyle = `rgba(${red}, ${g}, ${b}, ${a + 0.3})`;
            this.ctx.beginPath();
            this.ctx.arc(node.x, node.y, r, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    animate() {
        if (!this.isActive) {
            requestAnimationFrame(() => this.animate());
            return;
        }

        this.time += 0.01;
        this.ctx.clearRect(0, 0, this.width, this.height);

        this.update();
        this.draw();

        requestAnimationFrame(() => this.animate());
    }

    destroy() {
        this.isActive = false;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   SCENE MANAGER - Handles initialization and lifecycle
   ═══════════════════════════════════════════════════════════════════════════ */

class SceneManager {
    constructor() {
        this.scenes = {};
        this.isInitialized = false;
    }

    init() {
        if (this.isInitialized) return;

        // Skip on very small screens or if reduced motion is preferred
        if (window.innerWidth < 400 || SceneUtils.isReducedMotion()) {
            console.log('Scenes disabled: small screen or reduced motion preference');
            return;
        }

        // Initialize Interactive Hero Scene
        try {
            this.scenes.interactive = new InteractiveHeroScene('interactive-canvas');
            if (this.scenes.interactive && this.scenes.interactive.canvas) {
                console.log('✓ Interactive Hero Scene initialized');
            }
        } catch (e) {
            console.warn('Interactive scene failed:', e);
        }

        // Initialize Lanyard Scene (skip on mobile for performance)
        if (!SceneUtils.isMobile()) {
            try {
                this.scenes.lanyard = new LanyardScene('lanyard-canvas');
                if (this.scenes.lanyard && this.scenes.lanyard.canvas) {
                    console.log('✓ Lanyard Scene initialized');
                }
            } catch (e) {
                console.warn('Lanyard scene failed:', e);
            }
        }

        // Initialize Network Scene
        try {
            this.scenes.network = new NetworkScene('skills-canvas');
            if (this.scenes.network && this.scenes.network.canvas) {
                console.log('✓ Network Scene initialized');
            }
        } catch (e) {
            console.warn('Network scene failed:', e);
        }

        this.isInitialized = true;
        console.log('%c🎨 Canvas Scenes Ready', 'color: #d4a653; font-size: 12px; font-weight: bold;');
    }

    getScene(name) {
        return this.scenes[name] || null;
    }

    pauseAll() {
        Object.values(this.scenes).forEach(scene => {
            if (scene) scene.isActive = false;
        });
    }

    resumeAll() {
        Object.values(this.scenes).forEach(scene => {
            if (scene) scene.isActive = true;
        });
    }

    destroy() {
        Object.values(this.scenes).forEach(scene => {
            if (scene && scene.destroy) scene.destroy();
        });
        this.scenes = {};
        this.isInitialized = false;
    }
}

/* ═══════════════════════════════════════════════════════════════════════════
   INITIALIZATION
   ═══════════════════════════════════════════════════════════════════════════ */

const sceneManager = new SceneManager();

function initScenes() {
    if (document.readyState === 'complete') {
        setTimeout(() => sceneManager.init(), 150);
    } else {
        window.addEventListener('load', () => {
            setTimeout(() => sceneManager.init(), 150);
        });
    }
}

// Start initialization
initScenes();

// Pause scenes when tab is hidden (performance optimization)
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        sceneManager.pauseAll();
    } else {
        sceneManager.resumeAll();
    }
});

// Handle focus/blur for additional performance optimization
window.addEventListener('blur', () => sceneManager.pauseAll());
window.addEventListener('focus', () => sceneManager.resumeAll());

/* ═══════════════════════════════════════════════════════════════════════════
   EXPORTS
   ═══════════════════════════════════════════════════════════════════════════ */

window.PortfolioScenes = {
    manager: sceneManager,
    InteractiveHeroScene,
    LanyardScene,
    NetworkScene,
    SceneUtils,
    CONFIG,
};