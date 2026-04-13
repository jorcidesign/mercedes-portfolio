import './styles/main.css';
import { Router } from './core/router/Router';
import { HomePage } from './pages/Home';
import { WorkDetailPage } from './pages/WorkDetail';
import { WorkPage } from './pages/Work';
import { AboutPage } from './pages/AboutPage';
import { ServicesPage } from './pages/ServicesPage';
import { ContactPage } from './pages/ContactPage';
import { MainLayout } from './templates/MainLayout';
import { CustomCursor } from './components/atoms/CustomCursor'; // 🔥 Importamos el puntero

document.addEventListener('DOMContentLoaded', () => {
    const appRoot = document.getElementById('app-root');

    if (appRoot) {
        const mainLayout = new MainLayout();
        mainLayout.mount(appRoot);

        // 🔥 MONTAJE GLOBAL DEL PUNTERO PERSONALIZADO 🔥
        // Lo creamos y lo inyectamos directamente en el body o appRoot,
        // al final de todo para asegurar el máximo z-index
        const punteroAstostudios = new CustomCursor();
        punteroAstostudios.mount(appRoot); // Vivirá encima de layouts y drawers

        const router = new Router(mainLayout);

        // 🔥 LA MAGIA ESTÁ AQUÍ 🔥
        // Le pasamos `true` como tercer parámetro para indicar que HOME usa su propio LogoCurtain.
        router.addRoute('/', HomePage, true);
        router.addRoute('/home', HomePage, true);

        // Las demás rutas NO llevan el parámetro, por lo que usarán la Línea Expansiva Genérica
        router.addRoute('/work', WorkPage);
        router.addRoute('/work/:slug', WorkDetailPage);
        router.addRoute('/about', AboutPage);
        router.addRoute('/services', ServicesPage);
        router.addRoute('/contact', ContactPage);

        router.handleRoute().then(() => {
            const bootLoader = document.getElementById('boot-loader');
            if (bootLoader) {
                bootLoader.style.opacity = '0';
                setTimeout(() => bootLoader.remove(), 600); // Lo borramos del DOM tras el fade out
            }
        });
        console.log("🚀 Motor Headless SPA Inicializado.");
    } else {
        console.error("No se encontró el #app-root en el DOM.");
    }
});