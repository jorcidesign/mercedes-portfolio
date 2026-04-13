import { Component } from '../../../core/Component';
import { ImageReveal } from '../../atoms/ImageReveal';
import type { WorkData } from '../../../data/works';
import './style.css';

interface WorkGalleryCardProps {
    work: WorkData;
}

export class WorkGalleryCard extends Component<WorkGalleryCardProps> {
    private imageAtom: ImageReveal;

    constructor(props: WorkGalleryCardProps) {
        super(props);
        const { title, imageUrl } = this.props.work;

        // Instanciamos la imagen con el parallax activado
        this.imageAtom = new ImageReveal({
            src: imageUrl,
            alt: title,
            hoverZoom: true,
            parallax: 'vertical'
        });
    }

    render(): string {
        const { id, title, category } = this.props.work;

        return `
            <article class="m-work-gallery-card" id="gallery-card-${id}">
                <div class="m-work-gallery-card__media" id="gallery-media-slot-${id}"></div>
                
                <div class="m-work-gallery-card__info">
                    <h3 class="m-work-gallery-card__title">${title}</h3>
                    <p class="m-work-gallery-card__category">${category}</p>
                </div>
            </article>
        `;
    }

    onMount(): void {
        const { id, slug } = this.props.work;

        // Montamos el átomo de la imagen
        this.mountChild(`#gallery-media-slot-${id}`, this.imageAtom);

        // Hacemos que TODA la tarjeta dispare la navegación en tu SPA
        if (this.element) {
            this.listenTo(this.element, 'click', () => {
                window.history.pushState(null, '', `/work/${slug}`);
                window.dispatchEvent(new Event('popstate'));
            });
        }
    }
}