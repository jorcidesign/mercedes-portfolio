import { Component } from '../../../core/Component';
import { LogoFull } from '../../atoms/LogoFull';
import './style.css';

export class LogoCurtain extends Component {
    private logoAtom: LogoFull;

    constructor() {
        super();
        this.logoAtom = new LogoFull({ theme: 'dark' });
    }

    render(): string {
        return `
            <div class="m-logo-curtain">
                <div class="m-logo-curtain__logo" id="curtain-logo-slot"></div>
                <div class="m-logo-curtain__door" id="curtain-door"></div>
            </div>
        `;
    }

    onMount(): void {
        this.mountChild('#curtain-logo-slot', this.logoAtom);
    }

    // 🎬 Coreografía con Promesas
    public async playCurtain(): Promise<void> {
        return new Promise((resolve) => {
            const logo = this.element?.querySelector('#curtain-logo-slot') as HTMLElement;
            const door = this.element?.querySelector('#curtain-door') as HTMLElement;

            if (!logo || !door) {
                resolve();
                return;
            }

            // FASE 1
            setTimeout(() => {
                logo.classList.add('is-visible');
            }, 100);

            // FASE 2
            setTimeout(() => {
                door.classList.add('is-cutting');
            }, 1500);

            // FASE 3
            setTimeout(() => {
                door.classList.add('is-expanding');
            }, 2100);

            // FIN
            setTimeout(() => {
                resolve();
            }, 3000);
        });
    }
}