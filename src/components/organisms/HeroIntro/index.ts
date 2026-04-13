import { Component } from '../../../core/Component';
import { HeroCanvas } from '../../atoms/HeroCanvas';
import { HeroTextCanvas } from '../../atoms/HeroTextCanvas';
import { LogoCurtain } from '../../molecules/LogoCurtain';
import { SignatureDraw } from '../../atoms/SignatureDraw';
import { ScrollArrow } from '../../atoms/ScrollArrow';
import './style.css';

interface HeroIntroProps {
    onIntroComplete?: () => void;
}

export class HeroIntro extends Component<HeroIntroProps> {
    private rafId: number = 0;

    private logoCurtain: LogoCurtain;
    private webglBackground: HeroCanvas;
    private textIntro: HeroTextCanvas;
    private signature: SignatureDraw;
    private scrollIndicator: ScrollArrow;

    private isDead: boolean = false;
    private isTimelineComplete: boolean = false;
    private isExiting: boolean = false;
    private exitProgress: number = 0;

    private touchStartY: number = 0;

    constructor(props: HeroIntroProps = {}) {
        super(props);
        this.loop = this.loop.bind(this);
        this.handleUserScroll = this.handleUserScroll.bind(this);
        this.handleTouchStart = this.handleTouchStart.bind(this);
        this.handleTouchMove = this.handleTouchMove.bind(this);

        this.logoCurtain = new LogoCurtain();
        this.webglBackground = new HeroCanvas();
        this.textIntro = new HeroTextCanvas();
        this.signature = new SignatureDraw();
        this.scrollIndicator = new ScrollArrow();
    }

    render(): string {
        return `
        <section class="o-hero-intro">
            <div class="o-hero-intro__canvas-mount" id="hero-canvas-mount"></div>
            <div class="o-hero-intro__text-mount" id="hero-text-mount"></div>
            <div class="o-hero-intro__signature-mount" id="hero-signature-mount"></div>
            <div class="o-hero-intro__arrow-mount" id="hero-arrow-mount"></div>

           <div class="o-hero-intro__footer-text">
    <p>
        <span class="line">make up</span>
        <span class="line">artists</span>
        <span class="line">and</span>
        <span class="line">hairstyle</span>
    </p>
</div>

            <div id="intro-curtain-slot"></div>
        </section>
    `;
    }

    async onMount(): Promise<void> {
        this.mountChild('#hero-canvas-mount', this.webglBackground);
        this.mountChild('#hero-text-mount', this.textIntro);
        this.mountChild('#hero-signature-mount', this.signature);
        this.mountChild('#hero-arrow-mount', this.scrollIndicator);
        this.mountChild('#intro-curtain-slot', this.logoCurtain);
    }

    public async playEntrance(): Promise<void> {
        await this.logoCurtain.playCurtain();
        this.logoCurtain.onDestroy();

        await this.textIntro.playIntro();
        await new Promise(r => setTimeout(r, 0));

        this.signature.playAnimation();
        await this.webglBackground.playFadeIn();

        setTimeout(() => {
            if (this.element) {
                this.element.classList.add('is-arrow-visible');
            }
        }, 800);

        this.startListeningForExit();
    }

    public async skipIntro(): Promise<void> {
        this.logoCurtain.onDestroy();

        this.textIntro.playIntro();
        this.signature.playAnimation();
        await this.webglBackground.playFadeIn();

        setTimeout(() => {
            if (this.element) {
                this.element.classList.add('is-arrow-visible');
            }
        }, 300);

        this.startListeningForExit();
    }

    private startListeningForExit(): void {
        this.isTimelineComplete = true;
        this.rafId = requestAnimationFrame(this.loop);

        window.addEventListener('wheel', this.handleUserScroll, { passive: true });
        window.addEventListener('keydown', this.handleUserScroll, { passive: true });
        window.addEventListener('touchstart', this.handleTouchStart, { passive: true });
        window.addEventListener('touchmove', this.handleTouchMove, { passive: true });
    }

    private handleTouchStart(e: TouchEvent): void {
        this.touchStartY = e.touches[0].clientY;
    }

    private handleTouchMove(e: TouchEvent): void {
        if (!this.isTimelineComplete || this.isExiting) return;

        const currentY = e.touches[0].clientY;
        const deltaY = this.touchStartY - currentY;

        if (Math.abs(deltaY) > 30) {
            this.handleUserScroll();
        }
    }

    private handleUserScroll(): void {
        if (!this.isTimelineComplete || this.isExiting) return;

        this.isExiting = true;

        window.removeEventListener('wheel', this.handleUserScroll);
        window.removeEventListener('keydown', this.handleUserScroll);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);
    }

    private loop(): void {
        if (!this.element || this.isDead) return;

        if (this.isExiting) {
            this.exitProgress += 0.012;

            if (this.exitProgress >= 1) {
                this.exitProgress = 1;
                this.element.style.opacity = '0';
                this.element.style.transform = 'scale(1.15)';
                this.element.classList.add('is-hidden');

                this.isDead = true;
                if (this.props?.onIntroComplete) this.props.onIntroComplete();
                return;
            }

            const opacity = 1 - this.exitProgress;
            const scale = 1 + (this.exitProgress * 0.15);
            this.element.style.opacity = opacity.toString();
            this.element.style.transform = `scale(${scale})`;
        }

        this.rafId = requestAnimationFrame(this.loop);
    }

    override onDestroy(): void {
        this.isDead = true;
        if (this.rafId) cancelAnimationFrame(this.rafId);

        window.removeEventListener('wheel', this.handleUserScroll);
        window.removeEventListener('keydown', this.handleUserScroll);
        window.removeEventListener('touchstart', this.handleTouchStart);
        window.removeEventListener('touchmove', this.handleTouchMove);

        this.webglBackground.onDestroy();
        this.textIntro.onDestroy();
        this.signature.onDestroy();
        this.scrollIndicator.onDestroy();
        super.onDestroy();
    }
}