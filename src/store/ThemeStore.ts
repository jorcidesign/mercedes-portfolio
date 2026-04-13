type Theme = 'light' | 'dark';
type Subscriber = (theme: Theme) => void;

export class ThemeStore {
    private static instance: ThemeStore;

    // 🔥 CAMBIO: Ahora el tema por defecto al cargar la app será el inverso
    private currentTheme: Theme = 'dark'; // o 'light', dependiendo de cuál sea tu nuevo inicio real
    private subscribers: Set<Subscriber> = new Set();

    private constructor() { }

    public static getInstance(): ThemeStore {
        if (!ThemeStore.instance) {
            ThemeStore.instance = new ThemeStore();
        }
        return ThemeStore.instance;
    }

    public get theme(): Theme {
        return this.currentTheme;
    }

    public setTheme(newTheme: Theme): void {
        if (this.currentTheme === newTheme) return;
        this.currentTheme = newTheme;
        this.subscribers.forEach(sub => sub(newTheme));
    }

    public subscribe(callback: Subscriber): () => void {
        this.subscribers.add(callback);
        callback(this.currentTheme);
        return () => this.subscribers.delete(callback);
    }
}