import { Component } from '../../../core/Component';
import { ScrollManager } from '../../../core/ScrollManager';
import './style.css';

interface ParallaxTitleProps {
    text: string;
    font?: 'sans' | 'serif';
    fontStyle?: 'normal' | 'italic';
    speed?: number;
    align?: 'left' | 'right' | 'center';  // ← nuevo
    customClass?: string;
}

export class ParallaxTitle extends Component<ParallaxTitleProps> {
    private scrollManager: ScrollManager;
    private rafId: number = 0;
    private innerElement: HTMLElement | null = null;

    constructor(props: ParallaxTitleProps) {
        super({
            font: 'sans',
            fontStyle: 'normal',
            speed: 0.1,
            align: 'left',
            customClass: '',
            ...props
        });

        this.scrollManager = ScrollManager.getInstance();
        this.loop = this.loop.bind(this);
    }

    render(): string {
        const { text, font, fontStyle, align, customClass } = this.props;

        const fontClass = font === 'serif' ? 'a-parallax-title--serif' : 'a-parallax-title--sans';
        const styleClass = fontStyle === 'italic' ? 'a-parallax-title--italic' : '';
        const alignClass = `a-parallax-title--${align}`;

        return `
            <div class="a-parallax-title ${fontClass} ${styleClass} ${alignClass} ${customClass}">
                <div class="a-parallax-title__inner" id="parallax-inner">
                    ${text}
                </div>
            </div>
        `;
    }

    onMount(): void {
        this.innerElement = this.element?.querySelector('#parallax-inner') as HTMLElement;

        if (this.props.speed !== 0) {
            this.rafId = requestAnimationFrame(this.loop);
        }
    }

    private loop(): void {
        if (!this.innerElement) return;

        const scrollY = this.scrollManager.current;
        const yOffset = scrollY * this.props.speed!;
        this.innerElement.style.transform = `translate3d(0, -${yOffset}px, 0)`;

        this.rafId = requestAnimationFrame(this.loop);
    }

    override onDestroy(): void {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        super.onDestroy();
    }
}