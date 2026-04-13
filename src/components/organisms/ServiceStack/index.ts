import { Component } from '../../../core/Component';
import { ServiceCard } from '../../molecules/ServiceCard';
import { ScrollManager } from '../../../core/ScrollManager';
import type { ServiceData } from '../../../data/services';
import './style.css';

interface ServiceStackProps {
    services: ServiceData[];
}

export class ServiceStack extends Component<ServiceStackProps> {
    private cards: ServiceCard[] = [];
    private rafId: number = 0;
    private cardEls: HTMLElement[] = [];

    // Opacidades por profundidad de enterramiento:
    // [activa, 1 card encima, 2 cards encima, 3+]
    private readonly OPACITY_LEVELS = [1, 0.5, 0.25, 0.1, 0];

    constructor(props: ServiceStackProps) {
        super(props);
        this.props.services.forEach((service, index) => {
            this.cards.push(new ServiceCard({ service, index }));
        });
    }

    render(): string {
        const stackHtml = this.props.services.map(service => `
            <div id="service-card-slot-${service.id}"></div>
        `).join('');

        return `
            <section class="o-service-stack">
                <div class="o-service-stack__wrapper">
                    ${stackHtml}
                </div>
            </section>
        `;
    }

    onMount(): void {
        this.props.services.forEach((service, index) => {
            this.mountChild(`#service-card-slot-${service.id}`, this.cards[index]);
        });

        // Doble rAF: primer frame monta el DOM, segundo frame lee posiciones reales
        requestAnimationFrame(() => {
            requestAnimationFrame(() => {
                this.cardEls = Array.from(
                    document.querySelectorAll<HTMLElement>('.m-service-card')
                );

                this.cardEls.forEach(card => {
                    card.style.transition = 'opacity 0.5s cubic-bezier(0.25, 0.1, 0.25, 1)';
                    card.style.willChange = 'opacity';
                });

                this.startLoop();
            });
        });
    }

    private startLoop(): void {
        const scroll = ScrollManager.getInstance();

        const tick = () => {
            this.updateOpacities(scroll.current);
            this.rafId = requestAnimationFrame(tick);
        };

        this.rafId = requestAnimationFrame(tick);
    }

    private updateOpacities(scrollY: number): void {
        if (this.cardEls.length === 0) return;

        // offsetTop = posición real del elemento en el documento (ignora el transform del wrapper)
        // Un card está "enterrado" cuando su offsetTop <= scrollY
        // porque el wrapper se movió -scrollY y el card quedó por encima del viewport
        const cardTops = this.cardEls.map(card => card.offsetTop);

        this.cardEls.forEach((card, i) => {
            const isPinned = cardTops[i] <= scrollY;

            if (!isPinned) {
                card.style.opacity = '1';
                return;
            }

            // Cuántas cards POSTERIORES también están pinned (encima de esta)
            let stackDepth = 0;
            for (let j = i + 1; j < this.cardEls.length; j++) {
                if (cardTops[j] <= scrollY) {
                    stackDepth++;
                }
            }

            const opacityIndex = Math.min(stackDepth, this.OPACITY_LEVELS.length - 1);
            card.style.opacity = String(this.OPACITY_LEVELS[opacityIndex]);
        });
    }

    destroy(): void {
        if (this.rafId) cancelAnimationFrame(this.rafId);
        this.cards.forEach(card => card.onDestroy?.());
    }
}