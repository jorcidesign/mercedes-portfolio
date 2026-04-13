import { Component } from '../../../core/Component';
import './style.css';

interface ImageRevealProps {
    src: string;
    alt: string;
    hoverZoom?: boolean;
    parallax?: 'vertical' | 'horizontal' | 'none';
    eager?: boolean; // 🔥 Cuando viene de un preload, forzamos eager para que pinte al instante
}

export class ImageReveal extends Component<ImageRevealProps> {
    private parallaxWrap: HTMLElement | null = null;
    private rafId: number = 0;
    private isVisible: boolean = false;
    private observer: IntersectionObserver | null = null;

    // 🔥 FIX: Cache de ventana — se leen una vez, no en cada frame
    private windowH: number = 0;
    private windowW: number = 0;

    constructor(props: ImageRevealProps) {
        super({
            hoverZoom: true,
            parallax: 'none',
            eager: false,
            ...props
        });
    }

    render(): string {
        const { src, alt, hoverZoom, parallax, eager } = this.props;
        const hoverClass = hoverZoom ? 'a-image-reveal--hover' : '';

        return `
        <figure class="a-image-reveal ${hoverClass}" data-parallax="${parallax}">
            <div class="a-image-reveal__frame">
                <div class="a-image-reveal__parallax" id="parallax-wrap">
                    <img 
                        src="${src}" 
                        alt="${alt}" 
                        class="a-image-reveal__img" 
                        loading="${eager ? 'eager' : 'lazy'}"
                        decoding="${eager ? 'sync' : 'async'}"
                    />
                </div>
            </div>
        </figure>
    `;
    }

    onMount(): void {
        this.parallaxWrap = this.element?.querySelector('#parallax-wrap') as HTMLElement;

        if (this.props.parallax !== 'none') {
            this.initParallax();
        }
    }

    private initParallax(): void {
        // 🔥 FIX: Leemos el DOM solo una vez aquí, no en cada frame del loop
        this.windowH = window.innerHeight;
        this.windowW = window.innerWidth;

        this.observer = new IntersectionObserver((entries) => {
            this.isVisible = entries[0].isIntersecting;

            if (this.isVisible) {
                if (this.rafId) cancelAnimationFrame(this.rafId); // 🛡️ Anti-duplicación de loops
                this.loop();
            } else {
                if (this.rafId) {
                    cancelAnimationFrame(this.rafId);
                    this.rafId = 0;
                }
            }
        }, { rootMargin: "100px" });

        if (this.element) {
            this.observer.observe(this.element);
        }
    }

    private loop = (): void => {
        if (!this.isVisible || !this.parallaxWrap || !this.element) return;

        // getBoundingClientRect es inevitable aquí — necesitamos la posición actual
        const rect = this.element.getBoundingClientRect();

        // 🔥 FIX: Usamos caché en lugar de window.innerHeight/Width en cada frame
        const yProgress = ((rect.top + rect.height / 2) - (this.windowH / 2)) / (this.windowH / 2 + rect.height / 2);
        const xProgress = ((rect.left + rect.width / 2) - (this.windowW / 2)) / (this.windowW / 2 + rect.width / 2);

        if (this.props.parallax === 'vertical') {
            const yOffset = yProgress * 10;
            this.parallaxWrap.style.transform = `translate3d(0, ${yOffset}%, 0)`;
        } else if (this.props.parallax === 'horizontal') {
            const xOffset = xProgress * 10;
            this.parallaxWrap.style.transform = `translate3d(${xOffset}%, 0, 0)`;
        }

        this.rafId = requestAnimationFrame(this.loop);
    };

    override onDestroy(): void {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        if (this.observer) this.observer.disconnect();
        super.onDestroy();
    }
}