import { heroData } from '../data/hero';

export class HeroService {
    static async getHeroImages(): Promise<string[]> {
        try {
            return heroData.images || [];
        } catch (error) {
            console.error('Error al obtener imágenes del Hero:', error);
            return [];
        }
    }
}