// src/services/WorkService.ts

import { ApiClient } from './api';
import { ENDPOINTS, getImageUrl } from './endpoints';
import type { WorkCredit, WorkData } from '../data/works';

// ─── Helpers privados ────────────────────────────────────────────────────────

function parseWorkItem(item: any): WorkData {
    const attrs = item.attributes || item;
    const imagePath = attrs?.imagen_principal?.data?.attributes?.url
        || attrs?.imagen_principal?.url;

    return {
        id: item.id || Math.random(),
        slug: attrs?.slug || 'sin-slug',
        title: attrs?.titulo || 'Proyecto sin título',
        description: attrs?.descripcion || 'Sin descripción',
        category: attrs?.categoria || 'WORK',
        date: attrs?.fecha || '',
        imageUrl: getImageUrl(imagePath),   // ← centralizado, nunca localhost
        layout: attrs?.layout_card || 'image-left',
        gallery: [],
        credits: [],
    };
}

// ─── WorkService ─────────────────────────────────────────────────────────────

export class WorkService {

    /** Trabajos marcados como destacado_home, máximo 4. */
    static async getRecentWorks(): Promise<WorkData[]> {
        const response = await ApiClient.get<any>(ENDPOINTS.WORKS);
        if (!response?.data) return [];

        return response.data
            .filter((item: any) => {
                const attrs = item.attributes || item;
                return attrs.destacado_home === true;
            })
            .slice(0, 4)
            .map(parseWorkItem);
    }

    /** Todos los trabajos (para la galería /work). */
    static async getAllWorks(): Promise<WorkData[]> {
        try {
            const response = await ApiClient.get<any>(ENDPOINTS.WORKS);
            if (!response?.data) return [];
            return response.data.map(parseWorkItem);
        } catch (error) {
            console.error('Error obteniendo todos los trabajos:', error);
            return [];
        }
    }

    /**
     * Trabajo completo por slug — galería, créditos y nextWork.
     *
     * FIX PERFORMANCE: antes hacía dos llamadas en serie (slug → allWorks).
     * Ahora las lanza en paralelo con Promise.all y resuelven al mismo tiempo.
     */
    static async getWorkBySlug(slug: string): Promise<WorkData | null> {
        try {
            // Ambas peticiones vuelan a la vez
            const [slugResponse, allResponse] = await Promise.all([
                ApiClient.get<any>(`${ENDPOINTS.WORKS}&filters[slug][$eq]=${slug}`),
                ApiClient.get<any>(ENDPOINTS.WORKS),
            ]);

            if (!slugResponse?.data?.length) return null;

            const item = slugResponse.data[0];
            const attrs = item.attributes || item;

            // ── Imagen principal ──
            const mainImgPath = attrs?.imagen_principal?.url
                || attrs?.imagen_principal?.attributes?.url
                || attrs?.imagen_principal?.data?.attributes?.url;

            // ── Galería ──
            const galleryUrls: string[] = (Array.isArray(attrs?.galeria)
                ? attrs.galeria
                : []
            ).map((img: any) => {
                const path = img?.url
                    || img?.attributes?.url
                    || img?.data?.attributes?.url;
                return getImageUrl(path);
            }).filter(Boolean);

            // ── Créditos ──
            const credits: WorkCredit[] = (attrs?.credito || []).map((cred: any) => ({
                id: cred.id,
                role: cred.rol,
                name: cred.nombre,
                url: cred.url || '#',
            }));

            // ── Next work (calculado desde la segunda petición paralela) ──
            let nextWorkData = null;

            if (allResponse?.data?.length) {
                const allWorks = allResponse.data.map((w: any) => {
                    const wAttrs = w.attributes || w;
                    const wImgPath = wAttrs?.imagen_principal?.data?.attributes?.url
                        || wAttrs?.imagen_principal?.url;
                    return {
                        slug: wAttrs?.slug || '',
                        title: wAttrs?.titulo || '',
                        imageUrl: getImageUrl(wImgPath),
                    };
                });

                const currentIndex = allWorks.findIndex((w: any) => w.slug === slug);

                if (currentIndex !== -1) {
                    const nextIndex = (currentIndex + 1) % allWorks.length;
                    const nextItem = allWorks[nextIndex];

                    if (nextItem?.slug && nextItem.slug !== slug) {
                        nextWorkData = {
                            slug: nextItem.slug,
                            title: nextItem.title,
                            imageUrl: nextItem.imageUrl,
                        };
                    }
                }
            }

            return {
                id: item.id,
                slug: attrs?.slug || 'sin-slug',
                title: attrs?.titulo || 'Sin título',
                description: attrs?.descripcion || '',
                category: attrs?.categoria || 'WORK',
                date: attrs?.fecha || '',
                imageUrl: getImageUrl(mainImgPath),
                layout: attrs?.layout_card || 'image-left',
                gallery: galleryUrls,
                credits,
                nextWork: nextWorkData,
            };

        } catch (error) {
            console.error('Error en getWorkBySlug:', error);
            return null;
        }
    }
}