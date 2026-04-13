import { Component } from '../../core/Component';
import { ParallaxTitle } from '../../components/atoms/ParallaxTitle';
import { WorkGallerySection } from '../../components/organisms/WorkGallerySection';
import { ThemeStore } from '../../store/ThemeStore';
import { WorkService } from '../../services/WorkService';
import { ScrollManager } from '../../core/ScrollManager';
import './style.css';

// 🔥 HELPER DE PRECARGA (El mismo que usamos en WorkDetail)
const preloadImages = async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve();
    }));
    await Promise.all(promises);
};

export class WorkPage extends Component {
    private titleTop: ParallaxTitle;
    private titleBottom: ParallaxTitle;
    private gallerySection: WorkGallerySection | null = null;

    // Aquí guardamos la data entre el preload y el onMount
    private worksData: any[] = [];

    constructor() {
        super();

        this.titleTop = new ParallaxTitle({
            text: 'MIS MEJORES',
            font: 'sans',
            speed: 0.15,
            customClass: 'p-work__title-top'
        });

        this.titleBottom = new ParallaxTitle({
            text: 'TRABAJOS',
            font: 'serif',
            fontStyle: 'italic',
            speed: 0.05,
            customClass: 'p-work__title-bottom'
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 1. PRELOAD (Ocurre en las sombras mientras el telón está puesto)
    // ─────────────────────────────────────────────────────────────────────────
    public async preload(): Promise<void> {
        try {
            // Traemos la data
            this.worksData = await WorkService.getAllWorks();

            if (this.worksData && this.worksData.length > 0) {
                // Extraemos todas las fotos de las portadas de los proyectos
                const imagesToLoad = this.worksData.map(work => work.imageUrl).filter(Boolean);

                console.log(`[WorkPage] Precargando ${imagesToLoad.length} imágenes...`);
                await preloadImages(imagesToLoad);
                console.log(`✅ [WorkPage] Imágenes en caché.`);
            }
        } catch (error) {
            console.error("Fallo al precargar la galería:", error);
        }
    }

    render(): string {
        return `
            <div class="p-work" id="page-work">
                <header class="p-work__hero">
                    <div class="p-work__hero-container">
                        <div class="p-work__hero-content">
                            <div id="work-title-top-slot"></div>
                            <div id="work-title-bottom-slot"></div>
                        </div>
                    </div>
                </header>
                
                <main class="p-work__content">
                    <div class="p-work__content-container">
                        <div id="work-gallery-slot"></div>
                    </div>
                </main>
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // 2. ON MOUNT (Ocurre al instante cuando se levanta el telón)
    // ─────────────────────────────────────────────────────────────────────────
    async onMount(): Promise<void> {
        ThemeStore.getInstance().setTheme('dark');

        const headerEl = document.getElementById('main-header');
        if (headerEl) {
            headerEl.classList.add('is-visible');
        }

        const scrollManager = ScrollManager.getInstance();
        scrollManager.unlock();

        this.mountChild('#work-title-top-slot', this.titleTop);
        this.mountChild('#work-title-bottom-slot', this.titleBottom);

        const slotElement = this.element?.querySelector('#work-gallery-slot');

        // Renderizamos usando la data que ya descargó el preload
        if (!this.worksData || this.worksData.length === 0) {
            if (slotElement) {
                slotElement.innerHTML = '<p class="p-work__empty">Aún no hay trabajos en la galería.</p>';
            }
            return;
        }

        this.gallerySection = new WorkGallerySection({
            works: this.worksData
        });

        this.mountChild('#work-gallery-slot', this.gallerySection);
    }
}