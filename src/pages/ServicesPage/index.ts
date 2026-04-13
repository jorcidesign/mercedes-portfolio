// src/pages/ServicesPage/index.ts
import { Component } from '../../core/Component';
import { ParallaxTitle } from '../../components/atoms/ParallaxTitle';
import { ServiceStack } from '../../components/organisms/ServiceStack';
import { ThemeStore } from '../../store/ThemeStore';
import { ScrollManager } from '../../core/ScrollManager';
import { ServiceService } from '../../services/ServiceService'; // 🔥 Importamos la llamada real a Strapi
import type { ServiceData } from '../../data/services'; // 🔥 Importamos solo el TIPO de la data
import './style.css';

// HELPER DE PRECARGA
const preloadImages = async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve();
    }));
    await Promise.all(promises);
};

export class ServicesPage extends Component {
    private titleTop: ParallaxTitle;
    private titleBottom: ParallaxTitle;
    private serviceStack: ServiceStack | null = null;

    // 🔥 Variable privada para almacenar lo que llega de Strapi
    private fetchedServices: ServiceData[] = [];

    constructor() {
        super();

        this.titleTop = new ParallaxTitle({
            text: 'MIS',
            font: 'sans',
            speed: 0.15,
            customClass: 'p-services__title-top'
        });

        this.titleBottom = new ParallaxTitle({
            text: 'SERVICIOS',
            font: 'serif',
            fontStyle: 'italic',
            speed: 0.05,
            customClass: 'p-services__title-bottom'
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRELOAD: Donde ocurre la magia asíncrona (detrás del telón blanco)
    // ─────────────────────────────────────────────────────────────────────────
    public async preload(): Promise<void> {
        // 1. Solicitamos los servicios a Strapi
        this.fetchedServices = await ServiceService.getAllServices();

        if (this.fetchedServices && this.fetchedServices.length > 0) {
            // 2. Extraemos URLs dinámicas de Strapi
            const imagesToLoad = this.fetchedServices.map(service => service.imageUrl).filter(Boolean);

            console.log(`[ServicesPage] Precargando ${imagesToLoad.length} imágenes de Strapi...`);
            await preloadImages(imagesToLoad);
            console.log(`✅ [ServicesPage] Imágenes en caché.`);
        }
    }

    render(): string {
        return `
            <div class="p-services" id="page-services">
                <header class="p-services__hero">
                    <div class="p-services__hero-container">
                        <div class="p-services__hero-content">
                            <div id="services-title-top-slot"></div>
                            <div id="services-title-bottom-slot"></div>
                        </div>
                    </div>
                </header>
                
                <main class="p-services__content">
                    <div id="services-stack-slot"></div>
                </main>
            </div>
        `;
    }

    onMount(): void {
        ThemeStore.getInstance().setTheme('dark');

        const headerEl = document.getElementById('main-header');
        if (headerEl) {
            headerEl.classList.add('is-visible');
        }

        ScrollManager.getInstance().unlock();

        this.mountChild('#services-title-top-slot', this.titleTop);
        this.mountChild('#services-title-bottom-slot', this.titleBottom);

        // 3. Montamos el ServiceStack inyectándole la data pura
        if (this.fetchedServices && this.fetchedServices.length > 0) {
            this.serviceStack = new ServiceStack({
                services: this.fetchedServices
            });
            this.mountChild('#services-stack-slot', this.serviceStack);
        } else {
            const slotElement = this.element?.querySelector('#services-stack-slot');
            if (slotElement) {
                slotElement.innerHTML = '<p class="p-services__empty">No hay servicios disponibles por ahora.</p>';
            }
        }
    }
}