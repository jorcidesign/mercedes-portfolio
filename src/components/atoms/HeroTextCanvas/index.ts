import { Component } from '../../../core/Component';
import './style.css';

interface SegmentData {
    path2D: Path2D;
    length: number;
}

export class HeroTextCanvas extends Component {
    private rectWidth: number = 0;
    private rectHeight: number = 0;
    private dpr: number = 1;
    private canvas!: HTMLCanvasElement;
    private ctx!: CanvasRenderingContext2D | null;
    private rafId: number = 0;

    private originalWidth = 14959;
    private originalHeight = 6509;

    private segments: SegmentData[] = [];
    private startTime: number = 0;
    private duration: number = 3000; // un poco más para que luzca el easeOutExpo
    private progress: number = 0;
    private resolveIntro: (() => void) | null = null;

    private rawPaths = [
        "M2255.658,67.904l0,6371.833l-355.508,0l0,-5338.043l-9.117,0l-601.633,5338.043l-328.163,-0l-583.4,-5338.043l-9.117,0l0,5338.043l-355.508,-0l-0,-6371.833l556.054,-0l556.054,3926.945l9.117,0l565.171,-3926.945l556.054,0l-0.004,-0Z",
        "M3076.067,1101.695l0,1859.36l656.325,0l0,1033.795l-656.325,0l0,1411.086l884.217,0l0,1033.799l-1303.538,0l0,-6371.833l1267.075,-0l0,1033.795l-847.754,0Z",
        "M5838.104,2647.629c0,194.467 -30.387,338.8 -91.158,432.992c-60.771,94.196 -136.733,156.483 -227.892,186.871c91.158,24.308 167.121,83.558 227.892,177.754c60.771,94.196 91.158,238.525 91.158,432.992l0,1577.004c0,328.162 10.633,562.129 31.904,701.904c21.271,139.775 37.983,233.967 50.137,282.583l-419.321,0c-30.387,-79.004 -51.654,-191.429 -63.808,-337.279c-12.154,-145.85 -18.233,-361.588 -18.233,-647.212l0,-968.143c0,-328.163 -94.196,-492.246 -282.583,-492.246l-455.783,0l0,2444.876l-419.321,0l0,-6371.833l856.871,-0c194.467,0 363.108,68.367 505.917,205.1c142.813,136.733 214.217,344.875 214.217,624.421l0,1750.204l0.004,0.012Zm-701.904,313.425c188.392,0 282.583,-161.042 282.583,-483.129l0,-838.406c0,-194.467 -34.942,-332.721 -104.829,-414.763c-69.887,-82.042 -147.371,-123.062 -232.45,-123.062l-401.087,0l0,1859.36l455.783,0Z",
        "M6977.558,6494.429c-85.079,0 -171.679,-15.192 -259.796,-45.579c-88.117,-30.387 -165.6,-79.004 -232.45,-145.85c-66.85,-66.85 -121.542,-153.446 -164.083,-259.796c-42.542,-106.35 -63.808,-232.45 -63.808,-378.3l0,-4822.175c0,-145.85 21.271,-271.95 63.808,-378.3c42.542,-106.35 97.233,-192.946 164.083,-259.796c66.85,-66.85 144.329,-115.467 232.45,-145.85c88.117,-30.388 174.717,-45.579 259.796,-45.579l136.733,0c85.079,0 170.158,15.192 255.238,45.579c85.079,30.388 162.562,79.004 232.45,145.85c69.887,66.85 126.1,153.446 168.637,259.796c42.542,106.35 63.808,232.45 63.808,378.3l0,2118.325l-419.321,0l0,-1321.535c0,-194.467 -34.942,-332.721 -104.829,-414.763c-69.887,-82.042 -147.371,-123.062 -232.45,-123.062l-63.808,0c-85.079,0 -162.563,41.021 -232.45,123.062c-69.887,82.042 -104.829,220.296 -104.829,414.763l0,3228.59c0,194.467 34.942,332.721 104.829,414.762c69.887,82.042 147.371,123.063 232.45,123.063l63.808,0c85.079,0 162.563,-41.021 232.45,-123.063c69.887,-82.042 104.829,-220.296 104.829,-414.762l0,-873.261l419.321,0l0,1670.051c0,145.85 -21.271,271.95 -63.808,378.3c-42.542,106.35 -98.754,192.946 -168.637,259.796c-69.887,66.85 -147.371,115.467 -232.45,145.85c-85.079,30.387 -170.158,45.579 -255.238,45.579l-136.733,0l0,0.004Z",
        "M8636.604,1101.695l0,1859.36l656.325,0l0,1033.795l-656.325,0l0,1411.086l884.217,0l0,1033.799l-1303.538,0l0,-6371.833l1267.075,-0l0,1033.795l-847.754,0Z",
        "M9821.638,6439.738l0,-6371.833l856.871,-0c85.079,0 170.158,13.675 255.237,41.021c85.079,27.346 162.562,72.925 232.45,136.733c69.888,63.808 126.1,147.371 168.637,250.679c42.542,103.312 63.808,227.892 63.808,373.742l0,4767.479c0,145.85 -21.271,270.429 -63.808,373.742c-42.542,103.313 -98.754,186.871 -168.637,250.679c-69.888,63.808 -147.371,109.387 -232.45,136.733c-85.079,27.346 -170.158,41.021 -255.237,41.021l-856.871,0l0,0.004Zm419.321,-5338.043l0,4304.24l401.087,0c85.079,0 162.562,-36.462 232.45,-109.387c69.888,-72.925 104.829,-206.621 104.829,-401.087l0,-3283.29c0,-194.467 -34.942,-328.162 -104.829,-401.087c-69.888,-72.925 -147.371,-109.388 -232.45,-109.388l-401.087,0Z",
        "M12200.821,1101.695l0,1859.36l656.325,0l0,1033.795l-656.325,0l0,1411.086l884.217,0l0,1033.799l-1303.538,0l0,-6371.833l1267.075,-0l0,1033.795l-847.754,0Z",
        "M14525.308,2961.05l0,-1321.531c0,-194.467 -34.942,-332.721 -104.829,-414.763c-69.888,-82.042 -147.371,-123.062 -232.45,-123.062l-63.808,0c-85.079,0 -162.562,41.021 -232.45,123.062c-69.888,82.042 -104.829,220.296 -104.829,414.763l0,169.472c0,285.625 60.771,539.342 182.312,761.154c121.542,221.813 253.717,437.55 396.529,647.213c142.812,209.658 274.987,425.396 396.529,647.213c121.542,221.812 182.313,478.571 182.313,770.271l0,1030.067c0,145.85 -21.271,271.95 -63.808,378.3c-42.542,106.35 -97.233,192.946 -164.083,259.796c-66.85,66.85 -142.813,115.467 -227.892,145.85c-85.079,30.387 -173.196,45.579 -264.354,45.579l-127.621,0c-85.079,0 -171.679,-15.192 -259.796,-45.579c-88.117,-30.387 -167.121,-79.004 -237.008,-145.85c-69.888,-66.85 -126.1,-153.446 -168.637,-259.796c-42.542,-106.35 -63.808,-232.45 -63.808,-378.3l0,-1670.059l382.858,0l0,873.261c0,194.467 37.983,332.721 113.946,414.762c75.963,82.042 156.483,123.063 241.562,123.063l63.808,0c85.079,0 165.6,-41.021 241.562,-123.063c75.962,-82.042 113.946,-220.296 113.946,-414.762l3.576,-164.483c0,-188.392 -32.443,-375.676 -90.176,-533.681c-57.733,-158.004 -129.137,-308.413 -214.217,-451.225c-85.079,-142.812 -177.754,-282.583 -278.025,-419.321c-100.271,-136.733 -192.946,-278.025 -278.025,-423.879c-85.079,-145.85 -156.483,-300.817 -214.217,-464.896c-57.733,-164.083 -86.6,-343.354 -86.6,-537.821l0,-1030.067c0,-145.85 21.271,-271.95 63.808,-378.3c42.542,-106.35 97.233,-192.946 164.083,-259.796c66.85,-66.85 144.329,-115.467 232.45,-145.85c88.117,-30.388 174.717,-45.579 259.796,-45.579l100.271,0c85.079,0 170.158,15.192 255.238,45.579c85.079,30.388 162.562,79.004 232.45,145.85c69.888,66.85 126.1,153.446 168.638,259.796c42.542,106.35 63.808,232.45 63.808,378.3l0,2118.317l-382.858,0l0.008,-0.004Z"
    ];

    constructor() {
        super();
        this.renderLoop = this.renderLoop.bind(this);
        this.handleResize = this.handleResize.bind(this);
    }
    render(): string {
        return `
            <div class="a-hero-text-canvas" id="hero-text-wrapper">
                
                <canvas id="text-canvas" class="a-hero-text-canvas__element"></canvas>
                
            </div>
        `;
    }

    onMount(): void {
        this.canvas = this.element?.querySelector('#text-canvas') as HTMLCanvasElement;
        this.ctx = this.canvas.getContext('2d');
        this.prepareSegments();
        window.addEventListener('resize', this.handleResize);
        this.handleResize();
    }

    public playIntro(): Promise<void> {
        return new Promise((resolve) => {
            this.resolveIntro = resolve;
            this.startTime = performance.now();
            this.rafId = requestAnimationFrame(this.renderLoop);
        });
    }

    // ─── NUEVO CORAZÓN: Descompone cada path SVG en segmentos individuales ───
    private prepareSegments(): void {
        const svgns = "http://www.w3.org/2000/svg";
        const tempPath = document.createElementNS(svgns, "path");

        this.segments = [];

        this.rawPaths.forEach(d => {
            const individualSegments = this.splitPathIntoSegments(d);

            individualSegments.forEach(segmentD => {
                tempPath.setAttribute("d", segmentD);
                const length = tempPath.getTotalLength();
                if (length > 0) {
                    this.segments.push({
                        path2D: new Path2D(segmentD),
                        length
                    });
                }
            });
        });
    }

    // ─── Parsea un path SVG y lo parte en sub-paths por vértice ───
    private splitPathIntoSegments(d: string): string[] {
        const results: string[] = [];

        // Tokenizamos el path en comandos individuales
        // Regex que captura letra de comando + sus números
        const tokenRegex = /([MLCQZlcqz])([^MLCQZlcqz]*)/gi;
        const tokens: { cmd: string; args: number[] }[] = [];

        let match;
        while ((match = tokenRegex.exec(d)) !== null) {
            const cmd = match[1];
            const rawArgs = match[2].trim();
            const args = rawArgs.length > 0
                ? rawArgs.split(/[\s,]+/).filter(Boolean).map(Number)
                : [];
            tokens.push({ cmd, args });
        }

        // Estado del cursor para convertir coords relativas a absolutas
        let curX = 0;
        let curY = 0;
        let startX = 0; // Para el comando Z
        let startY = 0;

        for (let i = 0; i < tokens.length; i++) {
            const { cmd, args } = tokens[i];

            if (cmd === 'M') {
                curX = args[0]; curY = args[1];
                startX = curX; startY = curY;
                // Si hay más pares después de M, son líneas implícitas
                for (let j = 2; j < args.length; j += 2) {
                    const toX = args[j], toY = args[j + 1];
                    results.push(`M${curX},${curY}L${toX},${toY}`);
                    curX = toX; curY = toY;
                }
            } else if (cmd === 'm') {
                curX += args[0]; curY += args[1];
                startX = curX; startY = curY;
            } else if (cmd === 'L') {
                for (let j = 0; j < args.length; j += 2) {
                    const toX = args[j], toY = args[j + 1];
                    results.push(`M${curX},${curY}L${toX},${toY}`);
                    curX = toX; curY = toY;
                }
            } else if (cmd === 'l') {
                for (let j = 0; j < args.length; j += 2) {
                    const toX = curX + args[j], toY = curY + args[j + 1];
                    results.push(`M${curX},${curY}L${toX},${toY}`);
                    curX = toX; curY = toY;
                }
            } else if (cmd === 'C') {
                for (let j = 0; j < args.length; j += 6) {
                    const x1 = args[j], y1 = args[j + 1];
                    const x2 = args[j + 2], y2 = args[j + 3];
                    const toX = args[j + 4], toY = args[j + 5];
                    results.push(`M${curX},${curY}C${x1},${y1} ${x2},${y2} ${toX},${toY}`);
                    curX = toX; curY = toY;
                }
            } else if (cmd === 'c') {
                for (let j = 0; j < args.length; j += 6) {
                    const x1 = curX + args[j], y1 = curY + args[j + 1];
                    const x2 = curX + args[j + 2], y2 = curY + args[j + 3];
                    const toX = curX + args[j + 4], toY = curY + args[j + 5];
                    results.push(`M${curX},${curY}C${x1},${y1} ${x2},${y2} ${toX},${toY}`);
                    curX = toX; curY = toY;
                }
            } else if (cmd === 'Z' || cmd === 'z') {
                // Línea de cierre al punto de inicio
                if (curX !== startX || curY !== startY) {
                    results.push(`M${curX},${curY}L${startX},${startY}`);
                }
                curX = startX; curY = startY;
            }
        }

        return results;
    }

    private handleResize(): void {
        if (!this.canvas || !this.element) return;
        const rect = this.element.getBoundingClientRect();
        this.dpr = window.devicePixelRatio || 1;
        this.rectWidth = rect.width;
        this.rectHeight = rect.height;
        this.canvas.width = this.rectWidth * this.dpr;
        this.canvas.height = this.rectHeight * this.dpr;
        if (this.progress >= 1) {
            this.renderLoop(performance.now());
        }
    }

    private easeOutExpo(t: number): number {
        return t === 1 ? 1 : 1 - Math.pow(2, -10 * t);
    }

    private renderLoop(timestamp: number): void {
        if (!this.ctx || !this.canvas || !this.element) return;

        if (this.rectWidth === 0 || this.rectHeight === 0) {
            this.handleResize();
        }

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        const elapsedTime = timestamp - this.startTime;
        let rawProgress = elapsedTime / this.duration;
        if (rawProgress > 1) rawProgress = 1;
        this.progress = this.easeOutExpo(rawProgress);

        let scaleX = 1, scaleY = 1, offsetX = 0, offsetY = 0;

        // ─── LÓGICA DE ESCALA ROBUSTA PARA MÓVILES Y PORTRAIT ───
        if (window.innerWidth <= 850 || window.innerHeight > window.innerWidth) {
            // Contained scaling (mantener proporciones y evitar estirar las letras)
            const scale = Math.min(this.rectWidth / this.originalWidth, this.rectHeight / this.originalHeight);
            // Reducimos un poco más en móviles por el centrado puro
            const mobileScale = scale * 0.95;
            scaleX = mobileScale;
            scaleY = mobileScale;
            offsetX = (this.rectWidth - (this.originalWidth * scaleX)) / 2;
            offsetY = (this.rectHeight - (this.originalHeight * scaleY)) / 2;
        } else {
            // Stretch mode 
            scaleX = this.rectWidth / this.originalWidth;
            scaleY = this.rectHeight / this.originalHeight;
        }

        this.ctx.setTransform(
            this.dpr * scaleX, 0, 0,
            this.dpr * scaleY,
            this.dpr * offsetX,
            this.dpr * offsetY
        );

        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineCap = 'round';
        this.ctx.lineJoin = 'round';

        const avgScale = (scaleX + scaleY) / 2;
        this.ctx.lineWidth = window.innerWidth <= 768 ? (0.9 / avgScale) : (1.8 / avgScale);

        // ─── Cada segmento se anima con el mismo progress global + easeOutExpo ───
        // El truco: segmentos cortos se "dibujan" antes que los largos visualmente
        // porque el dashoffset llega a 0 más rápido en proporción
        this.segments.forEach(seg => {
            this.ctx!.setLineDash([seg.length, seg.length]);
            this.ctx!.lineDashOffset = seg.length * (1 - this.progress);
            this.ctx!.stroke(seg.path2D);
        });

        if (this.progress < 1) {
            this.rafId = requestAnimationFrame(this.renderLoop);
        } else {
            if (this.resolveIntro) {
                this.resolveIntro();
                this.resolveIntro = null;
            }
        }
    }

    override onDestroy(): void {
        window.removeEventListener('resize', this.handleResize);
        if (this.rafId) cancelAnimationFrame(this.rafId);
        super.onDestroy();
    }
}