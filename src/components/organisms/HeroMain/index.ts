import { Component } from '../../../core/Component';
import { ParallaxTitle } from '../../atoms/ParallaxTitle';
import './style.css';

export class HeroMain extends Component {
    private titleTop: ParallaxTitle;
    private titleBottom: ParallaxTitle;

    constructor() {
        super();

        // 1. Instanciamos los Átomos con sus configuraciones independientes
        this.titleTop = new ParallaxTitle({
            text: 'LATEST &',
            font: 'sans',
            speed: 0.15, // Sube rápido

            // Le pasamos una clase específica para controlarle el layout desde este Organismo
            customClass: 'o-hero-main__title-top'
        });

        this.titleBottom = new ParallaxTitle({
            text: 'GREATEST',
            font: 'serif',
            fontStyle: 'italic',
            speed: 0.05, // Sube lento

            customClass: 'o-hero-main__title-bottom'
        });
    }

    render(): string {
        return `
            <section class="o-hero-main">
                
                <div class="o-hero-main__container">
                    
                    <div class="o-hero-main__content">
                        <div id="hero-slot-top"></div>
                        <div id="hero-slot-bottom"></div>
                    </div>
                    
                </div>
            </section>
        `;
    }

    onMount(): void {
        // Enchufamos los átomos a sus slots
        this.mountChild('#hero-slot-top', this.titleTop);
        this.mountChild('#hero-slot-bottom', this.titleBottom);
    }
}