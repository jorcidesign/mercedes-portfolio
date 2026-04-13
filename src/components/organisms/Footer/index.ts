import { Component } from '../../../core/Component';
import { NavLink } from '../../atoms/NavLink';
import { SocialService } from '../../../services/SocialService';
import { FooterService } from '../../../services/FooterService'; // 🔥 Importamos el nuevo servicio
import './style.css';

export class Footer extends Component {
    private mainLinks: NavLink[] = [];
    private socialLinks: NavLink[] = [];

    constructor() {
        super();

        // ── ENLACES PRINCIPALES (Estáticos) ──
        const menuItems = [
            { text: 'Work', href: '/work' },
            { text: 'Services', href: '/services' },
            { text: 'About', href: '/about' },
            { text: 'Contact', href: '/contact' }
        ];

        menuItems.forEach(item => {
            this.mainLinks.push(new NavLink({ text: item.text, href: item.href, variant: 'basic' }));
        });
    }

    render(): string {
        const mainLinksHtml = this.mainLinks.map((_, i) => `<div class="o-footer__link-item" id="footer-menu-slot-${i}"></div>`).join('');

        return `
            <footer class="o-footer">
                <div class="o-footer__wrapper">
                    
                    <div class="o-footer__top">
                        <div class="o-footer__col-vision">
                            <h2 class="o-footer__vision-text" id="footer-vision-text">Cargando visión...</h2>
                        </div>
                        
                        <div class="o-footer__col-empty"></div>

                        <div class="o-footer__col-menu">
                            <nav class="o-footer__nav">
                                ${mainLinksHtml}
                            </nav>
                        </div>
                    </div>

                    <div class="o-footer__divider"></div>

                    <div class="o-footer__bottom">
                        
                        <div class="o-footer__info-group">
                            <h3 class="o-footer__label">DIRECCIÓN</h3>
                            <p class="o-footer__text" id="footer-address-text">
                                Cargando dirección...
                            </p>
                        </div>

                        <div class="o-footer__info-group">
                            <h3 class="o-footer__label">CONTACTO</h3>
                            <p class="o-footer__text">
                                <a href="#" class="o-footer__link" id="footer-email-link">...</a><br>
                                <a href="#" class="o-footer__link" id="footer-phone-link">...</a>
                            </p>
                        </div>

                        <div class="o-footer__info-group">
                            <h3 class="o-footer__label">SOCIALS</h3>
                            <nav class="o-footer__social-nav" id="footer-socials-container">
                            </nav>
                        </div>

                    </div>

                    <div class="o-footer__copyright">
                        <p>© MERCEDES ASTORIMA 2026. SITIO BY ASTOSTUDIOS.CO INSPIRADO EN EVAGHER - BURUNDANGA STUDIOS</p>
                    </div>

                </div>
            </footer>
        `;
    }

    async onMount(): Promise<void> {
        // 1. Montamos los NavLinks principales
        this.mainLinks.forEach((link, i) => {
            this.mountChild(`#footer-menu-slot-${i}`, link);
        });

        // 🔥 2. Consumimos los datos base del Footer desde Strapi
        try {
            const footerData = await FooterService.getFooterData();
            if (footerData && this.element) {
                const visionEl = this.element.querySelector('#footer-vision-text');
                const addressEl = this.element.querySelector('#footer-address-text');
                const emailEl = this.element.querySelector('#footer-email-link') as HTMLAnchorElement;
                const phoneEl = this.element.querySelector('#footer-phone-link') as HTMLAnchorElement;

                // Inyectamos los textos
                if (visionEl) visionEl.textContent = footerData.visionText;
                if (addressEl) addressEl.innerHTML = footerData.address; // Usamos innerHTML por los <br>

                // Inyectamos textos y atributos href
                if (emailEl) {
                    emailEl.textContent = footerData.email;
                    emailEl.href = `mailto:${footerData.email}`;
                }
                if (phoneEl) {
                    phoneEl.textContent = footerData.phone;
                    // Limpiamos espacios del número para el tel:
                    phoneEl.href = `tel:${footerData.phone.replace(/\s+/g, '')}`;
                }
            }
        } catch (error) {
            console.error("Error cargando los datos del Footer:", error);
        }

        // 3. Montamos las Redes Sociales desde Strapi (Intacto)
        try {
            const socialsData = await SocialService.getSocialNetworks();
            const socialsHtml = socialsData.map((_, i) => `<div class="o-footer__link-item" id="footer-social-slot-${i}"></div>`).join('');
            const socialsContainer = this.element?.querySelector('#footer-socials-container');

            if (socialsContainer) {
                socialsContainer.innerHTML = socialsHtml;

                socialsData.forEach((social, i) => {
                    const linkAtom = new NavLink({
                        text: social.name,
                        href: social.url,
                        variant: 'basic'
                    });
                    this.socialLinks.push(linkAtom);
                    this.mountChild(`#footer-social-slot-${i}`, linkAtom);
                });
            }
        } catch (error) {
            console.error("Error montando redes sociales en el Footer:", error);
        }
    }
}