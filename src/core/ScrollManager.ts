export class ScrollManager {
    private static instance: ScrollManager;

    public current: number = 0;
    public target: number = 0;

    // Lerp estático — sin corrección de delta time.
    // Evita el micro-stuttering causado por fluctuaciones del timestamp del navegador.
    // Es el secreto de la fluidez tipo "mantequilla" de Lenis y similares.
    private ease: number = 0.08; // Ligeramente más suave para compensar el lerp estático

    private isRunning: boolean = false;
    private isLocked: boolean = true;
    private rafId: number = 0;

    private wrapper: HTMLElement | null = null;
    private maxScroll: number = 0;
    private resizeObserver: ResizeObserver | null = null;

    // Sistema de suscriptores — para sincronizar el Orchestrator en el mismo frame exacto
    private callbacks: Set<(current: number) => void> = new Set();

    // Touch
    private touchStartY: number = 0;
    private lastTouchY: number = 0;
    private touchVelocity: number = 0;
    private lastTouchTime: number = 0;
    private isTouching: boolean = false;
    private readonly TARGET_FPS: number = 60;
    private readonly FRAME_MS: number = 1000 / this.TARGET_FPS;

    private constructor() { }

    public static getInstance(): ScrollManager {
        if (!ScrollManager.instance) {
            ScrollManager.instance = new ScrollManager();
        }
        return ScrollManager.instance;
    }

    // ─────────────────────────────────────────
    // SUSCRIPTORES — El Orchestrator se conecta aquí
    // ─────────────────────────────────────────

    public onUpdate(callback: (current: number) => void): void {
        this.callbacks.add(callback);
    }

    public offUpdate(callback: (current: number) => void): void {
        this.callbacks.delete(callback);
    }

    public init(): void {
        this.wrapper = document.getElementById('smooth-wrapper');

        if (!this.wrapper) {
            console.error('[ScrollManager] No se encontró #smooth-wrapper en el DOM.');
            return;
        }

        this.resizeObserver = new ResizeObserver(() => this.calcMaxScroll());
        this.resizeObserver.observe(this.wrapper);
        this.calcMaxScroll();

        this.bindEvents();
        this.start();
    }

    private calcMaxScroll(): void {
        if (!this.wrapper) return;
        this.maxScroll = Math.max(0, this.wrapper.scrollHeight - window.innerHeight);
        this.clampTarget();
    }

    private bindEvents(): void {
        window.addEventListener('wheel', this.onWheel, { passive: false });
        window.addEventListener('touchstart', this.onTouchStart, { passive: true });
        window.addEventListener('touchmove', this.onTouchMove, { passive: true });
        window.addEventListener('touchend', this.onTouchEnd, { passive: true });
        window.addEventListener('keydown', this.onKeyDown);
    }

    // ─────────────────────────────────────────
    // TOUCH — inercia estilo iOS nativo, sin bounce
    // ─────────────────────────────────────────

    private onTouchStart = (e: TouchEvent): void => {
        this.isTouching = true;
        this.touchStartY = e.touches[0].clientY;
        this.lastTouchY = this.touchStartY;
        this.touchVelocity = 0;
        this.lastTouchTime = performance.now();
    };

    private onTouchMove = (e: TouchEvent): void => {
        if (this.isLocked) return;

        const now = performance.now();
        const currentY = e.touches[0].clientY;
        const dt = Math.max(now - this.lastTouchTime, 8);

        // Velocidad instantánea normalizada a 60fps
        const instantVelocity = (this.lastTouchY - currentY) / dt * this.FRAME_MS;

        // EMA: suaviza picos de digitización táctil sin perder responsividad
        this.touchVelocity = this.touchVelocity * 0.6 + instantVelocity * 0.4;

        this.target += (this.lastTouchY - currentY) * 1.6;
        this.clampTarget();

        this.lastTouchY = currentY;
        this.lastTouchTime = now;
    };

    private onTouchEnd = (): void => {
        this.isTouching = false;
        if (this.isLocked) return;

        // Inercia post-swipe — conservadora para feel elegante/editorial
        this.target += this.touchVelocity * 5;
        this.clampTarget();
    };

    // ─────────────────────────────────────────
    // WHEEL
    // ─────────────────────────────────────────

    private onWheel = (e: WheelEvent): void => {
        if (this.isLocked) return;
        e.preventDefault();

        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 40;
        if (e.deltaMode === 2) delta *= 800;

        // Sin clamp agresivo para respetar la inercia del Trackpad.
        // Multiplicador 0.85 suaviza la rueda de ratón sin bloquear el trackpad.
        this.target += delta * 0.85;
        this.clampTarget();
    };

    private onKeyDown = (e: KeyboardEvent): void => {
        if (this.isLocked) return;

        const activeElement = document.activeElement;
        if (activeElement) {
            const tagName = activeElement.tagName.toLowerCase();
            if (tagName === 'input' || tagName === 'textarea' || tagName === 'select') return;
        }

        const scrollAmount = window.innerHeight * 0.9;

        switch (e.key) {
            case 'ArrowDown': this.target += 80; break;
            case 'ArrowUp': this.target -= 80; break;
            case 'PageDown': this.target += scrollAmount; break;
            case 'PageUp': this.target -= scrollAmount; break;
            case ' ':
                e.preventDefault();
                this.target += e.shiftKey ? -scrollAmount : scrollAmount;
                break;
            case 'Home': this.target = 0; break;
            case 'End': this.target = this.maxScroll; break;
        }
        this.clampTarget();
    };

    // ─────────────────────────────────────────
    // LOOP — Lerp estático (sin delta time)
    // Evita stuttering por fluctuaciones de timestamp.
    // ─────────────────────────────────────────

    private update = (): void => {
        if (!this.isRunning || !this.wrapper) return;

        // Lerp estático: el secreto de la fluidez tipo "mantequilla"
        this.current += (this.target - this.current) * this.ease;

        // Tolerancia baja para evitar un "snap" brusco al detenerse
        if (Math.abs(this.target - this.current) < 0.01) {
            this.current = this.target;
        }

        // 1. Actualizamos el wrapper principal
        this.wrapper.style.transform = `translate3d(0, -${this.current}px, 0)`;

        // 2. Notificamos a los suscriptores (Orchestrator) EN EL MISMO FRAME
        this.callbacks.forEach(cb => cb(this.current));

        this.rafId = requestAnimationFrame(this.update);
    };

    private clampTarget(): void {
        this.target = Math.max(0, Math.min(this.target, this.maxScroll));
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.rafId = requestAnimationFrame(this.update);
    }

    public stop(): void {
        this.isRunning = false;
        if (this.rafId) cancelAnimationFrame(this.rafId);
    }

    public unlock(): void {
        this.isLocked = false;
    }

    public lock(): void {
        this.isLocked = true;
    }

    public destroy(): void {
        this.stop();
        this.callbacks.clear();

        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        window.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('touchend', this.onTouchEnd);
        window.removeEventListener('keydown', this.onKeyDown);

        this.wrapper = null;
    }
}