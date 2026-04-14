import { Component } from '../../../core/Component';
import { NavButton } from '../../atoms/NavButton';
import { ImageReveal } from '../../atoms/ImageReveal';
import { WorkInfo } from '../../atoms/WorkInfo';
import type { WorkData } from '../../../data/works';
import './style.css';

interface WorkCardProps {
    work: WorkData;
}

export class WorkCard extends Component<WorkCardProps> {
    private imageAtom: ImageReveal;
    private infoAtom: WorkInfo;
    private btnViewAlbum: NavButton;

    constructor(props: WorkCardProps) {
        super(props);
        const { title, description, category, date, imageUrl, slug } = this.props.work;

        // 🔥 LOGICA DE ORIENTACIÓN (Mock): 
        // Si en el futuro tienes 'work.orientation' desde Strapi, úsalo.
        // Por ahora, asumimos 'portrait' (Vertical) por defecto. 
        // Si quieres probar horizontal, cambia esto manualmente a 'landscape'.
        // const imageOrientation = 'portrait';

        // 1. Instanciamos la Imagen
        this.imageAtom = new ImageReveal({
            src: imageUrl,
            alt: title,
            hoverZoom: true,
            parallax: 'vertical',
            // ❌ Sin aspectRatio — la imagen real decide su alto
        });

        // 2. Instanciamos el Texto
        this.infoAtom = new WorkInfo({
            title: title,
            category: category,
            date: date,
            description: description,
            href: `/work/${slug}`
        });

        // 3. Instanciamos el Botón
        // 🔥 Refactorización: Le pasamos el href directamente para que sea 100% semántico
        this.btnViewAlbum = new NavButton({
            text: 'VER ÁLBUM',
            variant: 'bracket',
            href: `/work/${slug}`
        });
    }

    render(): string {
        const { layout, id } = this.props.work;
        const layoutClass = layout === 'image-right' ? 'm-work-card--right' : 'm-work-card--left';

        return `
            <article class="m-work-card ${layoutClass}" id="work-card-${id}">
                <div class="m-work-card__media" id="work-card-media-${id}"></div>
                
                <div class="m-work-card__content">
                    <div id="work-card-info-${id}"></div>
                    <div class="m-work-card__action" id="work-card-btn-${id}"></div>
                </div>
            </article>
        `;
    }

    onMount(): void {
        const { id, slug } = this.props.work;
        this.mountChild(`#work-card-media-${id}`, this.imageAtom);
        this.mountChild(`#work-card-info-${id}`, this.infoAtom);
        this.mountChild(`#work-card-btn-${id}`, this.btnViewAlbum);

        // Mantenemos la navegación por JS exclusivamente para la imagen
        const mediaSlot = this.element?.querySelector(`#work-card-media-${id}`);
        if (mediaSlot) {
            this.listenTo(mediaSlot, 'click', () => {
                window.history.pushState(null, '', `/work/${slug}`);
                window.dispatchEvent(new Event('popstate'));
            });
        }

        // 🔥 Se eliminó el listener manual de 'btnSlot' porque el NavButton 
        // ahora renderiza un <a> con data-router-link y se rutea solo.
    }
}