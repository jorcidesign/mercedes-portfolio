import { Component } from '../../../core/Component';
import { ThemeStore } from '../../../store/ThemeStore';
import { RouterStore } from '../../../store/RouterStore'; // 🔥 Importamos
import './style.css';

// 1. Extraemos el SVG gigante para no ensuciar la clase
const ISOTYPE_PATHS = `
    <clipPath id="logo-isotype-clip">
        <rect x="0" y="0" width="557.31" height="590.551"/>
    </clipPath>
    <g clip-path="url(#logo-isotype-clip)">
        <path fill="currentColor" d="M557.554,590.395c1.117,0.038 1.219,0.089 0,0.156l0,-0.156c-8.033,-0.271 -68.58,0.156 -68.58,0.156c0,0 -0.045,-50.748 -0.126,-119.555c-0.008,-7.263 -0.017,-14.728 -0.027,-22.352l-141.371,0l-57.391,141.818l-24.949,0c-24.395,-55.443 -123.36,-276.935 -147.2,-333.487c-7.762,-17.742 -15.385,-35.622 -22.87,-53.641c-7.485,-18.019 -14.692,-36.176 -21.623,-54.472c-6.93,-18.296 -13.999,-36.592 -21.207,-54.888c0,6.099 -0.139,12.197 -0.416,18.296c-0.277,6.099 -0.416,12.197 -0.416,18.296c-0.554,19.959 0.951,372.019 0.674,384.217c-0.276,12.127 -0.003,64.605 -0,75.578c1.519,0.039 1.71,0.099 0,0.189l-0,-0.189c-7.846,-0.2 -51.09,0.189 -51.09,0.189c0,0 -0.55,-575.04 -0.007,-590.384c-1.215,-0.038 -1.336,-0.093 0.007,-0.168c-0.002,0.045 -0.005,0.101 -0.007,0.168c7.812,0.248 60.86,-0.168 60.86,-0.168l209.573,539.383c6.099,-14.969 36.967,-91.546 45.283,-112.337c8.316,-20.791 15.247,-38.671 20.791,-53.641c24.395,-60.987 49.76,-122.112 76.095,-183.376c26.335,-61.264 52.255,-124.607 77.758,-190.029l66.238,0l0,590.395Zm-68.778,-178.367l-130.08,8.828l118.483,-292.784c1.663,-4.99 3.465,-9.702 5.406,-14.138c1.94,-4.435 3.742,-8.594 5.406,-12.475c0.309,4.937 0.579,155.85 0.757,288.738c0.01,7.34 0.019,14.626 0.029,21.83Z"/>
    </g>
`;

export class LogoIsotype extends Component {
    render(): string {
        return `
            <a href="/" class="a-logo-isotype theme-light" aria-label="Ir al inicio">
                <svg 
                    class="a-logo-isotype__svg"
                    viewBox="0 0 558 591" 
                    xmlns="http://www.w3.org/2000/svg"
                    style="fill-rule:evenodd;clip-rule:evenodd;stroke-linejoin:round;stroke-miterlimit:2;"
                >
                    ${ISOTYPE_PATHS}
                </svg>
            </a>
        `;
    }

    onMount(): void {
        // Suscripción al Tema
        const unsubTheme = ThemeStore.getInstance().subscribe((newTheme) => {
            if (!this.element) return;
            this.element.classList.remove('theme-light', 'theme-dark');
            this.element.classList.add(`theme-${newTheme}`);
        });
        this.registerCleanup(unsubTheme);

        // 🔥 Suscripción a la Ruta para bloquear el logo si estamos en Home
        const unsubRouter = RouterStore.getInstance().subscribe((currentPath) => {
            if (!this.element) return;

            if (currentPath === '/') {
                this.element.classList.add('is-active');
            } else {
                this.element.classList.remove('is-active');
            }
        });
        this.registerCleanup(unsubRouter);
    }
}