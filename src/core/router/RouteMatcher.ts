// src/core/router/RouteMatcher.ts
import type { Component } from '../Component';

export interface Route {
    path: string;
    component: new (props?: any) => Component;
}

export interface MatchResult {
    component: new (props?: any) => Component;
    params: Record<string, string>;
}

export class RouteMatcher {
    public static find(routes: Route[], currentPath: string): MatchResult | null {
        // Normalizamos quitando slash inicial y final para comparar fácil
        const path = currentPath.replace(/^\/|\/$/g, '');

        for (const route of routes) {
            const normalizedRoutePath = route.path.replace(/^\/|\/$/g, '');

            // A. Ruta estática exacta (Ej: "" === "" para Home)
            if (normalizedRoutePath === path) {
                return { component: route.component, params: {} };
            }

            // B. Ruta dinámica (Ej: "proyecto/:slug")
            if (route.path.includes(':')) {
                const match = this.matchDynamicRoute(normalizedRoutePath, path);
                if (match) {
                    return { component: route.component, params: match };
                }
            }
        }
        return null;
    }

    private static matchDynamicRoute(routePath: string, currentPath: string): Record<string, string> | null {
        const routeSegments = routePath.split('/');
        const pathSegments = currentPath.split('/');

        if (routeSegments.length !== pathSegments.length) return null;

        const params: Record<string, string> = {};

        for (let i = 0; i < routeSegments.length; i++) {
            const routeSeg = routeSegments[i];
            const pathSeg = pathSegments[i];

            if (routeSeg.startsWith(':')) {
                const paramName = routeSeg.slice(1);
                params[paramName] = pathSeg;
            } else if (routeSeg !== pathSeg) {
                return null;
            }
        }
        return params;
    }
}