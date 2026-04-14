/**
 * ScrollOrchestrator
 * * Responsabilidad única: calcular y aplicar la matemática del scroll
 * para el efecto de "tubo y tapa" — hero sube, track se mueve horizontal.
 * * NO sabe nada de componentes, mounting, ni routing.
 * Se instancia pasándole los elementos ya montados en el DOM.
 */

import { ScrollManager } from './ScrollManager';

export interface OrchestratorElements {
    root: HTMLElement;       // .o-work-gallery-scroll
    stickyBox: HTMLElement;  // .o-work-gallery-scroll__sticky
    heroLid: HTMLElement;    // #work-gallery-hero-slot
    track: HTMLElement;      // .o-work-gallery-scroll__track
}

export interface OrchestratorOptions {
    anilloWidth?: number;
    onTrackEnd?: () => void;
    onTrackEndThreshold?: number;
}

export class ScrollOrchestrator {
    private els: OrchestratorElements;
    private opts: Required<OrchestratorOptions>;

    // Medidas calculadas
    private componentTopStart: number = 0;
    private heroRiseDistance: number = 0;
    private trackMoveDistance: number = 0;

    // Estado
    private hasTriggeredEnd: boolean = false;

    private resizeObserver: ResizeObserver | null = null;

    // 🔥 Variables de Fricción Táctil
    private touchStartX: number = 0;
    private touchStartY: number = 0;
    private lastTouchX: number = 0;
    private isHorizontalSwipe: boolean | null = null;

    constructor(els: OrchestratorElements, opts: OrchestratorOptions = {}) {
        this.els = els;
        this.opts = {
            anilloWidth: opts.anilloWidth ?? 100,
            onTrackEnd: opts.onTrackEnd ?? (() => { }),
            onTrackEndThreshold: opts.onTrackEndThreshold ?? 5,
        };
    }

    public async init(): Promise<void> {
        await this.waitForImages();
        this.calculateDimensions();
        this.bindResize();
        this.bindEvents();

        // 🔥 Nos suscribimos al frame exacto del ScrollManager — sin RAF propio
        ScrollManager.getInstance().onUpdate(this.syncWithScroll);
    }

    public destroy(): void {
        ScrollManager.getInstance().offUpdate(this.syncWithScroll); // Desuscribir
        this.unbindEvents();
        this.resizeObserver?.disconnect();
        this.resizeObserver = null;
    }

    // ─────────────────────────────────────────────
    // SENSORES TÁCTILES Y HORIZONTALES (NUEVO)
    // ─────────────────────────────────────────────

    private bindEvents(): void {
        // Escuchamos los eventos directamente en la caja pegajosa
        const target = this.els.stickyBox;

        target.addEventListener('touchstart', this.onTouchStart, { passive: true });
        // passive: false es OBLIGATORIO para poder usar e.preventDefault() en iOS
        target.addEventListener('touchmove', this.onTouchMove, { passive: false });
        target.addEventListener('wheel', this.onWheel, { passive: false });
    }

    private unbindEvents(): void {
        const target = this.els.stickyBox;
        target.removeEventListener('touchstart', this.onTouchStart);
        target.removeEventListener('touchmove', this.onTouchMove);
        target.removeEventListener('wheel', this.onWheel);
    }

    private onTouchStart = (e: TouchEvent): void => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
        this.lastTouchX = this.touchStartX;
        this.isHorizontalSwipe = null; // Reseteamos la intención del usuario
    };

    private onTouchMove = (e: TouchEvent): void => {

        const touchX = e.touches[0].clientX;
        const touchY = e.touches[0].clientY;
        const deltaX = this.lastTouchX - touchX;

        const totalDeltaX = Math.abs(touchX - this.touchStartX);
        const totalDeltaY = Math.abs(touchY - this.touchStartY);

        // Determinamos la intención del usuario solo la primera vez que se mueve un poco
        if (this.isHorizontalSwipe === null) {
            if (totalDeltaX > 5 || totalDeltaY > 5) {
                // Es horizontal si se movió más en X que en Y
                this.isHorizontalSwipe = totalDeltaX > totalDeltaY;
            }
        }

        if (this.isHorizontalSwipe) {
            // 🔥 Evita el comportamiento nativo de "Atrás/Adelante" en Safari
            if (e.cancelable) e.preventDefault();

            const sm = ScrollManager.getInstance();

            // Transformamos el arrastre horizontal en avance de scroll vertical
            // Multiplicador 1.5 para que el swipe se sienta más ligero y responsivo
            sm.target += deltaX * 1.5;

            // Clampeamos (limitamos) para que no pueda scrollear más allá del inicio o fin de la web
            const wrapper = document.getElementById('smooth-wrapper');
            if (wrapper) {
                const maxScroll = wrapper.scrollHeight - window.innerHeight;
                sm.target = Math.max(0, Math.min(sm.target, maxScroll));
            }

            this.lastTouchX = touchX;
        }
    };

    // Soporte extra: Si un usuario usa un Trackpad (Mac) o ratón horizontal
    private onWheel = (e: WheelEvent): void => {
        if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
            if (e.cancelable) e.preventDefault();

            const sm = ScrollManager.getInstance();
            sm.target += e.deltaX; // Pasamos el wheel horizontal a vertical

            const wrapper = document.getElementById('smooth-wrapper');
            if (wrapper) {
                const maxScroll = wrapper.scrollHeight - window.innerHeight;
                sm.target = Math.max(0, Math.min(sm.target, maxScroll));
            }
        }
    };

    // ─────────────────────────────────────────────
    // MOTOR FÍSICO Y MATEMÁTICO (ORIGINAL)
    // ─────────────────────────────────────────────

    private async waitForImages(): Promise<void> {
        if ('fonts' in document) await document.fonts.ready;

        const images = Array.from(this.els.track.querySelectorAll('img'));
        if (images.length === 0) return;

        const loadPromises = images.map(img =>
            img.complete
                ? Promise.resolve()
                : new Promise<void>(res => {
                    img.addEventListener('load', () => res(), { once: true });
                    img.addEventListener('error', () => res(), { once: true });
                })
        );

        await Promise.race([
            Promise.all(loadPromises),
            new Promise<void>(res => setTimeout(res, 1500)),
        ]);
    }

    private calculateDimensions(): void {
        const { root, track } = this.els;

        const scroll = ScrollManager.getInstance().current;
        const rect = root.getBoundingClientRect();

        this.componentTopStart = rect.top + scroll;
        this.heroRiseDistance = window.innerHeight;

        const trackWidth = track.scrollWidth;
        this.trackMoveDistance = Math.max(trackWidth - window.innerWidth, 0);

        const totalHeight = this.heroRiseDistance + this.trackMoveDistance;
        root.style.height = `${totalHeight + window.innerHeight}px`;
    }

    private bindResize(): void {
        this.resizeObserver = new ResizeObserver(() => {
            this.hasTriggeredEnd = false;
            this.calculateDimensions();
        });

        this.resizeObserver.observe(this.els.track);
        this.resizeObserver.observe(this.els.root);
    }

    // Recibe currentScroll directamente del Manager en el mismo frame
    private syncWithScroll = (currentScroll: number): void => {
        const { stickyBox, heroLid, track } = this.els;

        const progress = currentScroll - this.componentTopStart;

        const maxScrollDist = this.heroRiseDistance + this.trackMoveDistance;
        const tubeY = Math.min(Math.max(progress, 0), maxScrollDist);
        stickyBox.style.transform = `translate3d(0, ${tubeY}px, 0)`;

        if (progress <= 0) {
            heroLid.style.transform = `translate3d(0, 0, 0)`;
            track.style.transform = `translate3d(0, 0, 0)`;
            return;
        }

        const heroY = Math.min(progress, this.heroRiseDistance);
        heroLid.style.transform = `translate3d(0, -${heroY}px, 0)`;

        const trackX = Math.max(progress - this.heroRiseDistance, 0);
        const trackXClamped = Math.min(trackX, this.trackMoveDistance);
        track.style.transform = `translate3d(-${trackXClamped}px, 0, 0)`;

        if (
            !this.hasTriggeredEnd &&
            trackX >= this.trackMoveDistance - this.opts.onTrackEndThreshold
        ) {
            this.hasTriggeredEnd = true;
            this.opts.onTrackEnd();
        }
    }
}