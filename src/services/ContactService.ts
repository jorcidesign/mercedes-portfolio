export interface ContactPayload {
    name: string;
    email: string;
    phone: string;
    message: string;
}

export class ContactService {
    private static readonly API_URL = 'https://api.web3forms.com/submit';

    // Vite inyecta la variable del .env aquí
    private static readonly ACCESS_KEY = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;

    public static async sendMessage(payload: ContactPayload): Promise<boolean> {
        try {
            const data = {
                access_key: this.ACCESS_KEY,
                nombre: payload.name,
                email: payload.email,
                telefono: payload.phone,
                mensaje: payload.message,
                subject: '¡Nuevo mensaje desde el Portafolio de Maquillaje!'
            };

            const response = await fetch(this.API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                },
                body: JSON.stringify(data)
            });

            const result = await response.json();

            if (response.status === 200) {
                console.log('Mensaje enviado con éxito a Web3Forms:', result);
                return true;
            } else {
                console.error('Error del servicio al enviar:', result);
                return false;
            }

        } catch (error) {
            console.error('Error de red o de ContactService:', error);
            return false;
        }
    }
}