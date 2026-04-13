import { Component } from '../../core/Component';
import { HeaderGlobal } from '../../components/organisms/HeaderGlobal';
import { Footer } from '../../components/organisms/Footer';
import { ScrollManager } from '../../core/ScrollManager';

export class MainLayout extends Component {
    private header: HeaderGlobal;
    private footer: Footer;
    private scrollManager: ScrollManager;
    private currentPage: Component | null = null;

    constructor() {
        super();
        this.header = new HeaderGlobal();
        this.footer = new Footer();
        this.scrollManager = ScrollManager.getInstance();

        // Mantenemos los listeners simples para apagar el footer en WorkDetailPage
        window.addEventListener('app:disable-footer', () => this.disableFooter());
        window.addEventListener('app:enable-footer', () => this.enableFooter());
    }

    render(): string {
        return `
            <div id="main-layout">
                <div id="layout-header-slot"></div>
                
                <div id="smooth-wrapper" class="l-smooth-wrapper">
                    <main id="layout-page-slot"></main>
                    
                    <div id="layout-footer-slot"></div>
                </div>
            </div>
        `;
    }

    async onMount(): Promise<void> {
        this.mountChild('#layout-header-slot', this.header);
        this.mountChild('#layout-footer-slot', this.footer);
        this.scrollManager.init();
    }

    public setPage(pageComponent: Component): void {
        if (this.currentPage) {
            this.currentPage.onDestroy();
        }

        this.enableFooter(); // Por defecto encendido siempre

        this.currentPage = pageComponent;
        this.mountChild('#layout-page-slot', this.currentPage);

        this.scrollManager.target = 0;
        this.scrollManager.current = 0;

        setTimeout(() => {
            if (typeof (this.scrollManager as any)['calcMaxScroll'] === 'function') {
                (this.scrollManager as any)['calcMaxScroll']();
            }
        }, 100);
    }

    // ── APAGADO/ENCENDIDO SIMPLE SIN FÍSICAS ──
    public disableFooter(): void {
        const footerSlot = this.element?.querySelector('#layout-footer-slot') as HTMLElement;
        if (footerSlot) footerSlot.style.display = 'none';
    }

    public enableFooter(): void {
        const footerSlot = this.element?.querySelector('#layout-footer-slot') as HTMLElement;
        if (footerSlot) footerSlot.style.display = 'block';
    }
}