// services/api.ts

export class ApiClient {
    static async get<T>(url: string): Promise<T> {
        try {
            const response = await fetch(url);

            if (!response.ok) {
                throw new Error(`Error HTTP: ${response.status} - ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            console.error(`[ApiClient] Error haciendo GET a ${url}:`, error);
            throw error; // Lanzamos el error para manejarlo en el componente
        }
    }
}