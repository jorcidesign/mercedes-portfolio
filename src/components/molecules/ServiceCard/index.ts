import { Component } from '../../../core/Component';
import { ImageReveal } from '../../atoms/ImageReveal';
import { NavButton } from '../../atoms/NavButton';
import type { ServiceData } from '../../../data/services';
import './style.css';

interface ServiceCardProps {
    service: ServiceData;
    index: number;
}

export class ServiceCard extends Component<ServiceCardProps> {
    private imageAtom: ImageReveal;
    private actionButton: NavButton;

    constructor(props: ServiceCardProps) {
        super(props);

        this.imageAtom = new ImageReveal({
            src: this.props.service.imageUrl,
            alt: this.props.service.imageAlt,
            hoverZoom: false,
            parallax: 'none'
        });

        // El botón ahora usa nuestra nueva lógica de ruteo semántico
        this.actionButton = new NavButton({
            text: 'SOLICITAR',
            variant: 'bracket',
            href: '/contact' // 🔥 Va directo al contacto
        });
    }

    render(): string {
        const { service, index } = this.props;
        const formattedIndex = (index + 1).toString().padStart(2, '0');
        const featuresHtml = service.features.map(f => `<li>${f}</li>`).join('');

        return `
            <article class="m-service-card" id="service-card-${service.id}">
                
                <header class="m-service-card__header">
                    <h2 class="m-service-card__title">${service.title}</h2>
                    <span class="m-service-card__index">${formattedIndex}</span>
                </header>

                <div class="m-service-card__body">
                    
                    <div class="m-service-card__left">
                        <div class="m-service-card__text-content">
                            <p class="m-service-card__desc">${service.description}</p>
                            <ul class="m-service-card__features">
                                ${featuresHtml}
                            </ul>
                        </div>
                        
                        <div class="m-service-card__action-block">
                            <span class="m-service-card__price">${service.price}</span>
                            <div class="m-service-card__btn-wrapper" id="service-btn-slot-${service.id}"></div>
                        </div>
                    </div>

                    <div class="m-service-card__right">
                        <div class="m-service-card__img-wrapper" id="service-img-slot-${service.id}"></div>
                    </div>

                </div>
                
            </article>
        `;
    }

    onMount(): void {
        this.mountChild(`#service-img-slot-${this.props.service.id}`, this.imageAtom);
        this.mountChild(`#service-btn-slot-${this.props.service.id}`, this.actionButton);
        // Eliminamos el listener manual del botón porque ahora NavButton se encarga del ruteo.
    }
}