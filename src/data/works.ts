export interface WorkCredit {
    id: number;
    role: string;      // Viene de 'rol'
    name: string;      // Viene de 'nombre'
    url: string;       // Viene de 'url'
}

export interface WorkData {
    id: number;
    slug: string;
    title: string;          // Viene de 'titulo'
    description: string;    // Viene de 'descripcion'
    category: string;       // Viene de 'categoria'
    date: string;           // Viene de 'fecha'
    imageUrl: string;       // Viene de 'imagen_principal'
    layout: 'image-left' | 'image-right'; // Viene de 'layout_card'

    // Arrays para la página interna
    gallery: string[];      // Viene de 'galeria'
    credits: WorkCredit[];  // Viene de 'credito' (Componente repetible)

    // 🔥 EL FIX DE TYPESCRIPT: Le avisamos que vendrá un nextWork
    nextWork?: {
        slug: string;
        title: string;
        imageUrl: string;
    } | null;
}
