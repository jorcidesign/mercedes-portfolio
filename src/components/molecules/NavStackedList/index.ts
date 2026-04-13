import { Component } from '../../../core/Component';
import { NavLink } from '../../atoms/NavLink';
import './style.css';

interface NavStackedListProps {
    links?: { text: string; href: string }[];
}

export class NavStackedList extends Component<NavStackedListProps> {
    private linkComponents: NavLink[] = [];

    constructor(props?: NavStackedListProps) {
        super({
            // 🔥 FIX: Rutas absolutas con el '/' al inicio
            links: [
                { text: 'WORK', href: '/work' },
                { text: 'SERVICES', href: '/services' },
                { text: 'ABOUT', href: '/about' },
                // { text: 'BTS', href: '/bts' }
            ],
            ...props
        });

        // 1. Instanciamos los Átomos
        this.props.links!.forEach(link => {
            this.linkComponents.push(new NavLink({
                text: link.text,
                href: link.href,
                variant: 'stacked'
            }));
        });
    }

    render(): string {
        // 3. CAJA INNER (Los slots <li>)
        const linksHtml = this.props.links!.map((_, index) =>
            `<li class="m-nav-stacked__item" id="stacked-link-${index}"></li>`
        ).join('');

        return `
            <nav class="m-nav-stacked">
                <ul class="m-nav-stacked__list">
                    ${linksHtml}
                </ul>
            </nav>
        `;
    }

    onMount(): void {
        this.linkComponents.forEach((linkComponent, index) => {
            this.mountChild(`#stacked-link-${index}`, linkComponent);
        });
    }
}