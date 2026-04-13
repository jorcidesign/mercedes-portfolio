// src/core/GhostManager.ts
// FIX: isActive se resetea en TODOS los caminos de animateTo, no solo en el happy path.
// Antes: si targetElement era null o faltaba el frame/img, isActive quedaba en true
// para siempre y el siguiente capture() nunca funcionaba.

export class GhostManager {
    private static instance: GhostManager;
    private ghostFrame: HTMLElement | null = null;
    private ghostImg: HTMLImageElement | null = null;
    private isActive: boolean = false;

    private constructor() { }

    public static getInstance(): GhostManager {
        if (!GhostManager.instance) {
            GhostManager.instance = new GhostManager();
        }
        return GhostManager.instance;
    }

    public capture(sourceElement: HTMLElement | null): void {
        if (!sourceElement) return;

        const frame = sourceElement.querySelector('.a-image-reveal__frame') as HTMLElement
            || sourceElement;
        const img = sourceElement.querySelector('img');
        if (!frame || !img) return;

        const frameRect = frame.getBoundingClientRect();
        const imgRect = img.getBoundingClientRect();
        const frameStyle = window.getComputedStyle(frame);
        const imgStyle = window.getComputedStyle(img);

        this.ghostFrame = document.createElement('div');
        Object.assign(this.ghostFrame.style, {
            position: 'fixed',
            top: `${frameRect.top}px`,
            left: `${frameRect.left}px`,
            width: `${frameRect.width}px`,
            height: `${frameRect.height}px`,
            overflow: 'hidden',
            borderRadius: frameStyle.borderRadius || '0px',
            zIndex: '999999',
            transform: 'translateZ(0)',
            transition: 'none',
        });

        this.ghostImg = document.createElement('img');
        this.ghostImg.src = img.src;
        Object.assign(this.ghostImg.style, {
            position: 'absolute',
            top: `${imgRect.top - frameRect.top}px`,
            left: `${imgRect.left - frameRect.left}px`,
            width: `${imgRect.width}px`,
            height: `${imgRect.height}px`,
            objectFit: imgStyle.objectFit || 'cover',
            objectPosition: imgStyle.objectPosition || 'center',
            transition: 'none',
            margin: '0',
            padding: '0',
        });

        this.ghostFrame.appendChild(this.ghostImg);
        document.body.appendChild(this.ghostFrame);
        this.isActive = true;

        frame.style.visibility = 'hidden';
    }

    public hasGhost(): boolean {
        return this.isActive;
    }

    public async animateTo(targetElement: HTMLElement | null): Promise<void> {
        // FIX: cleanup en TODOS los early-returns para que isActive no quede colgado
        if (!this.isActive || !this.ghostFrame || !this.ghostImg) {
            this.cleanup();
            return;
        }

        if (!targetElement) {
            this.cleanup();
            return;
        }

        const targetFrame = targetElement.querySelector('.a-image-reveal__frame') as HTMLElement
            || targetElement;
        const targetImg = targetElement.querySelector('img');

        if (!targetFrame || !targetImg) {
            this.cleanup();
            return;
        }

        targetFrame.style.visibility = 'hidden';

        requestAnimationFrame(() => {
            requestAnimationFrame(async () => {
                const targetFrameRect = targetFrame.getBoundingClientRect();
                const targetImgRect = targetImg.getBoundingClientRect();
                const targetFrameStyle = window.getComputedStyle(targetFrame);
                const targetImgStyle = window.getComputedStyle(targetImg);

                this.ghostFrame!.offsetHeight; // reflow obligatorio

                const transition = 'all 0.8s cubic-bezier(0.8, 0, 0.2, 1)';

                Object.assign(this.ghostFrame!.style, {
                    transition,
                    top: `${targetFrameRect.top}px`,
                    left: `${targetFrameRect.left}px`,
                    width: `${targetFrameRect.width}px`,
                    height: `${targetFrameRect.height}px`,
                    borderRadius: targetFrameStyle.borderRadius,
                });

                Object.assign(this.ghostImg!.style, {
                    transition,
                    top: `${targetImgRect.top - targetFrameRect.top}px`,
                    left: `${targetImgRect.left - targetFrameRect.left}px`,
                    width: `${targetImgRect.width}px`,
                    height: `${targetImgRect.height}px`,
                    objectPosition: targetImgStyle.objectPosition,
                });

                await new Promise(resolve => setTimeout(resolve, 800));

                targetFrame.style.visibility = 'visible';
                this.cleanup();
            });
        });
    }

    public cleanup(): void {
        if (this.ghostFrame) {
            this.ghostFrame.remove();
            this.ghostFrame = null;
            this.ghostImg = null;
        }
        this.isActive = false;
    }
}