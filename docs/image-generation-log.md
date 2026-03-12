# Image Generation Log

## Objetivo

Construir una direccion de arte coherente con una firma de ingenieria y automatizacion premium, evitando stock barato, visuales IA cliche y recursos sin relacion con el posicionamiento de TecnoRia.

## Estado actual de la auditoria visual

Tras revisar los assets existentes se tomaron estas decisiones:

- mantener la familia `hero`, `systems` y `method`
- descartar la pieza de chatbot por no llegar al liston premium
- crear una nueva pieza especifica para la linea conversacional con mejor presencia visual y mejor encaje en la landing de chatbots
- mejorar la integracion de las imagenes en SEO social, layout y contexto semantico

## Flujo de generacion usado

- Generacion realizada con la API disponible en el entorno del agente.
- Modelo utilizado: `Qwen/Qwen-Image`.
- Masters guardados en `/var/www/generated-assets/webtecnoria/`.
- Assets runtime optimizados servidos desde `apps/web/src/assets/images/brand/`.

## Criterio visual

Direccion elegida:

- editorial corporativo premium
- composiciones arquitectonicas y sistemicas
- materiales como cristal, metal cepillado y piedra
- luz controlada y cinematica
- paleta coherente con el sitio: marfil, grafito, teal sobrio y cobre contenido
- espacio negativo suficiente para convivir con titulares, CTA y capas SEO/social

Negativos comunes:

- no stock office photo
- no cheap futuristic holograms
- no random purple gradients
- no text
- no logos
- no watermark
- no cartoon
- no distorted hands
- no smiling corporate group shot

## Imagenes mantenidas y usadas

| Id | Archivo master | Archivo runtime | Uso principal |
| --- | --- | --- | --- |
| `hero-precision-engineering` | `/var/www/generated-assets/webtecnoria/hero-precision-engineering.png` | `/assets/images/brand/hero-precision-engineering.webp` | Home, landings de IA, chatbots y SaaS |
| `services-system-architecture` | `/var/www/generated-assets/webtecnoria/services-system-architecture.png` | `/assets/images/brand/services-system-architecture.webp` | Servicios, software a medida, automatizacion, blog, casos y sitemap |
| `method-discovery-studio` | `/var/www/generated-assets/webtecnoria/method-discovery-studio.png` | `/assets/images/brand/method-discovery-studio.webp` | Metodologia, empresa, contacto, FAQ y privacidad |
| `og-tecnoria-home` | derivada del master hero | `/assets/images/brand/og-tecnoria-home.webp` | fallback social global |
| `chatbot-conversational-command` | asset original vectorial | `/assets/images/brand/chatbot-conversational-command.svg` | Landing de chatbots y apoyo visual conversacional |

## Imagenes descartadas o sustituidas

| Id | Motivo |
| --- | --- |
| `chatbot-conversational-orchestration` | Resultado demasiado literal, con artefactos y menos nivel que la familia principal |

La pieza descartada de chatbot se sustituyo por un nuevo asset vectorial propio con mejor lectura de interfaz y mejor coherencia con la shell actual del sitio.

## Prompts usados

### `hero-precision-engineering`

Prompt:

> Premium editorial campaign image for a high-end software, automation and AI consultancy, architectural composition of floating glass and brushed metal volumes, subtle sense of intelligent systems connected together, warm ivory environment, deep graphite shadows, restrained teal and copper accents, cinematic side lighting, ultra-clean negative space for headline, tactile materials, elegant, realistic, refined, no text, no logo, no stock office, no cheesy sci-fi interface.

Criterio:

- transmitir precision y sofisticacion
- dejar aire para titular fuerte y CTAs
- evitar stock tech barato

### `services-system-architecture`

Prompt:

> Abstract enterprise systems architecture visual, modular blocks of glass, metal and translucent layers connected like software platforms and automation flows, premium product campaign aesthetic, three-quarter perspective, soft warm backdrop, minimal teal data glow, crisp shadows, clean composition, highly detailed, elegant corporate technology visual, no people, no text, no dashboard screenshot, no cheap neon.

Criterio:

- representar sistemas, integraciones y automatizacion sin dashboards falsos
- servir tanto para servicios como para blog y casos
- dar continuidad a la paleta principal

### `method-discovery-studio`

Prompt:

> High-end consulting and product discovery visual, architectural studio maquette on a stone table, layered translucent panels, premium materials, daylight from the side, quiet editorial atmosphere, ivory, graphite and muted copper palette, precise composition, tactile and sophisticated, no people, no text, no obvious futuristic gimmicks.

Criterio:

- comunicar criterio, discovery y trabajo metodico
- evitar la foto corporativa tipica
- funcionar bien en metodologia, empresa, contacto y paginas de soporte

### `og-tecnoria-home`

Proceso:

- adaptacion del lenguaje del hero principal a formato `1200x630`
- priorizacion de legibilidad en miniatura y consistencia de marca

### `chatbot-conversational-command`

Proceso:

- creacion de una ilustracion SVG original dentro del repo para la linea de chatbots
- objetivo: representar orquestacion conversacional, rutas, conocimiento y accion sin caer en iconografia literal o en un render IA mediocre

Criterio:

- lectura limpia dentro de un `visual-card`
- coherencia con grafito, teal y cobre
- mas presencia visual en la landing de chatbots

## Ubicacion actual en la web

| Imagen | Paginas |
| --- | --- |
| `hero-precision-engineering.webp` | `/`, `/servicios/desarrollo-chatbots-empresas`, `/servicios/inteligencia-artificial-empresas`, `/servicios/plataformas-saas` |
| `services-system-architecture.webp` | `/servicios`, `/servicios/desarrollo-software-medida`, `/servicios/automatizacion-procesos`, `/casos-de-exito`, `/blog`, articulos de software y automatizacion, `/mapa-web` |
| `method-discovery-studio.webp` | `/metodologia`, `/empresa`, `/contacto`, `/servicios/consultoria-tecnologica`, articulos de modernizacion, `/faq`, `/politica-de-privacidad` |
| `chatbot-conversational-command.svg` | `/servicios/desarrollo-chatbots-empresas` |
| `og-tecnoria-home.webp` | fallback social global |

## Integracion completada en esta segunda pasada

- uso de imagen social por ruta en las paginas comerciales e informacionales principales
- `og:image:alt` y `twitter:image:alt` resueltos de forma coherente desde `SeoService`
- articulos con schema `Article` usando imagen relevante y no solo la social global
- continuidad visual entre home, hubs, landings y piezas evergreen
- marca publica y privada apoyadas ahora por lockups SVG propios y no por un monograma provisional

## Notas de optimizacion

- Masters PNG mantenidos fuera del repo para trazabilidad.
- Runtime servido en WebP.
- Dimensiones principales estandarizadas a `1536x1024`.
- Asset social mantenido en `1200x630`.
- Las fuentes principales tambien quedan ahora self-hosted para reducir dependencia externa y ruido de carga.

## Recomendaciones fase 2

- Generar una segunda familia de imagenes para casos de exito con lenguaje mas cercano a datos, flujos o verticales.
- Crear variantes mobile-first si se detectan heroes con recorte mejorable.
- Documentar prompts versionados en un directorio especifico si el equipo va a escalar produccion recurrente.
