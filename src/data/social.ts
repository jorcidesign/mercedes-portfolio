// src/data/social.ts

export interface SocialData {
    id: number;
    name: string;
    url: string;
    order: number;
}

export const socialData: SocialData[] = [
    {
        id: 1,
        name: "Instagram",
        url: "https://www.instagram.com/mercedesastorimamakeup/",
        order: 1
    },
    {
        id: 2,
        name: "Facebook",
        url: "https://www.facebook.com/www.bodas.com.pe",
        order: 2
    },
    {
        id: 3,
        name: "TikTok",
        url: "https://www.tiktok.com/@mercedesastorima",
        order: 3
    }
];