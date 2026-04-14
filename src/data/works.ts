// src/data/works.ts

export interface WorkCredit {
    id: number;
    role: string;
    name: string;
    url: string;
}

export interface WorkData {
    id: number;
    slug: string;
    title: string;
    description: string;
    category: string;
    date: string;
    imageUrl: string;
    layout: 'image-left' | 'image-right';
    gallery: string[];
    credits: WorkCredit[];
    nextWork?: {
        slug: string;
        title: string;
        imageUrl: string;
    } | null;
}

export const worksData: WorkData[] = [
    {
        id: 1,
        slug: "glamour-sofisticado-viemuriel",
        title: "Glamour Sofisticado Viemuriel",
        description: "Un look deslumbrante diseñado para resaltar las facciones con un toque de sofisticación pura y acabados impecables.",
        category: "Social",
        date: "2023-10-12",
        imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776121677/19aa5e2f-a988-4921-a713-65ac4cb65175.png",
        layout: "image-left",
        gallery: [
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776121565/237be1ce-1212-4d14-9e12-9c96e77424db.png",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776121561/a7d7ea02-a81a-4a0d-afe9-42734281cf0f.png",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776121521/7483fa6f-6d57-4243-9149-c31f1ade857d.png",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776121445/1a4a2d4b-05ef-4dc9-b8ad-602a96041a5c.png",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776088348/6d74e80c-51e6-4fda-9b96-a7b458cf0497.png"
        ],
        credits: [
            { id: 1, role: "Makeup", name: "Mercedes Astorima", url: "https://www.instagram.com/mercedesastorimamakeup" },
            { id: 2, role: "Modelo", name: "@viemuriel", url: "https://www.instagram.com/viemuriel" },
            { id: 3, role: "Asistente Peinado", name: "@natalia_vega_beauty", url: "https://www.instagram.com/natalia_vega_beauty" },
            { id: 4, role: "Fotografía", name: "@yumefarfanfotografo", url: "https://www.instagram.com/yumefarfanfotografo" }
        ],
        nextWork: {
            slug: "resplandor-natural-daniela",
            title: "Resplandor Natural Daniela",
            imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117790/IMG_8129_mdho8a.jpg"
        }
    },
    {
        id: 2,
        slug: "resplandor-natural-daniela",
        title: "Resplandor Natural Daniela",
        description: "Maquillaje de acabado luminoso y piel de porcelana, ideal para destacar la belleza auténtica en eventos de día.",
        category: "Social",
        date: "2023-11-20",
        imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117790/IMG_8129_mdho8a.jpg",
        layout: "image-right",
        gallery: [
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117790/IMG_8133_er9aex.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776088600/2e253bfe-0c9c-4c49-b7d5-1c76b8031f3a.png"
        ],
        credits: [
            { id: 1, role: "Makeup", name: "Mercedes Astorima", url: "https://www.instagram.com/mercedesastorimamakeup" },
            { id: 2, role: "Modelo", name: "@danieladelascasas_", url: "https://www.instagram.com/danieladelascasas_" },
            { id: 3, role: "Tocados", name: "@labibe_headpieces", url: "https://www.instagram.com/labibe_headpieces" },
            { id: 4, role: "Fotografía", name: "@yumefarfan_photo", url: "https://www.instagram.com/yumefarfan_photo" },
            { id: 5, role: "Pose", name: "@fridisimaa", url: "https://www.instagram.com/fridisimaa" }
        ],
        nextWork: {
            slug: "elegancia-atemporal-cehila",
            title: "Elegancia Atemporal Cehila",
            imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113415/Cehila-Mercedes-1308_tq4whj.jpg"
        }
    },
    {
        id: 3,
        slug: "elegancia-atemporal-cehila",
        title: "Elegancia Atemporal Cehila",
        description: "Un estilo clásico y refinado, donde la mirada toma el protagonismo absoluto complementado con una piel aterciopelada.",
        category: "Social",
        date: "2023-12-05",
        imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113415/Cehila-Mercedes-1308_tq4whj.jpg",
        layout: "image-left",
        gallery: [
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113412/Cehila-Mercedes-1200_uariu9.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113412/Cehila-Mercedes-1297_iawhtx.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113411/Cehila-Mercedes-1030_wdzvsl.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113410/Cehila-Mercedes-1008_ufj18n.jpg"
        ],
        credits: [
            { id: 1, role: "Makeup", name: "Mercedes Astorima", url: "https://www.instagram.com/mercedesastorimamakeup" }
        ],
        nextWork: {
            slug: "vanguardia-y-color-frida",
            title: "Vanguardia y Color: Frida",
            imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776089596/IMG_3304_1_ac3dlh.jpg"
        }
    },
    {
        id: 4,
        slug: "vanguardia-y-color-frida",
        title: "Vanguardia y Color: Frida Editorial",
        description: "Exploración artística de texturas, contrastes y pigmentos vibrantes para una sesión editorial de alta moda.",
        category: "Editorial",
        date: "2024-01-15",
        imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776089596/IMG_3304_1_ac3dlh.jpg",
        layout: "image-right",
        gallery: [
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776089595/IMG_3299_kx7xem.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776089595/IMG_3283_rkr6tc.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776089595/IMG_3310_jvg2hl.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776089594/IMG_3286_qgqpi7.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776089012/IMG_3315_ypkvsk.jpg"
        ],
        credits: [
            { id: 1, role: "Makeup & Hair", name: "Mercedes Astorima", url: "https://www.instagram.com/mercedesastorimamakeup" },
            { id: 2, role: "Modelo", name: "@fridisimaa", url: "https://www.instagram.com/fridisimaa" },
            { id: 3, role: "Fotografía", name: "@yumefarfan_photo", url: "https://www.instagram.com/yumefarfan_photo" }
        ],
        nextWork: {
            slug: "ensueno-nupcial-katia",
            title: "Ensueño Nupcial Katia",
            imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119415/Katia1_fmxlox.jpg"
        }
    },
    {
        id: 5,
        slug: "ensueno-nupcial-katia",
        title: "Ensueño Nupcial Katia",
        description: "El maquillaje nupcial perfecto: romántico, de larga duración y diseñado meticulosamente para brillar en el gran día.",
        category: "Novias",
        date: "2024-02-10",
        imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119415/Katia1_fmxlox.jpg",
        layout: "image-left",
        gallery: [
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119416/Novia-_Mercedes-_Katia--2496_ubgmer.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119418/Novia-_Mercedes-_Katia--2504_tpdoh2.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119420/Novia-_Mercedes-_Katia--2453_zdnjsx.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119421/Novia-_Mercedes-_Katia--2776_ob4bl8.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119443/Novia-_Mercedes-_Katia--2451_1_rag87f.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119444/Novia-_Mercedes-_Katia--2507_thmxhy.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776119446/Novia-_Mercedes-_Katia--2517_swgsgd.jpg"
        ],
        credits: [
            { id: 1, role: "Makeup & Hair", name: "Mercedes Astorima", url: "https://www.instagram.com/mercedesastorimamakeup" },
            { id: 2, role: "Modelo", name: "@kati.carty", url: "https://www.instagram.com/kati.carty" },
            { id: 3, role: "Fotografía", name: "@danyochoa_", url: "https://www.instagram.com/danyochoa_" },
            { id: 4, role: "Diseñadora", name: "@maracamposatelier", url: "https://www.instagram.com/maracamposatelier" }
        ],
        nextWork: {
            slug: "espiritu-libre-martha",
            title: "Espíritu Libre: Martha Boho",
            imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113396/_DSC1146_z8jnqc.jpg"
        }
    },
    {
        id: 6,
        slug: "espiritu-libre-martha",
        title: "Espíritu Libre: Martha Boho Style",
        description: "Ondas relajadas y un maquillaje en tonos cálidos que capturan a la perfección la esencia del estilo bohemio chic.",
        category: "Editorial",
        date: "2024-03-05",
        imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113396/_DSC1146_z8jnqc.jpg",
        layout: "image-right",
        gallery: [
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113393/_DSC1003_dzsqhb.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113394/_DSC1177_lqnwtm.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113394/_DSC1270_htfhqf.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113394/_DSC1481_lv6tf1.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113393/_DSC1348_i2qlhf.jpg"
        ],
        credits: [
            { id: 1, role: "Makeup & Hair", name: "Mercedes Astorima", url: "https://www.instagram.com/mercedesastorimamakeup" },
            { id: 2, role: "Modelo", name: "@marhasenauer_ok", url: "https://www.instagram.com/marhasenauer_ok" },
            { id: 3, role: "Fotografía", name: "@budabluesfoto", url: "https://www.instagram.com/budabluesfoto" },
            { id: 4, role: "Tocados", name: "@labibe_headpieces", url: "https://www.instagram.com/labibe_headpieces" },
            { id: 5, role: "Vestido", name: "@karinagiannonifd", url: "https://www.instagram.com/karinagiannonifd" }
        ],
        nextWork: {
            slug: "esencia-mercedes-astorima",
            title: "La Esencia de Mercedes",
            imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113519/IMG_9712.jpg_6_960_4_640_pixeles_j9jn0x.jpg"
        }
    },
    {
        id: 7,
        slug: "esencia-mercedes-astorima",
        title: "Autorretrato: La Esencia de Mercedes",
        description: "La identidad visual de la artista. Un reflejo personal de maestría, dedicación y pasión absoluta por el arte del maquillaje.",
        category: "Branding",
        date: "2024-03-20",
        imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113519/IMG_9712.jpg_6_960_4_640_pixeles_j9jn0x.jpg",
        layout: "image-left",
        gallery: [
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113518/IMG_9693.jpg_6_960_4_640_pixeles_cxhu8l.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113517/IMG_9703.jpg_6_960_4_640_pixeles_ool4l4.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113509/IMG_9734.jpg_6_960_4_640_pixeles_1_r5zevc.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113508/IMG_9714.jpg_6_769_4_513_pixeles_kcxa5f.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776113507/IMG_9687.jpg_6_646_4_431_pixeles_uaukfp.jpg"
        ],
        credits: [
            { id: 1, role: "Makeup", name: "Mercedes Astorima", url: "https://www.instagram.com/mercedesastorimamakeup" },
            { id: 2, role: "Outfit", name: "@oda_peru", url: "https://www.instagram.com/oda_peru" },
            { id: 3, role: "Styling", name: "@kate_kastaneda", url: "https://www.instagram.com/kate_kastaneda" },
            { id: 4, role: "MUA Maestro", name: "@martincatalogne", url: "https://www.instagram.com/martincatalogne" },
            { id: 5, role: "Fotografía", name: "@yumefarfan_photo", url: "https://www.instagram.com/yumefarfan_photo" }
        ],
        nextWork: {
            slug: "luz-perfeccion-naysha",
            title: "Luz y Perfección: Naysha",
            imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117685/IMG_9206_wdc1sj.jpg"
        }
    },
    {
        id: 8,
        slug: "luz-perfeccion-naysha",
        title: "Luz y Perfección: Naysha",
        description: "Tonos cálidos y un perfilado impecable para lograr una apariencia magnética, resaltando la estructura natural del rostro.",
        category: "Social",
        date: "2024-04-02",
        imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117685/IMG_9206_wdc1sj.jpg",
        layout: "image-right",
        gallery: [
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117684/IMG_9177_fmw320.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117684/IMG_9205_szatjp.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117683/IMG_9203_pr0jf5.jpg",
            "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776117682/IMG_9191_uldqnc.jpg"
        ],
        credits: [
            { id: 1, role: "Makeup", name: "Mercedes Astorima", url: "https://www.instagram.com/mercedesastorimamakeup" },
            { id: 2, role: "Modelo", name: "@naysha.paz", url: "https://www.instagram.com/naysha.paz" },
            { id: 3, role: "Fotografía", name: "@yumefarfan_photo", url: "https://www.instagram.com/yumefarfan_photo" }
        ],
        nextWork: {
            slug: "glamour-sofisticado-viemuriel",
            title: "Glamour Sofisticado Viemuriel",
            imageUrl: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776121677/19aa5e2f-a988-4921-a713-65ac4cb65175.png"
        }
    }
];