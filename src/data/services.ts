// src/data/services.ts

export interface ServiceData {
    id: string | number;
    title: string;
    slug: string;
    description: string;
    features: string[];
    price: string; // 🔥 NUEVO CAMPO
    imageUrl: string;
    imageAlt: string;
}

export const servicesData: ServiceData[] = [
    {
        id: 1,
        title: 'Maquillaje de Novia',
        slug: 'maquillaje-de-novia',
        description: 'Un diseño de maquillaje atemporal y a medida para tu gran día. Trabajamos juntas para resaltar tu belleza natural, asegurando una piel radiante, a prueba de emociones y con una duración impecable desde la ceremonia hasta el final de la fiesta.',
        features: [
            'Asesoría de imagen previa',
            'Prueba de maquillaje (Skin prep + Diseño)',
            'Preparación de piel premium',
            'Maquillaje el día de la boda',
            'Colocación de pestañas postizas'
        ],
        price: 'Desde $250 USD', // 🔥 Agregamos el precio
        imageUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1782253248/511f6c1b-b4eb-42ef-83b6-82f4117c2b58.png',
        imageAlt: 'Maquillaje de novia elegante y natural'
    },
    {
        id: 2,
        title: 'Maquillaje Social',
        slug: 'maquillaje-social',
        description: 'Perfecto para invitadas, alfombras rojas, galas o cualquier evento donde necesites deslumbrar. Un look sofisticado, duradero y adaptado a tu estilo personal, el outfit que llevarás y la iluminación del evento.',
        features: [
            'Preparación de piel',
            'Diseño de cejas y visagismo',
            'Maquillaje social HD',
            'Pestañas postizas (opcional)',
            'Fijación de larga duración'
        ],
        price: 'Desde $120 USD', // 🔥 Agregamos el precio
        imageUrl: 'https://images.unsplash.com/photo-1709477542149-f4e0e21d590b?q=80&w=687&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
        imageAlt: 'Maquillaje social y de fiesta'
    },
    {
        id: 3,
        title: 'Clases de Auto maquillaje',
        slug: 'clases-de-automaquillaje',
        description: 'Aprende a dominar tus propios rasgos y a sacarle el máximo partido a tu neceser. Sesiones personalizadas donde te enseñaré desde la correcta preparación de la piel hasta las técnicas profesionales para lograr looks de día y de noche.',
        features: [
            'Revisión de tu neceser actual',
            'Rutina de Skincare paso a paso',
            'Look de diario (Glow natural)',
            'Transformación a look de noche',
            'Dossier digital con recomendaciones'
        ],
        price: '$150 USD / Sesión', // 🔥 Agregamos el precio
        imageUrl: 'https://res.cloudinary.com/dhlkqt62w/image/upload/v1782258608/1b75da40-b414-4698-b36f-dc04768c31e6.png',
        imageAlt: 'Clases de automaquillaje y brochas'
    }
];
