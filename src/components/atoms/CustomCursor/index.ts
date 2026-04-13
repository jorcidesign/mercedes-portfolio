// src/components/atoms/CustomCursor/index.ts

import { Component } from '../../../core/Component';
import './style.css';

type CursorState = 'default' | 'link' | 'image' | 'button';

export class CustomCursor extends Component {

    private mouse = { x: 0, y: 0 };

    // El punto sigue al mouse casi directo — LERP alto
    private dotPos = { x: 0, y: 0 };

    // El anillo va con más cola — LERP bajo
    private ringPos = { x: 0, y: 0 };

    // ──────────────────────────────────────────────────────────────────────────
    // LERP FACTORS
    // 1.0 = instantáneo  /  0.0 = nunca llega
    // Dot:  0.35 → rápido, casi pegado al cursor real
    // Ring: 0.10 → cola larga y suave, efecto Photoshop/After Effects
    // ──────────────────────────────────────────────────────────────────────────
    private readonly DOT_LERP = 0.35;
    private readonly RING_LERP = 0.10;

    private ringEl: HTMLElement | null = null;
    private dotEl: HTMLElement | null = null;

    private state: CursorState = 'default';

    private rafId: number = 0;
    private isDead: boolean = false;
    private hasMovedFirstTime: boolean = false;
    private isMoving: boolean = true; // 🔥 ESTADO DE SUEÑO

    constructor() {
        super();
        this.update = this.update.bind(this);
        this.handleMouseMove = this.handleMouseMove.bind(this);
        this.handleMouseOver = this.handleMouseOver.bind(this);
        this.handleMouseOut = this.handleMouseOut.bind(this);
        this.handleDocumentMouseLeave = this.handleDocumentMouseLeave.bind(this);
        this.handleDocumentMouseEnter = this.handleDocumentMouseEnter.bind(this);
    }

    render(): string {
        return `
            <div class="a-custom-cursor" id="custom-cursor-element">
                <div class="a-custom-cursor__ring"></div>
                <div class="a-custom-cursor__dot"></div>
            </div>
        `;
    }

    onMount(): void {
        const isTouchDevice = !window.matchMedia('(hover: hover) and (pointer: fine)').matches;
        if (isTouchDevice) {
            this.isDead = true;
            return;
        }

        this.ringEl = this.element?.querySelector('.a-custom-cursor__ring') ?? null;
        this.dotEl = this.element?.querySelector('.a-custom-cursor__dot') ?? null;

        window.addEventListener('mousemove', this.handleMouseMove, { passive: true });
        document.addEventListener('mouseover', this.handleMouseOver);
        document.addEventListener('mouseout', this.handleMouseOut);
        document.addEventListener('mouseleave', this.handleDocumentMouseLeave);
        document.addEventListener('mouseenter', this.handleDocumentMouseEnter);

        this.rafId = requestAnimationFrame(this.update);
    }

    // ─────────────────────────────────────────────────────────────────────────
    // EVENTOS
    // ─────────────────────────────────────────────────────────────────────────

    private handleMouseMove(e: MouseEvent): void {
        this.mouse.x = e.clientX;
        this.mouse.y = e.clientY;

        if (!this.hasMovedFirstTime && this.element) {
            this.element.classList.add('is-visible');
            this.hasMovedFirstTime = true;
        }

        // 🔥 FIX: Despierta el bucle si estaba dormido
        if (!this.isMoving) {
            this.isMoving = true;
            this.rafId = requestAnimationFrame(this.update);
        }
    }
    private handleDocumentMouseLeave(): void {
        if (this.element) this.element.classList.remove('is-visible');
    }

    private handleDocumentMouseEnter(): void {
        if (this.element && this.hasMovedFirstTime) this.element.classList.add('is-visible');
    }

    private handleMouseOver(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        if (!target || !this.element) return;

        const isImage = target.tagName.toLowerCase() === 'img' ||
            target.classList.contains('is-image');
        const isButton = !!target.closest('button') ||
            target.classList.contains('is-button');
        const isLink = !!target.closest('a') ||
            target.classList.contains('is-clickable');

        if (isImage) this.setState('image');
        else if (isButton) this.setState('button');
        else if (isLink) this.setState('link');
    }

    private handleMouseOut(e: MouseEvent): void {
        const target = e.target as HTMLElement;
        if (!target || !this.element) return;

        const wasInteractive = target.closest('a') ||
            target.closest('button') ||
            target.tagName.toLowerCase() === 'img' ||
            target.classList.contains('is-clickable') ||
            target.classList.contains('is-image') ||
            target.classList.contains('is-button');

        if (wasInteractive) this.setState('default');
    }

    // ─────────────────────────────────────────────────────────────────────────
    // MÁQUINA DE ESTADOS
    // ─────────────────────────────────────────────────────────────────────────

    private setState(newState: CursorState): void {
        if (this.state === newState || !this.element) return;

        this.element.classList.remove(
            'is-state-link',
            'is-state-image',
            'is-state-button'
        );

        this.state = newState;

        if (newState !== 'default') {
            this.element.classList.add(`is-state-${newState}`);
        }
    }

    // ─────────────────────────────────────────────────────────────────────────
    // BUCLE DE ANIMACIÓN — LERP puro, sin física, sin rebote
    // current = current + (target - current) * factor
    // ─────────────────────────────────────────────────────────────────────────

    private update(): void {
        if (!this.element || this.isDead) return;

        this.dotPos.x += (this.mouse.x - this.dotPos.x) * this.DOT_LERP;
        this.dotPos.y += (this.mouse.y - this.dotPos.y) * this.DOT_LERP;
        this.ringPos.x += (this.mouse.x - this.ringPos.x) * this.RING_LERP;
        this.ringPos.y += (this.mouse.y - this.ringPos.y) * this.RING_LERP;

        if (this.dotEl) this.dotEl.style.transform = `translate3d(${this.dotPos.x}px, ${this.dotPos.y}px, 0)`;
        if (this.ringEl) this.ringEl.style.transform = `translate3d(${this.ringPos.x}px, ${this.ringPos.y}px, 0)`;

        // 🔥 FIX: Lógica de suspensión para ahorrar batería
        const distDotX = Math.abs(this.mouse.x - this.dotPos.x);
        const distDotY = Math.abs(this.mouse.y - this.dotPos.y);
        const distRingX = Math.abs(this.mouse.x - this.ringPos.x);
        const distRingY = Math.abs(this.mouse.y - this.ringPos.y);

        if (distDotX < 0.05 && distDotY < 0.05 && distRingX < 0.05 && distRingY < 0.05) {
            // Se durmió. Hacemos un snap exacto para evitar temblores.
            this.dotPos.x = this.mouse.x;
            this.dotPos.y = this.mouse.y;
            this.ringPos.x = this.mouse.x;
            this.ringPos.y = this.mouse.y;
            this.isMoving = false;
            return; // Cortamos el bucle aquí (ahorro de CPU)
        }

        this.rafId = requestAnimationFrame(this.update);
    }
    // ─────────────────────────────────────────────────────────────────────────
    // LIMPIEZA
    // ─────────────────────────────────────────────────────────────────────────

    override onDestroy(): void {
        this.isDead = true;

        window.removeEventListener('mousemove', this.handleMouseMove);
        document.removeEventListener('mouseover', this.handleMouseOver);
        document.removeEventListener('mouseout', this.handleMouseOut);
        document.removeEventListener('mouseleave', this.handleDocumentMouseLeave);
        document.removeEventListener('mouseenter', this.handleDocumentMouseEnter);

        if (this.rafId) cancelAnimationFrame(this.rafId);

        super.onDestroy();
    }
}