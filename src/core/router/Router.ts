import { Component } from '../Component';
import { TransitionManager } from '../TransitionManager';
import { MainLayout } from '../../templates/MainLayout';
import { RouterStore } from '../../store/RouterStore';

// 🔥 NUEVO: Añadimos la bandera hasCustomLoader
export interface Route {
    path: string;
    component: new (props?: any) => Component;
    hasCustomLoader?: boolean;
}

export interface MatchResult {
    route: Route; // Ahora guardamos la ruta completa para leer sus banderas
    params: Record<string, string>;
}

export class Router {
    private routes: Route[] = [];
    private layout: MainLayout;
    private transition: TransitionManager;
    private isNavigating: boolean = false;
    private currentPageInstance: Component | null = null;
    private isFirstLoad: boolean = true;

    constructor(layout: MainLayout) {
        this.layout = layout;
        this.transition = new TransitionManager();

        if ('scrollRestoration' in history) {
            history.scrollRestoration = 'manual';
        }

        this.handleRoute = this.handleRoute.bind(this);
        window.addEventListener('popstate', this.handleRoute);
        this.interceptLinks();
    }

    // Actualizamos el registro de rutas
    public addRoute(path: string, component: new (props?: any) => Component, hasCustomLoader: boolean = false): void {
        this.routes.push({ path, component, hasCustomLoader });
    }

    private interceptLinks(): void {
        document.body.addEventListener('click', (e) => {
            const link = (e.target as Element).closest('a');
            if (link) {
                const href = link.getAttribute('href');
                if (href && href.startsWith('/')) {
                    e.preventDefault();
                    if (this.isNavigating) return;
                    window.history.pushState(null, '', href);
                    this.handleRoute();
                }
            }
        });
    }

    private matchRoute(currentPath: string): MatchResult | null {
        const path = currentPath === '/' ? '/' : currentPath.replace(/\/$/, '');

        for (const route of this.routes) {
            const routePath = route.path === '/' ? '/' : route.path.replace(/\/$/, '');

            // Coincidencia estática
            if (routePath === path) {
                return { route, params: {} };
            }

            // Coincidencia dinámica
            if (routePath.includes(':')) {
                const routeSegments = routePath.split('/');
                const pathSegments = path.split('/');

                if (routeSegments.length === pathSegments.length) {
                    const params: Record<string, string> = {};
                    let isMatch = true;

                    for (let i = 0; i < routeSegments.length; i++) {
                        const routeSeg = routeSegments[i];
                        const pathSeg = pathSegments[i];

                        if (routeSeg.startsWith(':')) {
                            params[routeSeg.slice(1)] = pathSeg;
                        } else if (routeSeg !== pathSeg) {
                            isMatch = false;
                            break;
                        }
                    }

                    if (isMatch) return { route, params };
                }
            }
        }
        return null;
    }

    public async handleRoute(): Promise<void> {
        if (this.isNavigating) return;
        this.isNavigating = true;

        const path = window.location.pathname;

        // 🔥 ESTA ES LA LÍNEA MÁGICA: Le avisamos al Store de la nueva ruta
        RouterStore.getInstance().setPath(path);
        const match = this.matchRoute(path);

        if (match) {
            // Evaluamos si esta ruta usa la línea blanca (TransitionManager)
            const useGenericLoader = !match.route.hasCustomLoader;

            // 1. TELÓN BLANCO ARRIBA (SÓLO si NO es la primera carga)
            if (useGenericLoader && !this.isFirstLoad) {
                await this.transition.startLoading();
            }

            // 2. INSTANCIAMOS EL COMPONENTE
            this.currentPageInstance = new match.route.component(match.params);

            // 3. ⏱️ MAGIA REAL: EL ROUTER ESPERA (¡Siempre espera, sea primera carga o no!)
            if (typeof (this.currentPageInstance as any).preload === 'function') {
                console.log(`[Router] Descargando recursos pesados para ${path}...`);
                await (this.currentPageInstance as any).preload();
            }

            // 4. INYECTAMOS EN EL DOM
            this.layout.setPage(this.currentPageInstance);
            window.scrollTo(0, 0);

            // 5. TELÓN BLANCO ABAJO (SÓLO si NO es la primera carga)
            if (useGenericLoader && !this.isFirstLoad) {
                await this.transition.finishLoading();
            }

            // Marcamos que la primera carga ya pasó
            this.isFirstLoad = false;
        } else {
            console.warn(`Ruta 404: ${path}`);
        }

        this.isNavigating = false;
    }
}