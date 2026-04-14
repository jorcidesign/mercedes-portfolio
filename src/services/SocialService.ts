import { socialData, type SocialData } from '../data/social';

export class SocialService {
    static async getSocialNetworks(): Promise<SocialData[]> {
        try {
            return socialData;
        } catch (error) {
            console.error('Error obteniendo las redes sociales:', error);
            return [];
        }
    }
}