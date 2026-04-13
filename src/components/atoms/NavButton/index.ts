import { Component } from '../../../core/Component';
import { ThemeStore } from '../../../store/ThemeStore';
import './style.css';

interface NavButtonProps {
    text: string;
    variant?: 'outline' | 'bracket';
    href?: string; // 🔥 NUEVO PROP: El enlace opcional
}

export class NavButton extends Component<NavButtonProps> {
    constructor(props: NavButtonProps) {
        super({
            variant: 'outline',
            ...props
        });
    }

    render(): string {
        const { text, variant, href } = this.props;

        // 🔥 LA MAGIA SEMÁNTICA:
        // Si hay href, usamos <a> y le ponemos el data-router-link. Si no, usamos <button>.
        const tag = href ? 'a' : 'button';
        const hrefAttr = href ? `href="${href}" data-router-link` : '';
        const baseClass = `a-nav-button a-nav-button--${variant} theme-light`;

        return `
            <${tag} ${hrefAttr} class="${baseClass}">
                <span class="text-inner">${text}</span>
            </${tag}>
        `;
    }

    onMount(): void {
        const unsubscribe = ThemeStore.getInstance().subscribe((newTheme) => {
            if (!this.element) return;
            this.element.classList.remove('theme-light', 'theme-dark');
            this.element.classList.add(`theme-${newTheme}`);
        });

        this.registerCleanup(unsubscribe);
    }

    public setText(newText: string): void {
        this.props.text = newText;
        if (!this.element) return;

        const span = this.element.querySelector('.text-inner');
        if (span) span.textContent = newText;
    }
}