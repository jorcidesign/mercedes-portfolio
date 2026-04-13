// src/services/ServiceService.ts

import { ApiClient } from './api';
import { ENDPOINTS, getImageUrl } from './endpoints';
import type { ServiceData } from '../data/services';

export class ServiceService {

    static async getAllServices(): Promise<ServiceData[]> {
        try {
            const response = await ApiClient.get<any>(ENDPOINTS.SERVICES);
            if (!response?.data) return [];

            return response.data.map((item: any): ServiceData => {
                const attrs = item.attributes || item;
                const imgPath = attrs?.imagen?.data?.attributes?.url
                    || attrs?.imagen?.url;

                return {
                    id: item.id || Math.random(),
                    slug: attrs?.slug || 'sin-slug',
                    title: attrs?.titulo || 'Servicio sin título',
                    description: attrs?.descripcion || 'Sin descripción',
                    features: attrs?.features || [],
                    price: attrs?.precio || 'Precio no definido',
                    imageUrl: getImageUrl(imgPath) || 'https://via.placeholder.com/600',
                    imageAlt: attrs?.titulo || 'Imagen del servicio',
                };
            });

        } catch (error) {
            console.error('Error obteniendo todos los servicios:', error);
            return [];
        }
    }
}