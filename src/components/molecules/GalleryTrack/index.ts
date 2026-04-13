/**
 * GalleryTrack
 *
 * Responsabilidad: renderizar y montar los vagones del tren horizontal.
 * Acepta cualquier array de "slots" tipados, por lo que agregar nuevos
 * tipos de vagones no rompe nada — solo defines un nuevo GallerySlot.
 */

import { Component } from '../../../core/Component';
import { ImageReveal } from '../../atoms/ImageReveal';
import { WorkCredits } from '../../molecules/WorkCredits';
import { NextWork } from '../../molecules/NextWork';
import type { WorkData } from '../../../data/works';

// ── Tipos de vagón ──
export type GallerySlotImage = {
    type: 'image';
    src: string;
    alt: string;
    size: 'main' | 'regular' | 'small';
};

export type GallerySlotCredits = {
    type: 'credits';
    credits: NonNullable<WorkData['credits']>;
    nextWork?: WorkData['nextWork'];
};

export type GallerySlotNextWork = {
    type: 'next-work';
    nextWork: WorkData['nextWork'];
};

export type GallerySlot = GallerySlotImage | GallerySlotCredits | GallerySlotNextWork;

interface GalleryTrackProps {
    slots: GallerySlot[];
    anilloWidth?: number;
}

export class GalleryTrack extends Component<GalleryTrackProps> {
    private imageComponents: Map<number, ImageReveal> = new Map();
    private creditsComponent: WorkCredits | null = null;

    constructor(props: GalleryTrackProps) {
        super(props);

        props.slots.forEach((slot, i) => {
            if (slot.type === 'image') {
                this.imageComponents.set(i, new ImageReveal({
                    src: slot.src,
                    alt: slot.alt,
                    hoverZoom: false,
                    parallax: 'none',
                    eager: true, // 🔥 Todas las imágenes del track ya fueron precargadas — pintamos al instante
                }));
            }
        });
    }

    render(): string {
        const anilloWidth = this.props.anilloWidth ?? 100;

        const slotsHtml = this.props.slots.map((slot, i) => {
            const sizeClass = slot.type === 'image'
                ? `o-gallery-track__item--${slot.size}`
                : '';

            return `<div class="o-gallery-track__item ${sizeClass}" id="gallery-slot-${i}"></div>`;
        }).join('');

        return `
            <div class="o-gallery-track" id="work-gallery-track">
                <div class="o-gallery-track__files" style="margin-left: calc(100vw - ${anilloWidth}px)">
                    ${slotsHtml}
                </div>
            </div>
        `;
    }

    async onMount(): Promise<void> {
        this.props.slots.forEach((slot, i) => {
            if (slot.type === 'image') {
                const comp = this.imageComponents.get(i);
                if (comp) this.mountChild(`#gallery-slot-${i}`, comp);
            }

            if (slot.type === 'credits') {
                this.creditsComponent = new WorkCredits({
                    credits: slot.credits,
                    nextWork: slot.nextWork,
                });
                this.mountChild(`#gallery-slot-${i}`, this.creditsComponent);
            }

            if (slot.type === 'next-work') {
                const nextWorkComponent = new NextWork({ nextWork: slot.nextWork });
                this.mountChild(`#gallery-slot-${i}`, nextWorkComponent);
            }
        });
    }

    static slotsFromWork(work: WorkData): GallerySlot[] {
        const slots: GallerySlot[] = [];

        slots.push({ type: 'image', src: work.imageUrl, alt: work.title, size: 'main' });

        if (work.gallery) {
            work.gallery.forEach((src, i) => {
                slots.push({
                    type: 'image',
                    src,
                    alt: `${work.title} — ${i + 1}`,
                    size: i % 2 === 0 ? 'small' : 'regular',
                });
            });
        }

        if (work.credits?.length || work.nextWork) {
            slots.push({
                type: 'credits',
                credits: work.credits ?? [],
                nextWork: work.nextWork,
            });
        }

        if (work.nextWork) {
            slots.push({ type: 'next-work', nextWork: work.nextWork });
        }

        return slots;
    }
}