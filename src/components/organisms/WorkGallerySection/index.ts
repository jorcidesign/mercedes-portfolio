import { Component } from '../../../core/Component';
import { WorkGalleryCard } from '../../molecules/WorkGalleryCard';
import type { WorkData } from '../../../data/works';
import './style.css';

interface WorkGallerySectionProps {
    works: WorkData[];
}

export class WorkGallerySection extends Component<WorkGallerySectionProps> {
    private cards: WorkGalleryCard[] = [];

    constructor(props: WorkGallerySectionProps) {
        super(props);

        // Instanciamos una molécula por cada proyecto
        this.props.works.forEach(work => {
            this.cards.push(new WorkGalleryCard({ work }));
        });
    }

    render(): string {
        let leftColumnHtml = '';
        let rightColumnHtml = '';

        // 🔥 Distribuimos los slots: Pares a la izquierda, Impares a la derecha
        this.props.works.forEach((work, index) => {
            const slot = `<div class="o-work-gallery__item" id="gallery-card-slot-${work.id}"></div>`;
            if (index % 2 === 0) {
                leftColumnHtml += slot;
            } else {
                rightColumnHtml += slot;
            }
        });

        return `
            <section class="o-work-gallery">
                <div class="o-work-gallery__wrapper">
                    
                    <div class="o-work-gallery__columns">
                        
                        <div class="o-work-gallery__col o-work-gallery__col--left">
                            ${leftColumnHtml}
                        </div>

                        <div class="o-work-gallery__col o-work-gallery__col--right">
                            ${rightColumnHtml}
                        </div>

                    </div>
                    
                </div>
            </section>
        `;
    }

    onMount(): void {
        // Montamos cada tarjeta en su hueco (El DOM lo encontrará sin importar en qué columna esté)
        this.props.works.forEach((work, index) => {
            this.mountChild(`#gallery-card-slot-${work.id}`, this.cards[index]);
        });
    }
}