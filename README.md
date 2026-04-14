# ✨ Mercedes Astorima — Portfolio SPA

> Portfolio digital de alta gama para la maquilladora profesional **Mercedes Astorima**, inspirado en el universo editorial de **[Burundanga Studio](https://www.burundangastudio.com/eva-gher)**. Una Single Page Application construida **100% desde cero**, sin frameworks ni librerías de animación pesadas.

---

## 🛠️ Stack Tecnológico

El diferenciador principal del proyecto es su arquitectura **Zero-Heavy-Dependencies**: no se utiliza React, Vue, Angular, GSAP ni Framer Motion. Todo el motor visual está escrito a mano para lograr control milimétrico sobre cada fotograma.

| Tecnología | Rol |
|---|---|
| **Vanilla TypeScript (ES6+)** | Lógica de aplicación con tipado estricto |
| **CSS3 Puro** | Estilos y animaciones sin frameworks |
| **WebGL (API nativa)** | Hero canvas inmersivo con shaders personalizados |
| **Vite** | Build tool ultrarrápido con HMR instantáneo |
| **Vercel** | Deploy y CDN global con `vercel.json` |

---

## 🏗️ Arquitectura — Atomic Design

La estructura de `src/` sigue una metodología estricta de **Atomic Design**, garantizando escalabilidad y reutilización. Cada componente encapsula su propia lógica (`index.ts`) y estilos (`style.css`).

```
src/
├── components/
│   ├── atoms/              # Elementos mínimos indivisibles
│   │   ├── CustomCursor/   # Puntero personalizado con GPU acceleration
│   │   ├── HeroCanvas/     # Canvas WebGL del Hero principal
│   │   ├── HeroTextCanvas/ # Tipografía animada sobre canvas
│   │   ├── ImageReveal/    # Animación de revelado de imagen
│   │   ├── ParallaxTitle/  # Títulos con efecto parallax
│   │   ├── SignatureDraw/  # Firma animada SVG (walkway.js)
│   │   └── ...
│   ├── molecules/          # Agrupación funcional de átomos
│   └── organisms/          # Bloques complejos e interactivos
│       ├── HeroIntro/      # Sección de entrada con WebGL
│       ├── HeroMain/       # Hero principal de la home
│       ├── WorkGalleryScroll/  # Galería horizontal con física de scroll
│       ├── NavDrawer/      # Menú lateral animado
│       ├── HeaderGlobal/   # Cabecera global persistente
│       └── Footer/         # Pie de página
├── templates/
│   └── MainLayout/         # Estructura maestra de la aplicación
├── pages/                  # Vistas enrutables (Home, Work, About, Services, Contact)
├── core/                   # Motor base de la SPA
├── data/                   # Fuente de verdad descentralizada (TypeScript estático)
├── services/               # Capa de servicios (formularios, datos)
├── store/                  # Estado global reactivo
├── controllers/            # Controladores de lógica de negocio
├── styles/                 # CSS global y design tokens
└── utils/                  # Utilidades puras
```

**Ejemplo — montaje de un componente hijo:**

```typescript
import { Button } from '../../components/atoms/Button';

const myButton = new Button({ text: 'Contáctanos', variant: 'solid' });

// mountChild inyecta el hijo en el slot y lo registra para el Garbage Collector
this.mountChild('#btn-container', myButton);
```

---

## 🗺️ Core — El Motor SPA

El directorio `src/core/` contiene el sistema nervioso de la aplicación.

### `Component.ts` — Clase Base Abstracta

Todo componente visual hereda de `Component<P>`. Define los ciclos de vida explícitos y el sistema automático de limpieza de memoria.

```typescript
export abstract class Component<P = {}> {
    abstract render(): string;   // Genera el HTML del componente
    onMount(): void { }          // Hook post-inserción en el DOM
    onDestroy(): void { ... }    // Limpia listeners, hijos y DOM en cascada
    protected listenTo(...): void  // Adjunta eventos con cleanup automático
    protected mountChild(selector, child): void  // Monta hijos y los registra
}
```

### `Router.ts` — Enrutamiento SPA sin Recarga

Intercepta clics en `<a>` globales, manipula la History API (`pushState`) y orquesta qué `Page` construir y montar sin recargar el navegador.

- **Interceptación de navegación**: Secuestra el comportamiento por defecto de los enlaces.
- **Rutas con parámetros dinámicos**: Soporte para `/work/:slug`.
- **Body freeze**: Congela el `<body>` durante las transiciones para evitar saltos visuales.
- **Limpieza DOM en backstage**: Destruye la página saliente mientras el usuario ve el telón.

**Rutas registradas:**

| Ruta | Página |
|---|---|
| `/` | `HomePage` |
| `/work` | `WorkPage` |
| `/work/:slug` | `WorkDetailPage` |
| `/about` | `AboutPage` |
| `/services` | `ServicesPage` |
| `/contact` | `ContactPage` |

### `TransitionManager.ts` — Telón de Transición

Orquesta una animación de telón blanco + línea de progreso entre navegaciones.

1. **`startLoading()`**: Aparece el overlay blanco opaco; la línea de progreso avanza al 70% simulando carga.
2. **`finishLoading()`**: La línea completa al 100%, luego el telón desaparece suavemente revelando la nueva vista.

---

## ⚡ Motor de Scroll — El Diferenciador Visual

### `ScrollManager.ts` — Motor LERP Singleton

El `ScrollManager` es el corazón del scroll virtual. Implementa un motor de **interpolación lineal (LERP) estático** sin corrección de delta-time, técnica usada en librerías premium como Lenis para lograr el efecto "mantequilla".

```
scroll.current += (scroll.target - scroll.current) * 0.08
```

**Características clave:**
- **Singleton**: una única instancia controla todo el scroll de la app.
- **LERP estático**: evita el micro-stuttering causado por fluctuaciones del timestamp del navegador.
- **Touch nativo**: inercia post-swipe con suavizado EMA (Exponential Moving Average) para replicar el feel iOS nativo.
- **Sistema de suscriptores**: `onUpdate(callback)` permite que otros módulos (como el Orchestrator) reciban el valor de scroll en **el mismo frame exacto**, sin RAF extra.
- **GPU Acceleration**: aplica el desplazamiento vía `translate3d(0, -Npx, 0)` sobre el wrapper, forzando composición en GPU.
- **ResizeObserver pasivo**: cachea el `maxScroll` dinámicamente sin forzar reflows durante la animación.

### `ScrollOrchestrator.ts` — Físicas del Scroll Horizontal

El `ScrollOrchestrator` implementa el efecto "tubo y tapa" de la **galería de portfolio**. Transforma el scroll vertical del usuario en movimiento horizontal de la galería de trabajos.

**El mecanismo en dos fases:**

```
Fase 1: El hero asciende (heroLid sube fuera de pantalla)
Fase 2: El track se desplaza horizontalmente (galería de trabajos)
```

```typescript
// El hero sube
heroLid.style.transform = `translate3d(0, -${heroY}px, 0)`;

// El track se mueve horizontal
track.style.transform = `translate3d(-${trackX}px, 0, 0)`;
```

- Se suscribe al `ScrollManager` para recibir el tick en el mismo frame, sin RAF propio.
- Detecta swipes horizontales táctiles e inyecta la inercia directamente al `ScrollManager.target`.
- `ResizeObserver` con debounce de 150ms para evitar recálculos en cascada con la barra dinámica de Safari.
- Dispara un callback `onTrackEnd` cuando la galería llega al final.

### `GhostManager.ts` — Transiciones de Imagen Cinematográficas

El `GhostManager` crea una capa "fantasma" de la imagen seleccionada que vuela desde su posición en la galería hasta su posición en el detalle del trabajo, creando una transición visual fluida estilo native iOS.

```
1. capture(sourceElement) — Clona la imagen en un div fixed sobre el body
2. animateTo(targetElement) — Anima el clon hacia la posición destino con cubic-bezier
3. cleanup() — Elimina el clon y libera memoria
```

---

## 🎨 WebGL — Hero Inmersivo

El componente `HeroCanvas` (átomo) renderiza el hero principal usando la **API WebGL nativa**, sin Three.js ni librerías intermedias. Los shaders GLSL personalizados crean efectos de distorsión y profundidad propios del universo editorial de alta costura.

- Gestión de aspect ratio reactiva vía `ResizeObserver`.
- Destrucción limpia del contexto WebGL en `onDestroy()`.
- Detección de mobile para ajustar resolución y evitar sobre-renderizado en dispositivos de baja potencia.

---

## 🗄️ Gestión de Datos — Static Data Layer

Toda la información del portfolio (textos, URLs de imágenes, taxonomía de proyectos, datos de servicios) vive en `src/data/` como objetos TypeScript tipados. No hay CMS ni llamadas a API externas en runtime.

**Ventajas:**
- Cero latencia de datos en runtime.
- Tipado estricto garantizado en build time.
- Actualización de contenido = mutación de un único archivo TypeScript.

---

## 🚀 Rendimiento y Principios

### 1. Garbage Collection Manual (Zero Memory Leaks)

`Component.onDestroy()` ejecuta una limpieza en cascada: primero los `unbinders` (event listeners registrados con `listenTo`), luego destruye a los hijos, y finalmente elimina el nodo del DOM.

```typescript
onDestroy(): void {
    this.unbinders.forEach(unbind => unbind()); // Event listeners
    this.children.forEach(child => child.onDestroy()); // Cascada
    this.element?.remove(); // DOM
}
```

### 2. GPU Acceleration Obligatoria

- `transform: translate3d(x, y, z)` en todos los elementos animados (fuerza render layer propio).
- `will-change: transform` como anuncio predictivo al browser compositor.
- Toda la matemática de posicionamiento se ejecuta en el loop RAF del `ScrollManager`.

### 3. Prevención de Layout Thrashing

- Las dimensiones del DOM se cachean vía `ResizeObserver` pasivo.
- Las posiciones en animación se calculan con diferencias entre variables cacheadas, nunca con `getBoundingClientRect()` dentro del paint path.
- El `ScrollOrchestrator` no tiene RAF propio: se engancha al tick del `ScrollManager` mediante el sistema de suscriptores.

---

## 💻 Instalación y Uso Local

Requiere **Node.js 18+**.

```bash
# Clonar el repositorio
git clone https://github.com/jorcidesign/mercedes-portfolio.git
cd mercedes-portfolio

# Instalar dependencias
npm install

# Servidor de desarrollo con HMR instantáneo
npm run dev

# Build de producción (TypeScript check + Vite build)
npm run build

# Preview del build de producción
npm run preview
```

---

## 🌐 Deploy

El proyecto está desplegado en **Vercel** con un `vercel.json` que redirige todas las rutas al `index.html` para soportar el enrutamiento SPA del lado del cliente.

```json
{
  "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
}
```

---

## 📁 Estructura de Archivos Completa

```
mercedes-portfolio/
├── public/
│   └── (assets estáticos — fuentes, favicon)
├── src/
│   ├── components/
│   │   ├── atoms/       (CustomCursor, HeroCanvas, HeroTextCanvas, ImageReveal,
│   │   │                 ParallaxTitle, ScrollArrow, SignatureDraw, LogoFull,
│   │   │                 LogoIsotype, WorkInfo, NavButton, NavLink, SplitMenuLink, InputField)
│   │   ├── molecules/
│   │   └── organisms/   (HeroIntro, HeroMain, HeroWorkDetail, WorkGalleryScroll,
│   │                     WorkGalleryHome, WorkGallerySection, NavDrawer,
│   │                     HeaderGlobal, ServiceStack, Footer)
│   ├── core/
│   │   ├── Component.ts            # Clase base con lifecycle y GC manual
│   │   ├── ScrollManager.ts        # Motor LERP singleton de scroll virtual
│   │   ├── Scrollorchestrator.ts   # Físicas del scroll horizontal de galería
│   │   ├── GhostManager.ts         # Transiciones cinematográficas de imagen
│   │   ├── TransitionManager.ts    # Telón de transición entre rutas
│   │   ├── SEOManager.ts           # Gestión dinámica de meta tags
│   │   └── router/
│   │       └── Router.ts           # Enrutador SPA con History API
│   ├── templates/
│   │   └── MainLayout/             # Layout maestro persistente
│   ├── pages/                      # Home, Work, WorkDetail, About, Services, Contact
│   ├── data/                       # Contenido estático tipado (works, services, copy)
│   ├── services/                   # Capa de servicios (form, data fetching)
│   ├── store/                      # Estado global reactivo
│   ├── controllers/                # Controladores de negocio
│   ├── styles/                     # CSS global, tokens, reset
│   ├── utils/                      # Utilidades puras
│   └── main.ts                     # Entry point — boot de la aplicación
├── index.html
├── tsconfig.json
├── vercel.json
└── package.json
```

---

*Diseñado y desarrollado por **[JorciDesign](https://github.com/jorcidesign)** — Inspirado en la estética editorial de Burundanga Studio.*
