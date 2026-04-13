// src/services/SocialService.ts

import { ApiClient } from './api';
import { ENDPOINTS } from './endpoints';
import type { SocialData } from '../data/social';

export class SocialService {
    static async getSocialNetworks(): Promise<SocialData[]> {
        try {
            const response = await ApiClient.get<any>(ENDPOINTS.SOCIAL_MEDIA);
            if (!response?.data) return [];

            return response.data.map((item: any): SocialData => {
                const attrs = item.attributes || item;
                return {
                    id: item.id || Math.random(),
                    name: attrs?.nombre || 'Red Social',
                    url: attrs?.url || '#',
                    order: attrs?.orden || 99,
                };
            });

        } catch (error) {
            console.error('Error obteniendo las redes sociales:', error);
            return [];
        }
    }
}