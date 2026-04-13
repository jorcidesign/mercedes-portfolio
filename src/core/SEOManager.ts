// src/core/SEOManager.ts

export interface SEOMetadata {
    title?: string;
    description?: string;
    imageUrl?: string;
    url?: string;
}

export class SEOManager {
    // Valores de Fallback (Mercedes Astorima)
    private static readonly DEFAULT_TITLE = "Mercedes Astorima | Portfolio";
    private static readonly DEFAULT_DESC = "Portfolio oficial de Mercedes Astorima. Dirección de Arte, Diseño y Creatividad.";

    // 🔥 Dinamizamos las URLs usando la variable de entorno de Vite
    private static readonly BASE_URL = import.meta.env.VITE_BASE_URL || "http://localhost:5173";
    private static readonly DEFAULT_IMAGE = `${this.BASE_URL}/og-image-default.jpg`;

    public static update(meta: SEOMetadata = {}): void {
        const title = meta.title ? `${meta.title} | Mercedes Astorima` : this.DEFAULT_TITLE;
        const description = meta.description || this.DEFAULT_DESC;
        const imageUrl = meta.imageUrl || this.DEFAULT_IMAGE;
        const url = meta.url || this.BASE_URL;

        // 1. Sobrescribir <title>
        document.title = title;

        // 2. Sobrescribir/Crear <meta> Tags Genéricos
        this.setMetaTag('name', 'description', description);

        // 3. Open Graph (Facebook, LinkedIn, WhatsApp)
        this.setMetaTag('property', 'og:title', title);
        this.setMetaTag('property', 'og:description', description);
        this.setMetaTag('property', 'og:image', imageUrl);
        this.setMetaTag('property', 'og:url', url);
        this.setMetaTag('property', 'og:type', 'website');

        // 4. Twitter Cards
        this.setMetaTag('name', 'twitter:card', 'summary_large_image');
        this.setMetaTag('name', 'twitter:title', title);
        this.setMetaTag('name', 'twitter:description', description);
        this.setMetaTag('name', 'twitter:image', imageUrl);
    }

    private static setMetaTag(attrName: 'name' | 'property', attrValue: string, content: string): void {
        let element = document.querySelector(`meta[${attrName}="${attrValue}"]`);

        if (!element) {
            element = document.createElement('meta');
            element.setAttribute(attrName, attrValue);
            document.head.appendChild(element);
        }

        element.setAttribute('content', content);
    }
}