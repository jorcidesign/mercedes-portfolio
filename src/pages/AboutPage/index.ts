import { Component } from '../../core/Component';
import { ParallaxTitle } from '../../components/atoms/ParallaxTitle';
import { ImageReveal } from '../../components/atoms/ImageReveal';
import { ThemeStore } from '../../store/ThemeStore';
import { ScrollManager } from '../../core/ScrollManager';
import { AboutService, type AboutData } from '../../services/AboutService';
import './style.css';

// ─── Detecta si la imagen es landscape (ancho > alto) ─────────────────────────
// Lo hacemos en preload cuando ya tenemos las URLs cargadas en caché.
const detectOrientation = (img: HTMLImageElement): 'portrait' | 'landscape' => {
    return img.naturalWidth > img.naturalHeight ? 'landscape' : 'portrait';
};

const preloadImagesWithMeta = async (urls: string[]): Promise<Array<'portrait' | 'landscape'>> => {
    const results = await Promise.all(
        urls.map(
            url =>
                new Promise<'portrait' | 'landscape'>(resolve => {
                    const img = new Image();
                    img.src = url;
                    img.onload = () => resolve(detectOrientation(img));
                    img.onerror = () => resolve('portrait'); // fallback seguro
                })
        )
    );
    return results;
};

export class AboutPage extends Component {
    private title1: ParallaxTitle;
    private title2: ParallaxTitle;
    private title3: ParallaxTitle;
    private title4: ParallaxTitle;
    private profileImages: ImageReveal[] = [];
    private aboutData: AboutData | null = null;
    private orientations: Array<'portrait' | 'landscape'> = [];

    constructor() {
        super();

        this.title1 = new ParallaxTitle({
            text: 'MERCEDES',
            font: 'sans',
            speed: 0.15,
            customClass: 'p-about__title p-about__title--left',
        });
        this.title2 = new ParallaxTitle({
            text: 'ASTORIMA',
            font: 'serif',
            speed: 0.1,
            customClass: 'p-about__title p-about__title--right',
        });
        this.title3 = new ParallaxTitle({
            text: 'MAKEUP',
            font: 'sans',
            speed: 0.08,
            align: 'right',
            customClass: 'p-about__title p-about__title--right',
        });
        this.title4 = new ParallaxTitle({
            text: 'ARTIST',
            font: 'serif',
            speed: 0.04,
            align: 'right',
            customClass: 'p-about__title p-about__title--left',
        });
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRELOAD
    // ─────────────────────────────────────────────────────────────────────────
    public async preload(): Promise<void> {
        console.log('[AboutPage] Consultando API y precargando fotos...');

        this.aboutData = await AboutService.getAboutData();

        if (this.aboutData && this.aboutData.sections) {
            const imageUrls = this.aboutData.sections.map(sec => sec.imageUrl);

            // Precargamos Y detectamos orientación en paralelo
            this.orientations = await preloadImagesWithMeta(imageUrls);

            this.aboutData.sections.forEach(sec => {
                this.profileImages.push(
                    new ImageReveal({
                        src: sec.imageUrl,
                        alt: 'Mercedes Astorima - Makeup Artist',
                        hoverZoom: false,
                        parallax: 'vertical',
                        eager: true,
                    })
                );
            });

            console.log('✅ [AboutPage] Data, fotos y orientaciones listas:', this.orientations);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // RENDER
    // ─────────────────────────────────────────────────────────────────────────
    render(): string {
        const sectionsHtml =
            this.aboutData?.sections
                .map((section, index) => {
                    const orientation = this.orientations[index] ?? 'portrait';

                    // Lógica de layout por orientación e índice
                    const gridModifier = this.getGridModifier(orientation, index);
                    const wrapperModifier =
                        orientation === 'landscape'
                            ? 'p-about__img-wrapper--landscape'
                            : 'p-about__img-wrapper--portrait';

                    const subtitleHtml =
                        index === 0 ? `<h2 class="p-about__subtitle">Sobre mí</h2>` : '';

                    const dividerHtml =
                        index < (this.aboutData?.sections.length ?? 0) - 1
                            ? `<span class="p-about__divider" aria-hidden="true"></span>`
                            : '';

                    return `
                    <div class="p-about__grid ${gridModifier}">
                        <div class="p-about__col-img">
                            <span class="p-about__section-num" aria-hidden="true">0${index + 1}</span>
                            <div class="p-about__img-wrapper ${wrapperModifier}" id="about-image-slot-${index}"></div>
                        </div>

                        <div class="p-about__col-text">
                            ${subtitleHtml}
                            <div class="p-about__copy">
                                ${section.description}
                            </div>
                        </div>
                    </div>
                    ${dividerHtml}
                `;
                })
                .join('') ?? '<p>Cargando información...</p>';

        return `
            <div class="p-about" id="page-about">
                <header class="p-about__hero">
                    <div class="p-about__hero-container">
                        <div id="about-title-1"></div>
                        <div id="about-title-2"></div>
                        <div id="about-title-3"></div>
                        <div id="about-title-4"></div>
                    </div>
                    <span class="p-about__hero-index" aria-hidden="true">Lima — Perú — 2026</span>
                </header>

                <main class="p-about__content">
                    ${sectionsHtml}
                </main>
            </div>
        `;
    }

    // ─────────────────────────────────────────────────────────────────────────
    // HELPERS
    // ─────────────────────────────────────────────────────────────────────────

    /**
     * Determina la clase de grilla según la orientación de la imagen y el índice.
     *
     * Landscape siempre pone la imagen a la izquierda (ocupa más espacio).
     * Portrait alterna: par → izquierda, impar → derecha.
     */
    private getGridModifier(orientation: 'portrait' | 'landscape', index: number): string {
        if (orientation === 'landscape') {
            return 'p-about__grid--landscape';
        }
        // Alterna portrait izq/der
        return index % 2 === 0
            ? 'p-about__grid--portrait-left'
            : 'p-about__grid--portrait-right';
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MOUNT
    // ─────────────────────────────────────────────────────────────────────────
    onMount(): void {
        ThemeStore.getInstance().setTheme('dark');

        const headerEl = document.getElementById('main-header');
        if (headerEl) headerEl.classList.add('is-visible');

        ScrollManager.getInstance().unlock();

        this.mountChild('#about-title-1', this.title1);
        this.mountChild('#about-title-2', this.title2);
        this.mountChild('#about-title-3', this.title3);
        this.mountChild('#about-title-4', this.title4);

        this.profileImages.forEach((imgComponent, index) => {
            this.mountChild(`#about-image-slot-${index}`, imgComponent);
        });
    }
}