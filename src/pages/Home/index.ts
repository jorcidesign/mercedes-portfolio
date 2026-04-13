import { Component } from '../../core/Component';
import { HeroIntro } from '../../components/organisms/HeroIntro';
import { HeroMain } from '../../components/organisms/HeroMain';
import { WorkGalleryHome } from '../../components/organisms/WorkGalleryHome';
import { ScrollManager } from '../../core/ScrollManager';
import { HomeTimelineController } from '../../controllers/HomeTimelineController';
import { ThemeStore } from '../../store/ThemeStore';
import { SEOManager } from '../../core/SEOManager';
import './style.css';

export class HomePage extends Component {
    private intro: HeroIntro | null = null;
    private trueHero: HeroMain;
    private workGallery: WorkGalleryHome;
    private scrollManager: ScrollManager;
    private timelineController!: HomeTimelineController;

    constructor() {
        super();
        this.scrollManager = ScrollManager.getInstance();
        this.trueHero = new HeroMain();
        this.workGallery = new WorkGalleryHome();

        this.intro = new HeroIntro({
            onIntroComplete: () => this.timelineController.handleIntroComplete()
        });
    }

    render(): string {
        return `
            <div class="p-home" id="page-home">
                <div id="home-header-slot"></div>
                <div id="home-intro-slot"></div>
                <div id="home-true-hero-slot"></div>
                
                <div id="home-work-gallery-slot"></div>
            </div>
        `;
    }

    async onMount(): Promise<void> {
        // 🔥 Candado al scroll desde el milisegundo cero
        this.scrollManager.lock();
        this.scrollManager.target = 0;
        this.scrollManager.current = 0;

        // 🔥 Ocultamos el header si venimos navegando de otra página
        const headerEl = document.getElementById('main-header');
        if (headerEl) {
            headerEl.classList.remove('is-visible');
        }

        // 🔥 NUEVO SEO: Actualizamos tags para la Home
        SEOManager.update({
            title: "Inicio",
            url: window.location.href
        });

        // Montaje
        ThemeStore.getInstance().setTheme('dark');

        if (this.intro) {
            this.intro.mount(document.body);
            this.children.push(this.intro);
        }

        this.mountChild('#home-true-hero-slot', this.trueHero);
        this.mountChild('#home-work-gallery-slot', this.workGallery);

        const introSlot = this.element?.querySelector('#home-intro-slot') as HTMLElement;
        this.timelineController = new HomeTimelineController(
            this.intro,
            this.scrollManager,
            introSlot
        );

        // 🎬 LA DECISIÓN DE ARTE: 
        // Nada de SessionStorage. El telón cae SIEMPRE que entras al Home.
        await this.timelineController.playInitialSequence();
    }
}