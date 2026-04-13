import { Component } from '../../../core/Component';
import { ParallaxTitle } from '../../atoms/ParallaxTitle';
import type { WorkData } from '../../../data/works';
import './style.css';

interface HeroWorkDetailProps {
    work: WorkData;
}

export class HeroWorkDetail extends Component<HeroWorkDetailProps> {
    private titleTop: ParallaxTitle;
    private titleBottom: ParallaxTitle | null = null;

    constructor(props: HeroWorkDetailProps) {
        super(props);
        const { title } = this.props.work;

        const words = title.split(' ');
        const topText = words[0] || '';
        const bottomText = words.slice(1).join(' ') || '';

        // Títulos con Parallax (suben solos gracias a tu ScrollManager)
        this.titleTop = new ParallaxTitle({
            text: topText,
            font: 'sans',
            speed: 0.15,
            customClass: 'o-hero-work-detail__title'
        });

        if (bottomText) {
            this.titleBottom = new ParallaxTitle({
                text: bottomText,
                font: 'serif',
                fontStyle: 'italic',
                speed: 0.05,
                customClass: 'o-hero-work-detail__title'
            });
        }
    }

    render(): string {
        const { category, description } = this.props.work;

        return `
            <section class="o-hero-work-detail">
                <div class="o-hero-work-detail__container">
                    
                    <div class="o-hero-work-detail__grid">
                        
                        <div class="o-hero-work-detail__text-col">
                            <div class="o-hero-work-detail__titles">
                                <div id="hero-detail-slot-top"></div>
                                ${this.titleBottom ? `<div id="hero-detail-slot-bottom"></div>` : ''}
                            </div>
                            
                            <span class="o-hero-work-detail__category">${category}</span>
                            <div class="o-hero-work-detail__desc-wrapper">
                                <p class="o-hero-work-detail__description">${description}</p>
                            </div>
                        </div>

                        <div class="o-hero-work-detail__empty-col"></div>

                    </div>
                </div>
            </section>
        `;
    }

    onMount(): void {
        this.mountChild('#hero-detail-slot-top', this.titleTop);
        if (this.titleBottom) {
            this.mountChild('#hero-detail-slot-bottom', this.titleBottom);
        }
    }
}