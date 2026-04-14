import { aboutData } from '../data/about';

export interface AboutSection {
    description: string;
    imageUrl: string;
}

export interface AboutData {
    sections: AboutSection[];
}

export class AboutService {
    public static async getAboutData(): Promise<AboutData | null> {
        try {
            return {
                sections: aboutData.sections.map(sec => ({
                    description: sec.description || '<p>Cargando información...</p>',
                    imageUrl: sec.image || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
                }))
            };
        } catch (error) {
            console.error('Error fetching About Data:', error);
            return null;
        }
    }
}