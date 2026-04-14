import { Component } from '../../../core/Component';
import { ThemeStore } from '../../../store/ThemeStore';
import { RouterStore } from '../../../store/RouterStore'; // 🔥 Importamos el mensajero
import './style.css';

interface NavLinkProps {
    text: string;
    href?: string;
    variant?: 'stacked' | 'basic';
    forceTheme?: 'light' | 'dark';
    target?: string;
}

export class NavLink extends Component<NavLinkProps> {
    constructor(props: NavLinkProps) {
        super({
            href: '#',
            variant: 'basic',
            ...props
        });
    }

    render(): string {
        const { text, href, variant, forceTheme, target } = this.props;
        const initialTheme = forceTheme ?? 'dark';

        const isExternal = href?.startsWith('http') || href?.startsWith('mailto:') || href?.startsWith('tel:');
        const targetAttr = target || (isExternal ? '_blank' : '_self');
        const relAttr = targetAttr === '_blank' ? 'rel="noopener noreferrer"' : '';
        const routerAttr = isExternal ? '' : 'data-router-link';

        return `
            <a href="${href}" target="${targetAttr}" ${relAttr} class="a-nav-link a-nav-link--${variant} theme-${initialTheme}" ${routerAttr}>
                <span class="a-nav-link__text">${text}</span>
            </a>
        `;
    }

    onMount(): void {
        // 1. Suscripción al Tema (Solo si no está forzado)
        if (!this.props.forceTheme) {
            const unsubTheme = ThemeStore.getInstance().subscribe((newTheme) => {
                if (!this.element) return;
                this.element.classList.remove('theme-light', 'theme-dark');
                this.element.classList.add(`theme-${newTheme}`);
            });
            this.registerCleanup(unsubTheme);
        }

        // 🔥 2. Suscripción a la Ruta (ESTO ES LO NUEVO)
        if (this.props.href) {
            const unsubRouter = RouterStore.getInstance().subscribe((currentPath) => {
                if (!this.element) return;

                // Si la ruta exacta coincide con el href del link, lo activamos
                if (currentPath === this.props.href) {
                    this.element.classList.add('is-active');
                } else {
                    this.element.classList.remove('is-active');
                }
            });
            this.registerCleanup(unsubRouter);
        }
    }
}