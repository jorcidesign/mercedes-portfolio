import { servicesData, type ServiceData } from '../data/services';

export class ServiceService {
    static async getAllServices(): Promise<ServiceData[]> {
        try {
            return servicesData;
        } catch (error) {
            console.error('Error obteniendo todos los servicios:', error);
            return [];
        }
    }
}