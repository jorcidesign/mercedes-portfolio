// src/store/RouterStore.ts

export class RouterStore {
    private static instance: RouterStore;
    private currentPath: string = window.location.pathname;
    private listeners: ((path: string) => void)[] = [];

    private constructor() { }

    public static getInstance(): RouterStore {
        if (!RouterStore.instance) {
            RouterStore.instance = new RouterStore();
        }
        return RouterStore.instance;
    }

    public setPath(path: string): void {
        this.currentPath = path;
        this.notify();
    }

    public getPath(): string {
        return this.currentPath;
    }

    public subscribe(listener: (path: string) => void): () => void {
        this.listeners.push(listener);
        // Le pasamos el estado actual inmediatamente a quien se suscriba
        listener(this.currentPath);

        // Retornamos la función para desuscribirse (limpieza)
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private notify(): void {
        this.listeners.forEach(listener => listener(this.currentPath));
    }
}