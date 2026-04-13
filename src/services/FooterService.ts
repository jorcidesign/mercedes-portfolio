import { ENDPOINTS } from './endpoints';

export interface FooterData {
    visionText: string;
    address: string;
    email: string;
    phone: string;
}

export class FooterService {
    public static async getFooterData(): Promise<FooterData | null> {
        try {
            const response = await fetch(ENDPOINTS.FOOTER);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();
            const data = json.data; // Extraemos la data

            // Si no hay data, salimos
            if (!data) return null;

            // 🔥 STRAPI v5: Ya no usamos 'attributes', leemos directo de 'data'
            const formattedAddress = data.address ? data.address.replace(/\n/g, '<br>') : '';

            return {
                visionText: data.visionText || '¿Tienes una visión? Nosotras ponemos el talento.',
                address: formattedAddress || 'Lima, Perú',
                email: data.email || 'hola@mercedesastorima.com',
                phone: data.phone || '+51 999 999 999'
            };
        } catch (error) {
            console.error('Error fetching Footer Data:', error);
            return null;
        }
    }
}