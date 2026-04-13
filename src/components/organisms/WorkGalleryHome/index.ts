import { Component } from '../../../core/Component';
import { WorkCard } from '../../molecules/WorkCard';
import { WorkService } from '../../../services/WorkService';
import './style.css';

export class WorkGalleryHome extends Component {
    private workCards: WorkCard[] = [];

    constructor() {
        super();
    }

    render(): string {
        return `
            <section class="o-work-gallery-home" id="work-gallery">
                <div class="o-work-gallery-home__header">
                    <h2 class="o-work-gallery-home__title">SELECTED WORK</h2>
                </div>
                
                <div class="o-work-gallery-home__grid" id="work-gallery-grid">
                    <p class="o-work-gallery-home__loading">Cargando trabajos espectaculares...</p>
                </div>
            </section>
        `;
    }

    async onMount(): Promise<void> {
        try {
            const recentWorks = await WorkService.getRecentWorks();
            const gridElement = this.element?.querySelector('#work-gallery-grid');

            if (!recentWorks || recentWorks.length === 0) {
                if (gridElement) {
                    gridElement.innerHTML = '<p class="o-work-gallery-home__empty">Aún no hay trabajos publicados. ¡Vuelve pronto!</p>';
                }
                return;
            }

            this.workCards = recentWorks.map(work => new WorkCard({ work }));

            const slotsHtml = this.workCards.map((_, index) =>
                `<div id="work-gallery-slot-${index}"></div>`
            ).join('');

            if (gridElement) {
                gridElement.innerHTML = slotsHtml;
            }

            this.workCards.forEach((card, index) => {
                this.mountChild(`#work-gallery-slot-${index}`, card);
            });

        } catch (error) {
            console.error("Fallo al cargar la galería desde Strapi:", error);
            const gridElement = this.element?.querySelector('#work-gallery-grid');
            if (gridElement) {
                gridElement.innerHTML = '<p class="o-work-gallery-home__error">Lo sentimos, no pudimos cargar los trabajos en este momento.</p>';
            }
        }
    }
}