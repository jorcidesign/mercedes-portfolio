import { footerData } from '../data/footer';

export interface FooterData {
    visionText: string;
    address: string;
    email: string;
    phone: string;
}

export class FooterService {
    public static async getFooterData(): Promise<FooterData | null> {
        try {
            return {
                visionText: footerData.visionText || '¿Tienes una visión? Nosotras ponemos el talento.',
                address: footerData.address ? footerData.address.replace(/\n/g, '<br>') : 'Lima, Perú',
                email: footerData.email || 'hola@mercedesastorima.com',
                phone: footerData.phone || '+51 999 999 999'
            };
        } catch (error) {
            console.error('Error fetching Footer Data:', error);
            return null;
        }
    }
}