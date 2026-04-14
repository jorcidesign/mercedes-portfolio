// src/data/about.ts

export interface AboutSection {
    description: string;
    image: string;
}

export interface AboutData {
    sections: AboutSection[];
}

export const aboutData: AboutData = {
    sections: [
        {
            description: `<p>¡Hola! Soy Mercedes Astorima. Con más de 15 años de trayectoria sumergida en el fascinante mundo de la belleza, mi viaje comenzó tras bambalinas en los imponentes escenarios del Teatro Municipal y el Gran Teatro Nacional de Lima. Allí aprendí que el maquillaje no se trata de <s>ocultar imperfecciones</s>, sino de <strong>revelar tu esencia</strong>. Esa magia escénica la trasladé al mundo real, fusionando el arte del estilismo con una visión donde la elegancia, la luz y el lujo son los verdaderos protagonistas de cada rostro.</p>`,
            image: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776123043/WhatsApp_Image_2026-02-05_at_12.43.20_AM_ygz696.jpg"
        },
        {
            description: `<p>Mi mayor inspiración es crear experiencias transformadoras, con una devoción especial por las <u>novias</u> que buscan un estilo atemporal en su gran día. Me especializo en el cuidado meticuloso de la piel y en técnicas que realzan la belleza natural en todas sus etapas —destacando especialmente en pieles maduras—, para lograr acabados radiantes, sofisticados y de impecable duración. Además de los pinceles, mi otra pasión es enseñar; por eso comparto mis secretos de <em>skincare</em>, estilismo y automaquillaje con una vibrante comunidad de más de 126K suscriptores en YouTube y TikTok.</p>`,
            image: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776132765/c646fdd2-4b64-4e97-8cfb-b794f7828db6.png"
        },
        {
            description: `<p>Para mí, la belleza es un servicio integral. Ya sea impartiendo una exclusiva <strong>Masterclass</strong> para que descubras tu propio potencial, o trabajando junto a mi talentoso <em>staff</em> de profesionales para brindarte una atención de primer nivel en tus eventos sociales, mi propósito es uno solo: que te mires al espejo y te encuentres con tu versión más poderosa, auténtica y deslumbrante.</p>`,
            image: "https://res.cloudinary.com/dhlkqt62w/image/upload/v1776132969/4affa602-e2fc-4090-b30d-a7e3c2fea01e.png"
        }
    ]
};
