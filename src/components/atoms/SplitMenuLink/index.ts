import { Component } from '../../../core/Component';
import { RouterStore } from '../../../store/RouterStore'; // 🔥 1. Importamos el mensajero
import './style.css';

interface SplitMenuLinkProps {
    text: string;
    href?: string;
}

export class SplitMenuLink extends Component<SplitMenuLinkProps> {
    constructor(props: SplitMenuLinkProps) {
        // Inicializamos con un href para que funcione como un link real
        super({ href: '#', ...props });
    }

    render(): string {
        const { text, href } = this.props;

        const lettersHtml = text.split('').map((char, index) => {
            const delay = index * 0.03;
            const content = char === ' ' ? '&nbsp;' : char;
            const dataChar = char === ' ' ? '' : char;

            // FIX: CERO espacios, CERO saltos de línea entre los spans. Todo pegado.
            return `<span class="a-split-link__char-wrap"><span class="a-split-link__entrance" style="transition-delay: ${delay}s"><span class="a-split-link__hover" style="--char-index: ${index};" data-char="${dataChar}">${content}</span></span></span>`;
        }).join('');

        return `
            <a href="${href}" class="a-split-link" aria-label="${text}">
                <span class="a-split-link__word" aria-hidden="true">${lettersHtml}</span>
            </a>
        `;
    }

    // 🔥 2. Le inyectamos la inteligencia en el onMount
    onMount(): void {
        if (this.props.href) {
            const unsubRouter = RouterStore.getInstance().subscribe((currentPath) => {
                if (!this.element) return;

                // Validamos si la ruta de la página coincide con la ruta de este enlace
                if (currentPath === this.props.href) {
                    this.element.classList.add('is-active');
                    this.element.style.pointerEvents = 'none'; // Bloqueo anti-clic
                } else {
                    this.element.classList.remove('is-active');
                    this.element.style.pointerEvents = 'auto'; // Restauramos si salimos de la página
                }
            });

            // Registramos la limpieza para evitar fugas de memoria
            this.registerCleanup(unsubRouter);
        }
    }
}