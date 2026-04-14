import { Component } from '../../core/Component';
import { WorkGalleryScroll } from '../../components/organisms/WorkGalleryScroll';
import { GhostManager } from '../../core/GhostManager'; // Al inicio del archivo
import { WorkService } from '../../services/WorkService';
import { ScrollManager } from '../../core/ScrollManager';
import { ThemeStore } from '../../store/ThemeStore';
import type { WorkData } from '../../data/works';
import { SEOManager } from '../../core/SEOManager';
import './style.css';

interface WorkDetailProps {
    slug?: string;
}

export class WorkDetailPage extends Component<WorkDetailProps> {
    private galleryScroll: WorkGalleryScroll | null = null;
    private workData: WorkData | null = null;

    constructor(props: WorkDetailProps) {
        super(props);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRELOAD
    // El Router mantiene el telón cerrado mientras esto esté corriendo.
    // Solo cuando esta Promise resuelve, el loader termina y la página aparece.
    // ─────────────────────────────────────────────────────────────────────────
    public async preload(): Promise<void> {
        const slug = this.props.slug;
        if (!slug) return;

        // 1. Traemos la data de Strapi
        this.workData = await WorkService.getWorkBySlug(slug);
        if (!this.workData) return;

        // 2. Recolectamos todas las URLs que necesitan estar en caché antes de revelar
        const imagesToLoad: string[] = [];

        // Imagen principal
        if (this.workData.imageUrl) {
            imagesToLoad.push(this.workData.imageUrl);
        }

        // 🔥 FIX: gallery ya es string[] — no necesitamos .url
        if (this.workData.gallery?.length) {
            imagesToLoad.push(...this.workData.gallery);
        }

        // Precargamos también la imagen del nextWork (ya estará lista para la transición siguiente)
        if (this.workData.nextWork?.imageUrl) {
            imagesToLoad.push(this.workData.nextWork.imageUrl);
        }

        console.log(`[WorkDetail] Precargando ${imagesToLoad.length} imágenes en caché...`);

        // 3. Esperamos a que el browser termine de descargar cada una
        // Promise.all: si una falla (onerror), igual resuelve para no bloquear la app
        await Promise.all(
            imagesToLoad.map(src => new Promise<void>((resolve) => {
                const img = new Image();
                img.src = src;
                img.onload = () => resolve();
                img.onerror = () => resolve(); // No bloqueamos por imágenes rotas
            }))
        );

        console.log('✅ [WorkDetail] Todas las imágenes en caché. El loader puede terminar.');
    }

    render(): string {
        return `
        <div class="p-work-detail" id="page-work-detail">
            <div id="work-detail-gallery-slot"></div>
        </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // ON MOUNT
    // Este método corre DESPUÉS de que el telón se levantó.
    // En este punto workData ya está listo y las imágenes ya están en caché RAM.
    // No hay ningún await de red aquí — todo es montaje puro y sincrónico.
    // ─────────────────────────────────────────────────────────────────────────
    async onMount(): Promise<void> {
        window.dispatchEvent(new Event('app:disable-footer'));
        ThemeStore.getInstance().setTheme('dark');

        // 🔥 NUEVO SEO: Inyectamos los datos dinámicos del CMS
        if (this.workData) {
            SEOManager.update({
                title: this.workData.title, // El título real de tu proyecto
                description: `Explora los detalles direccionales y artísticos del proyecto: ${this.workData.title}`,
                imageUrl: this.workData.imageUrl, // La foto de portada real
                url: window.location.href
            });
        }

        const headerEl = document.getElementById('main-header');
        if (headerEl) headerEl.classList.add('is-visible');

        const scroll = ScrollManager.getInstance();
        scroll.reset(); // 🔥 FIX: Limpiamos la herencia de transform del slug anterior
        scroll.unlock();
        if (this.workData) {
            this.galleryScroll = new WorkGalleryScroll({ work: this.workData });
            this.mountChild('#work-detail-gallery-slot', this.galleryScroll);

            setTimeout(() => {
                window.dispatchEvent(new Event('resize'));
                const scrollManager = ScrollManager.getInstance();
                if (typeof (scrollManager as any)['calcMaxScroll'] === 'function') {
                    (scrollManager as any)['calcMaxScroll']();
                }

                // 🔥 LA LLEGADA DEL FANTASMA
                const ghost = GhostManager.getInstance();
                if (ghost.hasGhost()) {
                    // El primer vagón (gallery-slot-0) es tu imagen principal. ¡Le decimos al clon que vuele hacia allá!
                    const targetSlot = this.element?.querySelector('#gallery-slot-0');
                    if (targetSlot) {
                        ghost.animateTo(targetSlot as HTMLElement);
                    } else {
                        ghost.cleanup(); // Por si algo falla
                    }
                }
            }, 100); // 100ms permite que el DOM haya pintado la nueva página oculta para leer sus coordenadas
        }
    }

    override onDestroy(): void {
        window.dispatchEvent(new Event('app:enable-footer'));
        super.onDestroy();
    }
}