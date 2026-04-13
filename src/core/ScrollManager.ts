export class ScrollManager {
    private static instance: ScrollManager;

    public current: number = 0;
    public target: number = 0;
    public ease: number = 0.08;

    private isRunning: boolean = false;
    private isLocked: boolean = true;
    private rafId: number = 0;

    private wrapper: HTMLElement | null = null;
    private maxScroll: number = 0;
    private resizeObserver: ResizeObserver | null = null;

    // 🔥 FIX: Extraída del closure local para poder removerla en destroy()
    private touchStartY: number = 0;

    private constructor() { }

    public static getInstance(): ScrollManager {
        if (!ScrollManager.instance) {
            ScrollManager.instance = new ScrollManager();
        }
        return ScrollManager.instance;
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
        window.addEventListener('touchmove', this.onTouchMove, { passive: false });
        window.addEventListener('keydown', this.onKeyDown);
    }

    // 🔥 FIX: Arrow methods en clase → removeEventListener puede referenciarlos
    private onTouchStart = (e: TouchEvent): void => {
        this.touchStartY = e.touches[0].clientY;
    };

    private onTouchMove = (e: TouchEvent): void => {
        if (this.isLocked) return;
        e.preventDefault();
        const delta = this.touchStartY - e.touches[0].clientY;
        this.touchStartY = e.touches[0].clientY;
        this.target += delta * 1.5;
        this.clampTarget();
    };

    private onWheel = (e: WheelEvent): void => {
        if (this.isLocked) return;
        e.preventDefault();

        let delta = e.deltaY;
        if (e.deltaMode === 1) delta *= 40;
        if (e.deltaMode === 2) delta *= 800;

        delta = Math.max(-150, Math.min(150, delta));

        this.target += delta;
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

    private update = (): void => {
        if (!this.isRunning || !this.wrapper) return;

        this.current += (this.target - this.current) * this.ease;

        if (Math.abs(this.target - this.current) < 0.05) {
            this.current = this.target;
        }

        this.wrapper.style.transform = `translate3d(0, -${this.current}px, 0)`;

        this.rafId = requestAnimationFrame(this.update);
    };

    private clampTarget(): void {
        this.target = Math.max(0, Math.min(this.target, this.maxScroll));
    }

    public start(): void {
        if (this.isRunning) return;
        this.isRunning = true;
        this.update();
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

    // 🔥 FIX: Cleanup completo — elimina listeners, desconecta observer, cancela RAF
    public destroy(): void {
        this.stop();
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
            this.resizeObserver = null;
        }

        window.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchmove', this.onTouchMove);
        window.removeEventListener('keydown', this.onKeyDown);

        this.wrapper = null;
    }
}