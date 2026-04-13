import { Component } from '../../../core/Component';
import { NavStackedList } from '../../molecules/NavStackedList';
import { ActionGroup } from '../../molecules/ActionGroup';
import { LogoIsotype } from '../../atoms/LogoIsotype';
import { NavDrawer } from '../NavDrawer';
import { ThemeStore } from '../../../store/ThemeStore';
import './style.css';

export class HeaderGlobal extends Component {
    private navList: NavStackedList;
    private logo: LogoIsotype;
    private actionGroup: ActionGroup;
    private navDrawer: NavDrawer;

    private isMenuOpen: boolean = false;

    constructor() {
        super();
        this.navList = new NavStackedList();
        this.logo = new LogoIsotype();

        // 🔥 FIX: Le pasamos el callback onClose al NavDrawer
        this.navDrawer = new NavDrawer({
            onClose: () => this.syncMenuStateClosed()
        });
        // this.navDrawer = new NavDrawer();
        this.actionGroup = new ActionGroup({
            onMenuClick: () => this.toggleMenu()
        });
    }

    render(): string {
        return `
            <header class="o-header-global" id="main-header">
                <div class="o-header-global__outer">
                    <div class="o-header-global__inner">
                        <div class="o-header-global__grid">
                            <div class="o-header-global__col o-header-global__col--left">
                                <div id="header-nav-list-slot"></div>
                            </div>
                            <div class="o-header-global__col o-header-global__col--center">
                                <div id="header-logo-slot"></div>
                            </div>
                            <div class="o-header-global__col o-header-global__col--right">
                                <div class="o-header-global__action-push">
                                    <div id="header-action-slot"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    onMount(): void {
        this.mountChild('#header-nav-list-slot', this.navList);
        this.mountChild('#header-logo-slot', this.logo);
        this.mountChild('#header-action-slot', this.actionGroup);

        this.navDrawer.mount(document.body);
        this.children.push(this.navDrawer);
    }

    // El Header actúa como proxy. Cuando la página cambie, llama a esto.
    public setTheme(newTheme: 'light' | 'dark'): void {
        ThemeStore.getInstance().setTheme(newTheme);
    }

    private toggleMenu(): void {
        this.isMenuOpen = !this.isMenuOpen;

        if (this.isMenuOpen) {
            this.actionGroup.setMenuText('CLOSE');
            this.navDrawer.open();
            // 🔥 LA MAGIA: Solo inyectamos una bandera visual de estado
            this.element?.classList.add('is-drawer-open');
        } else {
            this.actionGroup.setMenuText('MENU');
            this.navDrawer.close();
            // 🔥 Removemos la bandera visual
            this.element?.classList.remove('is-drawer-open');
        }
    }
    // 🔥 NUEVO MÉTODO: Sincroniza el estado del Header cuando el Drawer se cierra por cualquier motivo
    private syncMenuStateClosed(): void {
        this.isMenuOpen = false;
        this.actionGroup.setMenuText('MENU');
        this.element?.classList.remove('is-drawer-open');
    }
    public fadeIn(): void {
        if (!this.element) return;
        this.element.classList.add('is-visible');
    }
}