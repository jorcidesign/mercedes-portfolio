import { ENDPOINTS } from './endpoints';

export interface ContactPayload {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export class ContactService {
    public static async sendMessage(payload: ContactPayload): Promise<boolean> {
        try {
            const response = await fetch(ENDPOINTS.CONTACT, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    // Si en el futuro necesitas un token de API para crear registros, iría aquí:
                    // 'Authorization': `Bearer TU_TOKEN`
                },
                // 🔥 Strapi requiere que el cuerpo esté envuelto en un objeto "data"
                body: JSON.stringify({ data: payload })
            });

            if (!response.ok) {
                const errorData = await response.json();
                console.error('Strapi Error:', errorData);
                throw new Error('Error al enviar el mensaje');
            }

            return true; // Éxito
        } catch (error) {
            console.error('ContactService POST Error:', error);
            return false; // Fallo
        }
    }
}