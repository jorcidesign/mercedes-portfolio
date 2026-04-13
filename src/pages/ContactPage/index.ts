import { Component } from '../../core/Component';
import { ParallaxTitle } from '../../components/atoms/ParallaxTitle';
import { ContactForm } from '../../components/molecules/ContactForm';
import { ThemeStore } from '../../store/ThemeStore';
import { ScrollManager } from '../../core/ScrollManager';
import './style.css';

export class ContactPage extends Component {
    private mainTitle: ParallaxTitle;
    private formComponent: ContactForm;

    constructor() {
        super();

        this.mainTitle = new ParallaxTitle({
            text: 'HABLEMOS',
            font: 'sans',
            speed: 0.1,
            customClass: 'p-contact__title'
        });

        this.formComponent = new ContactForm();
    }

    // ─────────────────────────────────────────────────────────────────────────
    // PRELOAD (Sin imágenes, pero respetando la arquitectura)
    // ─────────────────────────────────────────────────────────────────────────
    public async preload(): Promise<void> {
        // Le damos 400ms artificiales para que la línea de transición
        // se expanda elegantemente y no parpadee instantáneamente.
        console.log(`[ContactPage] Preparando vista...`);
        await new Promise(resolve => setTimeout(resolve, 400));
    }

    render(): string {
        return `
            <div class="p-contact" id="page-contact">
                <header class="p-contact__hero">
                    <div class="p-contact__container">
                        <div id="contact-title-slot"></div>
                    </div>
                </header>
                
                <main class="p-contact__content">
                    <div class="p-contact__container">
                        <div class="p-contact__form-wrapper">
                            <div class="p-contact__text">
                                <p>¿Tienes un proyecto en mente o una fecha especial? Escríbeme y diseñemos juntas tu próximo look.</p>
                            </div>
                            <div class="p-contact__form-box" id="contact-form-slot"></div>
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

        this.mountChild('#contact-title-slot', this.mainTitle);
        this.mountChild('#contact-form-slot', this.formComponent);
    }
}