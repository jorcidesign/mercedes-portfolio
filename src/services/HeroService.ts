// src/services/HeroService.ts

import { ApiClient } from './api';
import { ENDPOINTS, getImageUrl } from './endpoints';

export class HeroService {
    static async getHeroImages(): Promise<string[]> {
        try {
            const response = await ApiClient.get<any>(ENDPOINTS.HERO);

            if (!response?.data?.length) return [];

            const primerRegistro = response.data[0];
            const attrs = primerRegistro.attributes || primerRegistro;
            const mediaArray = attrs?.imagenes?.data || attrs?.imagenes || [];

            return mediaArray
                .map((media: any) => {
                    const path = media.attributes?.url || media.url;
                    return getImageUrl(path);   // ← centralizado, nunca localhost
                })
                .filter(Boolean);

        } catch (error) {
            console.error('Error al obtener imágenes del Hero:', error);
            return [];
        }
    }
}