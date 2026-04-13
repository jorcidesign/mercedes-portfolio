export class TransitionManager {
    private overlay: HTMLElement;
    private line: HTMLElement;
    private isAnimating: boolean = false;

    constructor() {
        // 1. EL TELÓN BLANCO (Tapa todo)
        this.overlay = document.createElement('div');
        this.overlay.className = 'global-transition-overlay';
        Object.assign(this.overlay.style, {
            position: 'fixed',
            top: '0', left: '0',
            width: '100vw', height: '100vh',
            backgroundColor: '#ffffff', // 🔥 Blanco puro
            zIndex: '9999',
            opacity: '0',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'opacity 0.4s ease'
        });

        // 2. LA LÍNEA NEGRA (Dentro del telón)
        this.line = document.createElement('div');
        Object.assign(this.line.style, {
            width: '0vw',
            height: '2px',
            backgroundColor: '#000000', // 🔥 Línea negra
            transition: 'width 0.8s cubic-bezier(0.8, 0, 0.2, 1)'
        });

        this.overlay.appendChild(this.line);
        document.body.appendChild(this.overlay);
    }

    public startLoading(): Promise<void> {
        return new Promise((resolve) => {
            if (this.isAnimating) return resolve();
            this.isAnimating = true;

            // Aparece el telón blanco
            this.overlay.style.pointerEvents = 'all';
            this.overlay.style.opacity = '1';
            this.line.style.width = '0vw';

            // Damos tiempo a que el telón se vuelva 100% opaco y empezamos a expandir la línea
            setTimeout(() => {
                this.line.style.width = '70vw'; // Se queda "cargando" al 70%
                resolve();
            }, 400);
        });
    }

    public finishLoading(): Promise<void> {
        return new Promise((resolve) => {
            // Terminó la descarga real -> La línea se llena al 100%
            this.line.style.width = '100vw';

            setTimeout(() => {
                // Desaparece el telón blanco suavemente
                this.overlay.style.opacity = '0';
                this.overlay.style.pointerEvents = 'none';

                setTimeout(() => {
                    this.line.style.width = '0vw'; // Reseteo para la próxima
                    this.isAnimating = false;
                    resolve();
                }, 400);
            }, 400);
        });
    }
}