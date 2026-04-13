import { ENDPOINTS, getImageUrl } from './endpoints';

export interface AboutData {
    description: string;
    imageUrl: string;
}

export class AboutService {
    public static async getAboutData(): Promise<AboutData | null> {
        try {
            const response = await fetch(ENDPOINTS.ABOUT);
            if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);

            const json = await response.json();
            const data = json.data;

            if (!data) return null;

            // Extraemos la URL de la imagen (Strapi v5)
            const imagePath = data.profileImage?.url || null;

            // 🔥 PARSEADOR DE STRAPI BLOCKS A HTML STRING 🔥
            let formattedDescription = '';

            // Si Strapi nos devuelve el array de "Blocks" (lo que te está pasando ahora)
            if (Array.isArray(data.description)) {
                formattedDescription = data.description.map((block: any) => {
                    // Verificamos si tiene la propiedad children
                    if (block.children && Array.isArray(block.children)) {
                        // Extraemos el texto de cada hijo y lo unimos
                        return block.children.map((child: any) => child.text || '').join('');
                    }
                    return '';
                }).join(''); // Unimos todos los párrafos extraídos
            }
            // Si en el futuro lo cambias a "Long Text" normal, entrará por aquí
            else if (typeof data.description === 'string') {
                formattedDescription = data.description;
            }

            return {
                description: formattedDescription || '<p>Cargando información...</p>',
                imageUrl: getImageUrl(imagePath) || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80'
            };
        } catch (error) {
            console.error('Error fetching About Data:', error);
            return null;
        }
    }
}