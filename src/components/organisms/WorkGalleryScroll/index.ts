/**
 * WorkGalleryScroll
 * * Orquestador de alto nivel. Responsabilidades:
 * 1. Renderizar el layout (sticky box, anillo, hero lid, track)
 * 2. Montar HeroWorkDetail + GalleryTrack como hijos
 * 3. Instanciar ScrollOrchestrator con los elementos ya montados
 * 4. Manejar la navegación al next work (callback limpio)
 */

import { Component } from '../../../core/Component';
import { HeroWorkDetail } from '../../organisms/HeroWorkDetail';
import { GalleryTrack } from '../../molecules/GalleryTrack';
import { ScrollManager } from '../../../core/ScrollManager';
import { GhostManager } from '../../../core/GhostManager';
import type { WorkData } from '../../../data/works';
import './style.css';
import { ScrollOrchestrator } from '../../../core/Scrollorchestrator';

const ANILLO_WIDTH_DESKTOP = 100; // px
const ANILLO_WIDTH_MOBILE = 40;   // px

interface WorkGalleryScrollProps {
    work: WorkData;
}

export class WorkGalleryScroll extends Component<WorkGalleryScrollProps> {
    private heroComponent: HeroWorkDetail | null = null;
    private trackComponent: GalleryTrack | null = null;
    private orchestrator: ScrollOrchestrator | null = null;

    // 🔥 Nuevas variables para el "Amortiguador de Transición" (Ejes X e Y)
    private isNavigating: boolean = false;
    private overscrollAccumulator: number = 0;
    private touchStartX: number = 0; // Agregamos el eje X
    private touchStartY: number = 0;

    render(): string {
        return `
            <section class="o-work-gallery-scroll" id="work-gallery-wrapper">
                <div class="o-work-gallery-scroll__sticky" id="work-gallery-sticky">
                    <div class="o-work-gallery-scroll__anillo" id="el-anillo-fijo"></div>
                    <div id="work-gallery-track-slot"></div>
                    <div id="work-gallery-hero-slot"></div>
                </div>
            </section>
        `;
    }

    async onMount(): Promise<void> {
        const root = this.element;
        const stickyBox = root?.querySelector<HTMLElement>('#work-gallery-sticky');
        const heroLidSlot = root?.querySelector<HTMLElement>('#work-gallery-hero-slot');
        const trackSlot = root?.querySelector<HTMLElement>('#work-gallery-track-slot');

        if (!root || !stickyBox || !heroLidSlot || !trackSlot) return;

        // ── 1. Montar La Tapa (Hero Lid) ──
        this.heroComponent = new HeroWorkDetail({ work: this.props.work });
        this.mountChild('#work-gallery-hero-slot', this.heroComponent);

        // ── 2. Montar El Tren (Track) ──
        const slots = GalleryTrack.slotsFromWork(this.props.work);
        const anilloWidth = this.getAnilloWidth();

        this.trackComponent = new GalleryTrack({ slots, anilloWidth });
        this.mountChild('#work-gallery-track-slot', this.trackComponent);

        const trackEl = root.querySelector<HTMLElement>('#work-gallery-track');
        if (!trackEl) return;

        // ── 3. Iniciar el Motor Físico (Orchestrator) ──
        this.orchestrator = new ScrollOrchestrator(
            {
                root: root as HTMLElement,
                stickyBox,
                heroLid: heroLidSlot,
                track: trackEl,
            },
            {
                anilloWidth,
                onTrackEndThreshold: 5,
            }
        );

        await this.orchestrator.init();

        this.onResize();
        window.addEventListener('resize', this.onResize);

        // 🔥 4. CONECTAMOS LOS SENSORES DE FRICCIÓN VIRTUAL
        window.addEventListener('wheel', this.onWheel, { passive: true });
        window.addEventListener('touchstart', this.onTouchStart, { passive: true });
        window.addEventListener('touchmove', this.onTouchMove, { passive: true });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // LÓGICA DE OVERSCROLL (INTENCIÓN DE NAVEGAR - EJE X Y EJE Y)
    // ─────────────────────────────────────────────────────────────────────────
    private onWheel = (e: WheelEvent): void => {
        // Le pasamos la fuerza de ambos ejes (Ratón normal = Y, Trackpad = X e Y)
        this.handleOverscroll(e.deltaX, e.deltaY);
    };

    private onTouchStart = (e: TouchEvent): void => {
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;
    };

    private onTouchMove = (e: TouchEvent): void => {
        // Delta > 0 significa que el usuario está avanzando (Swipe izquierda o arriba)
        const deltaX = this.touchStartX - e.touches[0].clientX;
        const deltaY = this.touchStartY - e.touches[0].clientY;

        // Actualizamos para medir el movimiento continuo
        this.touchStartX = e.touches[0].clientX;
        this.touchStartY = e.touches[0].clientY;

        this.handleOverscroll(deltaX, deltaY);
    };

    private handleOverscroll(deltaX: number, deltaY: number): void {
        if (this.isNavigating || !this.props.work.nextWork) return;

        const sm = ScrollManager.getInstance();
        const wrapper = document.getElementById('smooth-wrapper');
        if (!wrapper) return;

        const maxScroll = wrapper.scrollHeight - window.innerHeight;

        // Solo empezamos a medir su intención SI visualmente el tren ya se detuvo
        if (sm.current >= maxScroll - 5) {

            // 🔥 Detectamos cuál fue el movimiento dominante del usuario
            const isHorizontal = Math.abs(deltaX) > Math.abs(deltaY);
            const activeDelta = isHorizontal ? deltaX : deltaY;

            if (activeDelta > 0) {
                // El tren está quieto y el usuario intenta avanzar más (horizontal o verticalmente)
                this.overscrollAccumulator += activeDelta;

                // Si acumula 150px de esfuerzo, lanzamos la transición!
                if (this.overscrollAccumulator > 150) {
                    this.isNavigating = true;
                    this.goToNextWork();
                }
            } else if (activeDelta < 0) {
                // Si el usuario retrocede, reseteamos la intención
                this.overscrollAccumulator = 0;
            }

        } else {
            // Si el tren aún se está moviendo, reseteamos a cero.
            this.overscrollAccumulator = 0;
        }
    }

    private goToNextWork(): void {
        if (!this.props.work.nextWork) return;
        const { slug } = this.props.work.nextWork;

        // 🔥 EL SECUESTRO EN OVERSCROLL
        const nextWorkEl = this.element?.querySelector('#next-work-img-slot');
        if (nextWorkEl) {
            GhostManager.getInstance().capture(nextWorkEl as HTMLElement);
        }

        window.history.pushState(null, '', `/work/${slug}`);
        window.dispatchEvent(new Event('popstate'));
    }

    private onResize = (): void => {
        const w = this.getAnilloWidth();
        this.element?.style.setProperty('--anillo-width', `${w}px`);
    };

    private getAnilloWidth(): number {
        return window.innerWidth <= 768 ? ANILLO_WIDTH_MOBILE : ANILLO_WIDTH_DESKTOP;
    }

    override onDestroy(): void {
        this.orchestrator?.destroy();
        window.removeEventListener('resize', this.onResize);
        window.removeEventListener('wheel', this.onWheel);
        window.removeEventListener('touchstart', this.onTouchStart);
        window.removeEventListener('touchmove', this.onTouchMove);
        super.onDestroy();
    }
}