export abstract class Component<P = {}> {
    protected props: P;
    public element: HTMLElement | null = null;
    protected children: Component<any>[] = [];

    // 🛡️ NUEVO: El recolector de basura de eventos e intervalos
    private unbinders: Array<() => void> = [];

    constructor(props?: P) {
        this.props = props ?? ({} as P);
    }

    abstract render(): string;

    mount(container: HTMLElement): void {
        container.insertAdjacentHTML('beforeend', this.render());
        this.element = container.lastElementChild as HTMLElement;
        this.onMount();
    }

    onMount(): void { }

    // 🛡️ NUEVO: Método seguro para escuchar eventos del DOM
    protected listenTo(
        target: EventTarget,
        event: string,
        handler: EventListenerOrEventListenerObject,
        options?: boolean | AddEventListenerOptions
    ): void {
        target.addEventListener(event, handler, options);

        // Guardamos la instrucción exacta para destruirlo después
        this.unbinders.push(() => {
            target.removeEventListener(event, handler, options);
        });
    }

    // 🛡️ NUEVO: Método seguro para intervalos (Evita el agujero negro)
    protected registerInterval(handler: TimerHandler, timeout?: number): void {
        const id = setInterval(handler, timeout);
        this.unbinders.push(() => clearInterval(id));
    }

    // 🛡️ NUEVO: Helper para registrar limpiezas personalizadas (como desuscribirse de stores)
    protected registerCleanup(cleanupFn: () => void): void {
        this.unbinders.push(cleanupFn);
    }

    onDestroy(): void {
        // 1. LIMPIEZA AUTOMÁTICA: Ejecutamos todos los unbinders
        this.unbinders.forEach(unbind => unbind());
        this.unbinders = []; // Vaciamos la memoria

        // 2. Destruimos a los hijos
        this.children.forEach(child => child.onDestroy());
        this.children = [];

        // 3. Destruimos el DOM
        if (this.element) {
            this.element.remove();
            this.element = null;
        }
    }

    protected mountChild(selector: string, childComponent: Component<any>): void {
        const mountPoint = this.element?.querySelector(selector) as HTMLElement;
        if (mountPoint) {
            childComponent.mount(mountPoint);
            this.children.push(childComponent);
        } else {
            console.warn(`[Component Warning]: No se encontró el slot '${selector}'.`);
        }
    }
}