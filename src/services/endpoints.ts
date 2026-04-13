// src/services/endpoints.ts

const STRAPI_DOMAIN = import.meta.env.VITE_API_URL || 'http://localhost:1337';
export const API_BASE_URL = `${STRAPI_DOMAIN}/api`;

export const ENDPOINTS = {
    WORKS: `${API_BASE_URL}/trabajos?populate=*&sort=orden:asc`,
    HERO: `${API_BASE_URL}/hero-canvas?populate=*`,
    SERVICES: `${API_BASE_URL}/servicios?populate=*`,
    SOCIAL_MEDIA: `${API_BASE_URL}/red-socials?sort=orden:asc`,
    FOOTER: `${API_BASE_URL}/footer?populate=*`,
    ABOUT: `${API_BASE_URL}/about?populate=*`,
    // FIX: nombre corregido de CONTACTS → CONTACT (era un typo que rompía el formulario)
    CONTACT: `${API_BASE_URL}/contacts`,
};

/**
 * Construye la URL absoluta de cualquier asset de Strapi.
 * - Si ya es absoluta (CDN externo, Cloudinary, etc.) la devuelve tal cual.
 * - Si es un path relativo (/uploads/...) le antepone STRAPI_DOMAIN.
 * - Si es null/undefined devuelve cadena vacía para evitar broken images.
 *
 * TODOS los servicios deben usar esta función. Nunca hardcodear localhost.
 */
export const getImageUrl = (path: string | null | undefined): string => {
    if (!path) return '';
    if (path.startsWith('http')) return path;
    return `${STRAPI_DOMAIN}${path}`;
};