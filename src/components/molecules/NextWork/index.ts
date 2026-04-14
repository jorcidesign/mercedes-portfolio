import { Component } from '../../../core/Component';
import { ImageReveal } from '../../atoms/ImageReveal';
import { GhostManager } from '../../../core/GhostManager'; // 🔥 Importamos el servicio
import './style.css';

interface NextWorkProps {
    nextWork?: { slug: string; title: string; imageUrl: string } | null;
}

export class NextWork extends Component<NextWorkProps> {
    private nextImageAtom: ImageReveal | null = null;

    constructor(props: NextWorkProps) {
        super(props);
        if (this.props.nextWork) {
            this.nextImageAtom = new ImageReveal({
                src: this.props.nextWork.imageUrl,
                alt: this.props.nextWork.title,
                hoverZoom: false,
                parallax: 'none',
                eager: true // Siempre en caché
            });
        }
    }

    render(): string {
        const { nextWork } = this.props;
        if (!nextWork) return `<div class="m-next-work m-next-work--empty" style="display:none;"></div>`;

        return `
            <a href="/work/${nextWork.slug}" class="m-next-work" id="next-work-trigger">
                <div class="m-next-work__text-area">
                    <h2 class="m-next-work__label">Siguiente<br>Trabajo</h2>
                    <p class="m-next-work__title">${nextWork.title}</p>
                </div>
                
                <div class="m-next-work__image-area" id="next-work-img-slot"></div>
            </a>
        `;
    }

    onMount(): void {
        if (this.nextImageAtom) {
            this.mountChild('#next-work-img-slot', this.nextImageAtom);
        }

        const trigger = this.element as HTMLElement;
        if (trigger && this.props.nextWork) {
            this.listenTo(trigger, 'click', (e) => {
                e.preventDefault();

                // 🔥 EL SECUESTRO: Capturamos la foto justo antes de cambiar de ruta
                const imgSlot = this.element?.querySelector('#next-work-img-slot');
                GhostManager.getInstance().capture(imgSlot as HTMLElement);

                window.history.pushState(null, '', `/work/${this.props.nextWork!.slug}`);
                window.dispatchEvent(new Event('popstate'));
            });
        }
    }
}