// src/components/atoms/HeroCanvas/index.ts
// FIX: loadAllTextures espera dispTexture antes de empezar el loop.
// FIX: resolveFadeIn se limpia en onDestroy para no llamar a un componente muerto.

import { Component } from '../../../core/Component';
import { HeroService } from '../../../services/HeroService';
import './style.css';

export class HeroCanvas extends Component {
    private ratioUniformLocation!: WebGLUniformLocation | null;
    private canvas!: HTMLCanvasElement;
    private gl!: WebGLRenderingContext;
    private rafId: number = 0;

    private blackTexture!: WebGLTexture;
    private isWaitingForIntro: boolean = true;
    private isIntroReveal: boolean = false;
    private resolveFadeIn: (() => void) | null = null;

    private images: string[] = [];
    private displacementMapUrl = 'https://images.unsplash.com/photo-1605721911519-3dfeb3be25e7?auto=format&fit=crop&w=800&q=80';

    private textureData: Array<{ texture: WebGLTexture; aspect: number }> = [];
    private dispTexture!: WebGLTexture;

    private currentIndex: number = 0;
    private nextIndex: number = 1;
    private progress: number = 0;
    private isTransitioning: boolean = false;
    private lastTime: number = 0;

    private program!: WebGLProgram;
    private positionBuffer!: WebGLBuffer;
    private progressUniformLocation!: WebGLUniformLocation | null;

    render(): string {
        return `
            <div class="a-hero-canvas" id="hero-canvas-wrapper">
                <canvas id="hero-webgl-canvas" class="a-hero-canvas__webgl"></canvas>
            </div>
        `;
    }

    async onMount(): Promise<void> {
        this.canvas = this.element?.querySelector('#hero-webgl-canvas') as HTMLCanvasElement;

        const gl = this.canvas.getContext('webgl');
        if (!gl) {
            console.error('Tu navegador no soporta WebGL');
            return;
        }
        this.gl = gl;

        this.handleResize = this.handleResize.bind(this);
        window.addEventListener('resize', this.handleResize);
        this.handleResize();

        const fetchedImages = await HeroService.getHeroImages();
        if (fetchedImages.length > 0) {
            this.images = fetchedImages;
        } else {
            console.warn('Usando imágenes de respaldo en el HeroCanvas');
        }

        this.setupWebGL();

        // FIX: esperamos TODAS las texturas críticas antes de arrancar el loop.
        // dispTexture es necesaria desde el frame 0 — sin ella el shader explota.
        await this.loadAllTextures();

        this.blackTexture = this.createSolidTexture(0, 0, 0, 255);
        this.lastTime = performance.now();
        this.rafId = requestAnimationFrame(this.renderLoop.bind(this));
    }

    private createSolidTexture(r: number, g: number, b: number, a: number): WebGLTexture {
        const gl = this.gl;
        const texture = gl.createTexture()!;
        gl.bindTexture(gl.TEXTURE_2D, texture);
        gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, 1, 1, 0, gl.RGBA, gl.UNSIGNED_BYTE, new Uint8Array([r, g, b, a]));
        return texture;
    }

    public playFadeIn(): Promise<void> {
        return new Promise((resolve) => {
            this.resolveFadeIn = resolve;
            this.isWaitingForIntro = false;
            this.isIntroReveal = true;
            this.progress = 0;
            this.lastTime = performance.now();
        });
    }

    private setupWebGL(): void {
        const gl = this.gl;

        const vsSource = `
            attribute vec2 a_position;
            varying vec2 v_uv;
            void main() {
                v_uv = a_position * 0.5 + 0.5;
                v_uv.y = 1.0 - v_uv.y;
                gl_Position = vec4(a_position, 0.0, 1.0);
            }
        `;

        const fsSource = `
            precision mediump float;
            varying vec2 v_uv;
            uniform sampler2D u_texture1;
            uniform sampler2D u_texture2;
            uniform sampler2D u_disp;
            uniform float u_progress;
            uniform vec2 u_ratio;
            void main() {
                vec2 uv = (v_uv - 0.5) * u_ratio + 0.5;
                vec4 disp = texture2D(u_disp, uv);
                float effect = disp.r * u_progress;
                float inverseEffect = disp.r * (1.0 - u_progress);
                vec2 uv1 = uv + vec2(effect, 0.0);
                vec2 uv2 = uv - vec2(inverseEffect, 0.0);
                vec4 t1 = texture2D(u_texture1, uv1);
                vec4 t2 = texture2D(u_texture2, uv2);
                gl_FragColor = mix(t1, t2, u_progress);
            }
        `;

        const vertexShader = this.compileShader(gl, gl.VERTEX_SHADER, vsSource);
        const fragmentShader = this.compileShader(gl, gl.FRAGMENT_SHADER, fsSource);

        this.program = gl.createProgram()!;
        gl.attachShader(this.program, vertexShader);
        gl.attachShader(this.program, fragmentShader);
        gl.linkProgram(this.program);
        gl.useProgram(this.program);

        this.positionBuffer = gl.createBuffer()!;
        gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
        const positions = new Float32Array([
            -1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
            -1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
        ]);
        gl.bufferData(gl.ARRAY_BUFFER, positions, gl.STATIC_DRAW);

        const positionLocation = gl.getAttribLocation(this.program, 'a_position');
        gl.enableVertexAttribArray(positionLocation);
        gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);

        gl.uniform1i(gl.getUniformLocation(this.program, 'u_texture1'), 0);
        gl.uniform1i(gl.getUniformLocation(this.program, 'u_texture2'), 1);
        gl.uniform1i(gl.getUniformLocation(this.program, 'u_disp'), 2);

        this.progressUniformLocation = gl.getUniformLocation(this.program, 'u_progress');
        this.ratioUniformLocation = gl.getUniformLocation(this.program, 'u_ratio');
    }

    private compileShader(gl: WebGLRenderingContext, type: number, source: string): WebGLShader {
        const shader = gl.createShader(type)!;
        gl.shaderSource(shader, source);
        gl.compileShader(shader);
        if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.error('Error compilando shader:', gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
        }
        return shader;
    }

    /**
     * FIX: ahora espera TODAS las texturas (incluida dispTexture) en paralelo.
     * Antes: textura[0] en serie → resto en background sin await → dispTexture podía
     * llegar después del primer frame causando un shader error silencioso.
     */
    private async loadAllTextures(): Promise<void> {
        const imageUrls = this.images.length > 0 ? this.images : [];
        const allUrls = [...imageUrls, this.displacementMapUrl];

        const loaded = await Promise.all(allUrls.map(url => this.loadTexture(url)));

        // Las primeras N son del carrusel — guardamos texture Y aspect juntos
        this.textureData = loaded.slice(0, imageUrls.length);
        // La última es el displacement map — solo necesitamos la textura
        this.dispTexture = loaded[loaded.length - 1].texture;
    }

    private loadTexture(url: string): Promise<{ texture: WebGLTexture; aspect: number }> {
        return new Promise(resolve => {
            const image = new Image();
            image.crossOrigin = 'anonymous';
            image.src = url;
            image.onload = () => {
                const aspect = image.width / image.height; // ← propio de esta imagen

                const gl = this.gl;
                const texture = gl.createTexture()!;
                gl.bindTexture(gl.TEXTURE_2D, texture);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
                gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
                gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, image);
                resolve({ texture, aspect });
            };
            image.onerror = () => {
                console.warn(`[HeroCanvas] No se pudo cargar textura: ${url}`);
                resolve({ texture: this.createSolidTexture(20, 20, 20, 255), aspect: 1.5 });
            };
        });
    }

    private computeRatio(imageAspect: number): [number, number] {
        const canvasAspect = this.gl.canvas.width / this.gl.canvas.height;
        // "object-fit: cover" — siempre llena el canvas sin deformar
        if (canvasAspect > imageAspect) {
            return [1.0, imageAspect / canvasAspect];
        } else {
            return [canvasAspect / imageAspect, 1.0];
        }
    }

    private startTransition(): void {
        if (this.isTransitioning || this.textureData.length < 2) return;
        this.isTransitioning = true;
        this.nextIndex = (this.currentIndex + 1) % this.textureData.length;
    }

    private easeInOutCubic(t: number): number {
        return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
    }

    private renderLoop(time: number): void {
        if (!this.gl || !this.program || this.textureData.length === 0) return;

        const deltaTime = time - this.lastTime;
        this.lastTime = time;

        if (this.isIntroReveal || this.isTransitioning) {
            this.progress += deltaTime * 0.00042;

            if (this.progress >= 1.0) {
                this.progress = 0;

                if (this.isIntroReveal) {
                    this.isIntroReveal = false;
                    this.currentIndex = 0;

                    const resolve = this.resolveFadeIn;
                    this.resolveFadeIn = null;
                    if (resolve) resolve();

                    if (this.textureData.length > 1) {
                        this.registerInterval(() => this.startTransition(), 5000);
                    }
                } else {
                    this.currentIndex = this.nextIndex;
                    this.isTransitioning = false;
                }
            }
        }

        const easedProgress = this.easeInOutCubic(Math.min(this.progress, 1.0));
        const gl = this.gl;
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);

        // ── ASPECT RATIO INTERPOLADO ──────────────────────────────────────────
        // Durante intro: interpola desde ratio 1:1 (pantalla negra) hasta tex[0]
        // Durante transición: interpola entre aspect del current y el next
        let ratioX = 1.0;
        let ratioY = 1.0;

        if (this.isIntroReveal && this.textureData.length > 0) {
            // Negro no tiene aspect propio → interpolamos hacia el aspect de tex[0]
            const [tx, ty] = this.computeRatio(this.textureData[0].aspect);
            ratioX = 1.0 + (tx - 1.0) * easedProgress;
            ratioY = 1.0 + (ty - 1.0) * easedProgress;
        } else if (!this.isWaitingForIntro && this.textureData.length > 0) {
            const [ax, ay] = this.computeRatio(this.textureData[this.currentIndex].aspect);
            const nextIdx = this.textureData[this.nextIndex] ? this.nextIndex : this.currentIndex;
            const [bx, by] = this.computeRatio(this.textureData[nextIdx].aspect);
            ratioX = ax + (bx - ax) * easedProgress;
            ratioY = ay + (by - ay) * easedProgress;
        }
        // ─────────────────────────────────────────────────────────────────────

        gl.uniform2f(this.ratioUniformLocation, ratioX, ratioY);
        gl.uniform1f(this.progressUniformLocation, easedProgress);

        if (this.isWaitingForIntro) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.blackTexture);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.blackTexture);
        } else if (this.isIntroReveal) {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.blackTexture);
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, this.textureData[0].texture);
        } else {
            gl.activeTexture(gl.TEXTURE0);
            gl.bindTexture(gl.TEXTURE_2D, this.textureData[this.currentIndex].texture);
            const next = this.textureData[this.nextIndex] ?? this.textureData[0];
            gl.activeTexture(gl.TEXTURE1);
            gl.bindTexture(gl.TEXTURE_2D, next.texture);
        }

        gl.activeTexture(gl.TEXTURE2);
        gl.bindTexture(gl.TEXTURE_2D, this.dispTexture);

        gl.drawArrays(gl.TRIANGLES, 0, 6);
        this.rafId = requestAnimationFrame(this.renderLoop.bind(this));
    }

    private handleResize(): void {
        if (!this.canvas) return;
        const rect = this.element!.getBoundingClientRect();
        const dpr = window.devicePixelRatio || 1;
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
    }

    override onDestroy(): void {
        this.resolveFadeIn = null;
        window.removeEventListener('resize', this.handleResize);
        if (this.rafId) cancelAnimationFrame(this.rafId);

        if (this.gl) {
            // ← antes era this.textures.forEach(...)
            this.textureData.forEach(d => this.gl.deleteTexture(d.texture));
            if (this.dispTexture) this.gl.deleteTexture(this.dispTexture);
            if (this.blackTexture) this.gl.deleteTexture(this.blackTexture);
            if (this.positionBuffer) this.gl.deleteBuffer(this.positionBuffer);

            if (this.program) {
                const shaders = this.gl.getAttachedShaders(this.program);
                if (shaders) {
                    shaders.forEach(shader => {
                        this.gl.detachShader(this.program, shader);
                        this.gl.deleteShader(shader);
                    });
                }
                this.gl.deleteProgram(this.program);
            }

            const ext = this.gl.getExtension('WEBGL_lose_context');
            if (ext) ext.loseContext();
        }

        super.onDestroy();
    }
}