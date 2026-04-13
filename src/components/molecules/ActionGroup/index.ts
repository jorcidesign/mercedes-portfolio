import { Component } from '../../../core/Component';
import { NavButton } from '../../atoms/NavButton';
import './style.css';

interface ActionGroupProps {
    onMenuClick?: () => void;
}

export class ActionGroup extends Component<ActionGroupProps> {
    private btnTalk: NavButton;
    private btnMenu: NavButton;

    constructor(props: ActionGroupProps = {}) {
        super(props);

        // 1. Instanciamos el botón de contacto con su ruta (Renderizará un <a>)
        this.btnTalk = new NavButton({
            text: 'LET\'S TALK',
            variant: 'outline',
            href: '/contact'
        });

        // 2. Instanciamos el botón del menú sin ruta (Renderizará un <button>)
        this.btnMenu = new NavButton({
            text: 'MENU',
            variant: 'outline'
        });
    }

    render(): string {
        return `
            <div class="m-action-group">
                <div class="m-action-group__wrapper m-action-group__wrapper--hide-mobile" id="action-talk-slot"></div>
                
                <div class="m-action-group__wrapper" id="action-menu-slot"></div>
            </div>
        `;
    }

    onMount(): void {
        this.mountChild('#action-talk-slot', this.btnTalk);
        this.mountChild('#action-menu-slot', this.btnMenu);

        // Escuchamos el clic en el contenedor del botón MENÚ para abrir/cerrar el Drawer
        const menuBtnElement = this.element?.querySelector('#action-menu-slot');
        if (menuBtnElement && this.props.onMenuClick) {
            this.listenTo(menuBtnElement, 'click', this.props.onMenuClick);
        }
    }

    public setMenuText(newText: string): void {
        this.btnMenu.setText(newText);
    }
}