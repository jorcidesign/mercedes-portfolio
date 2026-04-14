import { worksData, type WorkData } from '../data/works';

export class WorkService {

    /** Trabajos marcados (mock = primeros 4) */
    static async getRecentWorks(): Promise<WorkData[]> {
        try {
            return worksData.slice(0, 4);
        } catch (error) {
            console.error('Error obteniendo recientes:', error);
            return [];
        }
    }

    /** Todos los trabajos (para la galería /work). */
    static async getAllWorks(): Promise<WorkData[]> {
        try {
            return worksData;
        } catch (error) {
            console.error('Error obteniendo todos los trabajos:', error);
            return [];
        }
    }

    /**
     * Trabajo completo por slug — galería, créditos y nextWork.
     */
    static async getWorkBySlug(slug: string): Promise<WorkData | null> {
        try {
            const currentIndex = worksData.findIndex((w) => w.slug === slug);
            if (currentIndex === -1) return null;

            const work = { ...worksData[currentIndex] };

            // Calcular nextWork si no está definido en el mock
            if (work.nextWork === undefined || work.nextWork === null) {
                const nextIndex = (currentIndex + 1) % worksData.length;
                const nextItem = worksData[nextIndex];

                if (nextItem && nextItem.slug !== slug) {
                    work.nextWork = {
                        slug: nextItem.slug,
                        title: nextItem.title,
                        imageUrl: nextItem.imageUrl,
                    };
                } else {
                    work.nextWork = null;
                }
            }

            return work;
        } catch (error) {
            console.error('Error en getWorkBySlug:', error);
            return null;
        }
    }
}