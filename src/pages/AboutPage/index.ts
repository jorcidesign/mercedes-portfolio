import { Component } from '../../core/Component';
import { ParallaxTitle } from '../../components/atoms/ParallaxTitle';
import { ImageReveal } from '../../components/atoms/ImageReveal';
import { ThemeStore } from '../../store/ThemeStore';
import { ScrollManager } from '../../core/ScrollManager';
import { AboutService, type AboutData } from '../../services/AboutService'; // 🔥 Importamos
import './style.css';

const preloadImages = async (urls: string[]): Promise<void> => {
    const promises = urls.map(url => new Promise<void>((resolve) => {
        const img = new Image();
        img.src = url;
        img.onload = () => resolve();
        img.onerror = () => resolve();
    }));
    await Promise.all(promises);
};

export class AboutPage extends Component {
    private title1: ParallaxTitle;
    private title2: ParallaxTitle;
    private title3: ParallaxTitle;
    private title4: ParallaxTitle;
    private profileImage: ImageReveal | null = null; // Inicializamos nulo

    // Aquí guardaremos la data que viene de Strapi
    private aboutData: AboutData | null = null;

    constructor() {
        super();

        // Los títulos pueden instanciarse sincrónicamente porque son estáticos
        this.title1 = new ParallaxTitle({ text: 'MERCEDES', font: 'sans', speed: 0.15, customClass: 'p-about__title p-about__title--left' });
        this.title2 = new ParallaxTitle({ text: 'ASTORIMA', font: 'serif', speed: 0.1, customClass: 'p-about__title p-about__title--right' });
        this.title3 = new ParallaxTitle({ text: 'MAKEUP', font: 'sans', speed: 0.08, align: 'right', customClass: 'p-about__title' });
        this.title4 = new ParallaxTitle({ text: 'ARTIST', font: 'serif', speed: 0.04, align: 'right', customClass: 'p-about__title' });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRELOAD (Se ejecuta antes de renderizar la página)
    // ─────────────────────────────────────────────────────────────────────────
    public async preload(): Promise<void> {
        console.log(`[AboutPage] Consultando API y precargando foto...`);

        // 1. Traemos la data de Strapi
        this.aboutData = await AboutService.getAboutData();

        if (this.aboutData) {
            // 2. Instanciamos el ImageReveal ahora que tenemos la URL dinámica
            this.profileImage = new ImageReveal({
                src: this.aboutData.imageUrl,
                alt: 'Mercedes Astorima - Makeup Artist',
                hoverZoom: false,
                parallax: 'vertical',
                eager: true
            });

            // 3. Precargamos la imagen real
            await preloadImages([this.aboutData.imageUrl]);
            console.log(`✅ [AboutPage] Data y foto en caché.`);
        }
    }

    render(): string {
        // 🔥 Extraemos el HTML dinámico o ponemos un fallback
        const dynamicCopy = this.aboutData?.description || '<p>Cargando información...</p>';

        return `
            <div class="p-about" id="page-about">
                <header class="p-about__hero">
                    <div class="p-about__hero-container">
                        <div id="about-title-1"></div>
                        <div id="about-title-2"></div>
                        <div id="about-title-3"></div>
                        <div id="about-title-4"></div>
                    </div>
                </header>
                
                <main class="p-about__content">
                    <div class="p-about__grid">
                        <div class="p-about__col-img">
                            <div class="p-about__img-bg"></div> 
                            <div class="p-about__img-wrapper" id="about-image-slot"></div>
                        </div>

                        <div class="p-about__col-text">
                            <h2 class="p-about__subtitle">Sobre mi</h2>
                            <div class="p-about__copy">
                                ${dynamicCopy}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        `;
    }

    onMount(): void {
        ThemeStore.getInstance().setTheme('dark');

        const headerEl = document.getElementById('main-header');
        if (headerEl) headerEl.classList.add('is-visible');

        ScrollManager.getInstance().unlock();

        this.mountChild('#about-title-1', this.title1);
        this.mountChild('#about-title-2', this.title2);
        this.mountChild('#about-title-3', this.title3);
        this.mountChild('#about-title-4', this.title4);

        // Montamos el componente de la imagen (si se creó con éxito)
        if (this.profileImage) {
            this.mountChild('#about-image-slot', this.profileImage);
        }
    }
}