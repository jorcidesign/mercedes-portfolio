import { HeroIntro } from '../components/organisms/HeroIntro';
import { ScrollManager } from '../core/ScrollManager';
import { ThemeStore } from '../store/ThemeStore';

export class HomeTimelineController {
    private intro: HeroIntro | null;
    private scrollManager: ScrollManager;
    private introSlot: HTMLElement | null;

    constructor(
        intro: HeroIntro | null,
        scrollManager: ScrollManager,
        introSlot: HTMLElement | null
    ) {
        this.intro = intro;
        this.scrollManager = scrollManager;
        this.introSlot = introSlot;
    }

    // 🎬 SECUENCIA 1: La entrada completa (Primera vez)
    public async playInitialSequence(): Promise<void> {
        if (this.intro) {
            await this.intro.playEntrance();
            this.revealHeader(); // Solo mostramos el header, el scroll sigue bloqueado
        }
    }

    // ⏩ SECUENCIA 1.5: La entrada rápida (Visitas recurrentes)
    public async skipSequence(): Promise<void> {
        if (this.intro) {
            await this.intro.skipIntro();
            this.revealHeader(); // Solo mostramos el header, el scroll sigue bloqueado
        }
    }

    // Código limpio para encender el header en modo luz
    private revealHeader(): void {
        ThemeStore.getInstance().setTheme('light');
        const headerEl = document.getElementById('main-header');
        if (headerEl) {
            headerEl.classList.add('is-visible');
        }
    }

    // 🎬 SECUENCIA 2: El pase de batuta al scrollear
    public handleIntroComplete(): void {
        if (this.intro) {
            this.intro.onDestroy();
            this.intro = null;
        }
        if (this.introSlot) {
            this.introSlot.remove();
        }

        // Ahora sí, la página de Home es blanca, pasamos a Dark y liberamos a la bestia
        ThemeStore.getInstance().setTheme('dark');
        this.scrollManager.unlock();
    }
}