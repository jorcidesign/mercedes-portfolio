import { Component } from '../../../core/Component';
import { NavLink } from '../../atoms/NavLink';
import { SplitMenuLink } from '../../atoms/SplitMenuLink';
import { ScrollManager } from '../../../core/ScrollManager';
import { SocialService } from '../../../services/SocialService'; // 🔥 Importamos el nuevo servicio
import './style.css';

interface NavDrawerProps {
    onClose?: () => void;
}

export class NavDrawer extends Component<NavDrawerProps> {
    private giantLinks: SplitMenuLink[] = [];
    private socialLinks: NavLink[] = [];

    constructor(props: NavDrawerProps = {}) {
        super(props);

        const mainMenu = [
            { text: 'HOME', href: '/' },
            { text: 'WORK', href: '/work' },
            { text: 'SERVICES', href: '/services' },
            { text: 'ABOUT', href: '/about' },
            { text: 'CONTACT', href: '/contact' }
        ];

        mainMenu.forEach(item => {
            this.giantLinks.push(new SplitMenuLink({
                text: item.text,
                href: item.href
            }));
        });
    }

    render(): string {
        const giantSlots = this.giantLinks.map((_, i) =>
            `<li class="o-nav-drawer__item" id="drawer-giant-${i}"></li>`
        ).join('');

        return `
            <aside class="o-nav-drawer">
                <nav class="o-nav-drawer__nav">
                    <ul class="o-nav-drawer__list">
                        ${giantSlots}
                    </ul>
                </nav>
                
                <footer class="o-nav-drawer__footer">
                    <span class="o-nav-drawer__footer-label">SOCIALS:</span>
                    <div class="o-nav-drawer__socials" id="drawer-socials-slot"></div>
                </footer>
            </aside>
        `;
    }

    async onMount(): Promise<void> {
        // 1. Montamos los enlaces gigantes del menú
        this.giantLinks.forEach((link, i) => {
            this.mountChild(`#drawer-giant-${i}`, link);

            if (link.element) {
                this.listenTo(link.element, 'click', () => {
                    this.close();
                });
            }
        });

        // 🔥 2. Integramos Strapi para las Redes Sociales con estilo de comas
        try {
            const socialsData = await SocialService.getSocialNetworks();

            // En tu NavDrawer.ts, dentro del try de redes sociales:
            const socialsHtml = socialsData.map((_, i) =>
                `<div class="o-nav-drawer__social-item-wrapper" id="drawer-social-item-${i}"></div>`
            ).join('');

            const socialsContainer = this.element?.querySelector('#drawer-socials-slot');

            if (socialsContainer) {
                socialsContainer.innerHTML = socialsHtml;

                socialsData.forEach((social, i) => {
                    const linkAtom = new NavLink({
                        text: social.name, // El CSS se encargará de ponerlo en mayúsculas
                        href: social.url,
                        variant: 'basic'
                    });
                    this.socialLinks.push(linkAtom);
                    this.mountChild(`#drawer-social-item-${i}`, linkAtom);
                });
            }
        } catch (error) {
            console.error("Error montando redes sociales en NavDrawer:", error);
        }
    }
    // ─────────────────────────────────────────────────────────────────────────
    // MÉTODOS DE APERTURA, CIERRE Y UX
    // ─────────────────────────────────────────────────────────────────────────

    public open(): void {
        this.element?.classList.add('is-open');

        // Bloqueamos el scroll
        ScrollManager.getInstance().lock();

        // Activamos los listeners globales (con un ligero delay)
        setTimeout(() => {
            document.addEventListener('click', this.handleOutsideClick);
            // 🔥 ELIMINAMOS EL TOUCHSTART AQUÍ
            document.addEventListener('keydown', this.handleKeyDown);
        }, 10);
    }

    public close(): void {
        this.element?.classList.remove('is-open');

        // Desbloqueamos el scroll
        ScrollManager.getInstance().unlock();

        // Limpiamos los eventos
        document.removeEventListener('click', this.handleOutsideClick);
        // 🔥 ELIMINAMOS EL TOUCHSTART AQUÍ
        document.removeEventListener('keydown', this.handleKeyDown);

        if (this.props.onClose) this.props.onClose();
    }
    private handleOutsideClick = (e: MouseEvent | TouchEvent): void => {
        const target = e.target as HTMLElement;

        if (this.element && !this.element.contains(target)) {
            this.close();
        }
    };

    private handleKeyDown = (e: KeyboardEvent): void => {
        if (e.key === 'Escape' || e.key === 'Esc') {
            this.close();
        }
    };

    override onDestroy(): void {
        this.close();
        super.onDestroy();
    }
}