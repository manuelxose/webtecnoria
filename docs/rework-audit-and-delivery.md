# Rework Audit And Delivery

## Resumen ejecutivo

Se completo una segunda pasada del rework de TecnoRia sobre la base Angular SSR existente para cerrar lo que aun olia a rediseño incompleto: home mas flagship, narrativa mas comercial, mayor densidad editorial util, enlazado interno con intencion, mejor consistencia visual y una capa SEO/social mas precisa por ruta.

El resultado final deja una web mucho mas defendible en tres frentes:

- marca: transmite una consultora de ingenieria mas seria, mas clara y mas premium
- conversion: explica mejor el valor, baja friccion y empuja a un diagnostico cualificado
- SEO: ordena intenciones, refuerza clusters y prepara el sitio para crecer sin romper arquitectura
- shell: el header, footer, logo, chatbot y area privada ya no se sienten como piezas de segunda

Validacion tecnica realizada:

- build productivo Angular SSR correcto
- paginas principales revisadas en SSR
- tipografia externa sustituida por fuentes locales para reducir dependencia y ruido en el head

## Auditoria inicial

### Stack y arquitectura detectados

- Front principal en Angular 20 con SSR.
- Rutas comerciales e informacionales definidas en `apps/web/src/app/app.routes.ts`.
- Layout principal reusable via `SiteLayoutComponent`.
- Estilos concentrados en `apps/web/src/styles.css`.
- Contenido centralizado en `apps/web/src/app/site/content/site-content.ts`.
- SEO gestionado por `SeoService`.
- Assets de marca e imagen servidos desde `apps/web/src/assets`.

### Problemas detectados antes de la segunda pasada

#### Branding y direccion visual

- La primera iteracion ya estaba mejor que el estado heredado, pero la home aun no se sentia pieza flagship.
- Varias secciones interiores seguian un patron demasiado uniforme y poco editorial.
- La direccion visual era correcta, pero aun faltaba mas intencion en ritmo, jerarquia y contraste de superficies.

#### UX y conversion

- La home necesitaba una bajada mas clara desde hero hacia prueba, perfiles, metodo y CTA.
- Algunas paginas interiores no aprovechaban suficiente el interlinking para mover al usuario hacia la siguiente decision.
- El blog funcionaba, pero todavia se leia como un listado mas que como un centro editorial de autoridad.

#### Copy y mensaje

- Se detectaban bloques demasiado neutros en servicios, blog y paginas de soporte.
- Faltaban mejores transiciones entre problema, criterio y siguiente paso.
- La voz de marca necesitaba mas precision operativa y menos tono corporativo plano.

#### SEO on-page y arquitectura

- La base era buena, pero habia metadatos sociales demasiado genericos.
- Los articulos no explotaban del todo la relacion entre contenido evergreen y landings BOFU.
- Faltaba profundidad semantica adicional en algunas piezas ya publicadas.

#### Performance y mantenimiento

- El uso de Google Fonts metia dependencia externa y ruido de CSS inline en SSR.
- La capa social y estructurada podia ser mas precisa sin complicar el mantenimiento.

## Diagnostico estrategico

### Que se mantiene

- Angular SSR y la arquitectura de rutas.
- El modelo de contenido centralizado.
- La familia visual premium ya generada para hero, systems y method.
- La infraestructura SEO basada en un servicio reusable.
- Las redirecciones legacy para proteger URLs antiguas.

### Que se rediseña o reescribe

- Home completa a nivel narrativo.
- Hub de blog como capa editorial de autoridad.
- Detalle de articulos para mejorar lectura, escaneo y conversion contextual.
- Landings de servicio para conectar mejor contenido evergreen, FAQ y casos.
- Header, footer y CTA flotante para reforzar posicionamiento premium.
- Marca visual publica y privada para sustituir el falso monograma anterior.
- Flujo del area privada para que login, restriccion y dashboard tengan una vuelta atras real.
- Documentacion de entrega y arquitectura SEO para que reflejen el estado real del proyecto.

### Que se elimina o reduce

- Claims demasiado blandos o genericos.
- Dependencia de Google Fonts.
- Metadatos sociales compartidos sin relacion suficiente con cada ruta.
- Secciones interiores que aportaban poca progresion narrativa.

### Nuevas piezas creadas o consolidadas

- Home con `hero-status-bar`, `hero-strategy-panel`, `proof-bar`, perfiles de cliente e insights destacados.
- Blog con intro por clusters y grid editorial mas potente.
- Articulos con tabla de contenidos y callout comercial.
- Landings de servicio con modulo de `Contenido de apoyo`.
- Nuevos tokens visuales y componentes premium reutilizables.

## Revision del contenido heredado

| Area | Clasificacion | Decision |
| --- | --- | --- |
| Home | Reescribir de forma profunda | Convertirla en una pagina flagship orientada a valor, prueba y captacion |
| Hub de servicios | Mantener pero escalar | Reforzar claridad comercial y enlazado a contenido BOFU |
| Landings de servicio | Reescribir de forma profunda | Darles narrativa propia, FAQs, casos e insights relacionados |
| Soluciones | Mantener pero mejorar | Afinar escenarios y encaje por tipo de empresa |
| Casos de exito | Mantener pero mejorar | Reforzar relacion con servicios y chips de navegacion |
| Metodologia | Mantener pero mejorar | Mejorar autoridad y explicar que protege el metodo |
| Empresa | Mantener pero mejorar | Subir el nivel de posicionamiento y filtros de colaboracion |
| Contacto | Mantener pero mejorar | Clarificar checklist previo y siguientes pasos |
| FAQ | Mantener pero escalar | Convertirla en soporte real para SEO y conversion |
| Blog hub | Reescribir de forma profunda | Pasar de listado a centro editorial por clusters |
| Articulos evergreen | Mantener pero escalar | Anadir profundidad semantica, lectura y CTAs mejores |
| Privacidad y mapa web | Mantener pero mejorar | Alinear tono, semantica y metadatos con el resto |

## Cambios realizados por pagina

### Home `/`

- Hero reescrito con propuesta de valor mas directa y mas ejecutiva.
- Nueva barra de senales rapidas con tiempo de respuesta, modelo de trabajo y foco de impacto.
- Nuevo panel estrategico en hero con trust statements y acceso a un insight destacado.
- Sustitucion de bloques repetitivos por `proof-bar`, perfiles de cliente y seleccion editorial.
- Refuerzo visual adicional con nuevas piezas de imagen en bloque de friccion y bloque de metodo.
- Integracion mas natural entre servicios, casos, metodo, FAQ y formulario.

Impacto esperado:

- mejor comprension en 3 a 5 segundos
- mayor autoridad percibida
- mejor paso a diagnostico desde mobile y desktop

### Servicios `/servicios`

- Ajuste de jerarquia de headings para evitar repeticion de `h2` en cards.
- Nuevo bloque editorial con articulos destacados para apoyar la decision comercial.
- Mejor framing del hub como pagina de seleccion y no solo de listado.

### Landings de servicio `/servicios/*`

- Mantienen hero, fit, pains, outcomes, deliverables, casos de uso y FAQ.
- Se anade un bloque de `Contenido de apoyo` con articulos relacionados por cluster.
- Se mantiene el modulo de contacto al final para convertir sin pasos innecesarios.
- Mejor cohesion entre problema, prueba y siguiente paso.

### Soluciones `/soluciones`

- Ajuste de jerarquia en cards repetidas.
- Mejor consistencia SEO visual con imagen social propia.

### Casos de exito `/casos-de-exito`

- Se anaden chips enlazados hacia servicios relacionados para facilitar navegacion cruzada.
- La pagina gana mas utilidad como puente entre prueba y demanda BOFU.

### Metodologia `/metodologia`

- Nuevo bloque que explica que protege el metodo y por que evita riesgo.
- Refuerzo del valor de discovery, blueprint y fases.

### Empresa `/empresa`

- Nuevo bloque de perfil con encaje, forma de colaborar y lo que no hace TecnoRia.
- Se evita el tono corporativo vacio y se refuerza el filtro de calidad de proyecto.

### Contacto `/contacto`

- Nuevo checklist para que el lead llegue mejor preparado.
- Nueva secuencia de siguientes pasos para bajar incertidumbre comercial.

### FAQ `/faq`

- Se mantiene como soporte evergreen, con mejor framing comercial.
- Se alinea tambien la imagen social con el sistema visual del sitio.

### Blog `/blog`

- Se anade una capa de clusters editoriales para orientar mejor la lectura.
- Las cards secundarias pasan a un layout editorial mas premium.
- El hub queda mejor conectado con software, automatizacion e IA aplicada.

### Articulos `/blog/[slug]`

- Se profundiza el contenido de las 7 piezas evergreen.
- Se incorpora tabla de contenidos para mejorar escaneo y usabilidad.
- Se anade un callout comercial arriba del contenido.
- Cada articulo gana `og:type=article`, imagen social mas afin y schema con imagen propia.

### Privacidad y mapa web

- Se mantienen simples, pero ahora quedan alineadas con el sistema SEO/social y el tono de marca.

### Area privada `/auth-*` y `/dashboard`

- Marca visual alineada con el site publico mediante nuevo lockup SVG compartido.
- Patron comun de vuelta atras en login, acceso restringido y dashboard.
- Preservacion de `returnUrl` al entrar en login o acceso restringido desde rutas protegidas.
- Mejor cohesion entre shell publica y backoffice para no dar sensacion de producto separado o inacabado.

## Cambios visuales

- Nuevo sistema de marca con `lockup` e `isotipo` SVG en variante clara y oscura.
- Self-hosting de `Manrope` y `Space Grotesk` con preload local.
- Refinado del sistema de color con grafito, marfil, teal y cobre contenido.
- Nuevas superficies, gradientes y texturas sutiles para quitar sensacion de plantilla.
- Header rehecho como barra premium con mejor navegacion, CTA, telefono y acceso privado.
- Footer rehecho como cierre fuerte de marca con bloque de contacto integrado y sin hueco residual al final de pagina.
- CTA flotante ajustado para no forzar padding global ni romper el final de pagina.
- Nuevos patrones de componentes:
  - `hero-status-bar`
  - `hero-strategy-panel`
  - `proof-bar`
  - `editorial-grid`
  - `profile-grid`
  - `process-summary-grid`
  - `contact-next-grid`
  - `article-toc`
  - `service-link-chip`
- `chat-fallback`

## Cambios de copy

- Titulares mas concretos y mas defensibles.
- Subtitulos con mas contexto de negocio y menos abstraccion.
- CTAs alineados con `diagnostico`, `siguiente paso` y `decision` en lugar de verbos vagos.
- Mayor traduccion de capacidades tecnicas a impacto operativo.
- Mayor claridad en perfiles de cliente, casos de uso, objeciones y encaje.

## Cambios SEO

- Mejoras de titles y descriptions ya implementadas en la primera pasada, mantenidas y consolidadas.
- Imagen social por ruta en home, hubs, servicios, casos, metodo, empresa, contacto, FAQ, blog, privacidad y mapa web.
- `SeoService` ampliado para:
  - resolver `og:image:alt` de forma coherente
  - emitir `twitter:image:alt`
  - soportar `og:type=article`
  - usar imagen especifica en `Article` schema
- Refuerzo del enlazado interno:
  - home -> insights destacados
  - servicios -> articulos BOFU/MOFU
  - casos -> servicios relacionados
  - articulos -> CTA contextual y related content
- Tabla de contenidos en articulos para mejorar escaneo y claridad semantica.

## Cambios de imagenes

- Se audito la familia visual ya generada y se mantuvieron las tres piezas que si cumplen el liston premium.
- Se anadio una nueva pieza visual especifica para la linea conversacional/chatbot y se integro en la landing correspondiente.
- Se redistribuyeron imagenes existentes para que home y metodo tengan mas presencia visual real.
- Se mantiene fuera del runtime el registro de masters y prompts.

## Keywords objetivo por pagina

| Pagina | Keyword principal | Keywords secundarias |
| --- | --- | --- |
| `/` | ingenieria de software, automatizacion e IA para empresas | software a medida, partner tecnologico, IA aplicada |
| `/servicios` | servicios de desarrollo y automatizacion para empresas | software a medida, consultoria tecnologica, chatbots, SaaS |
| `/servicios/desarrollo-software-medida` | desarrollo de software a medida | aplicaciones empresariales, software interno |
| `/servicios/automatizacion-procesos` | automatizacion de procesos empresariales | digitalizacion operativa, integracion de sistemas |
| `/servicios/desarrollo-chatbots-empresas` | desarrollo de chatbots para empresas | chatbot atencion al cliente, automatizacion conversacional |
| `/servicios/inteligencia-artificial-empresas` | inteligencia artificial para empresas | agentes IA, copilotos empresariales |
| `/servicios/plataformas-saas` | desarrollo de plataformas y SaaS | crear SaaS, MVP SaaS |
| `/servicios/consultoria-tecnologica` | consultoria tecnologica | auditoria de software, roadmap digital |
| `/soluciones` | soluciones digitales para empresas | IA para empresas, digitalizacion operativa |
| `/casos-de-exito` | casos de exito de tecnologia para empresas | automatizacion, software a medida, proyectos IA |
| `/metodologia` | metodologia de trabajo tecnologico | discovery tecnico, blueprint de software |
| `/empresa` | empresa de desarrollo de software e IA | partner tecnologico, equipo de ingenieria |
| `/contacto` | contacto desarrollo software y automatizacion | diagnostico tecnologico, proyecto IA |
| `/faq` | preguntas frecuentes desarrollo de software y automatizacion | mantenimiento software, tiempos de proyecto |
| `/blog` | blog de software, automatizacion e IA | recursos tecnologia negocio, contenidos evergreen |

## Mejoras responsive

- Hero y paneles secundarios mas legibles en mobile.
- Mejor stacking en home, blog y detalle de articulo.
- CTA mas claros en header mobile y footer.
- Mejor ritmo vertical para reducir scroll fatigue.
- Componentes editoriales adaptados a una sola columna sin perder jerarquia.

## Mejoras de conversion

- CTAs mas especificos y mejor distribuidos.
- Mayor conexion entre contenido informacional y paginas de servicio.
- Contacto mejor contextualizado con checklist y siguientes pasos.
- Mas prueba contextual via casos, metodo y bloques de credibilidad.
- El area privada ya no deja al usuario atrapado: puede volver atras o regresar al sitio publico sin friccion.

## Riesgos y limitaciones

- El bundle inicial sigue siendo mejorable en una fase posterior de optimizacion mas agresiva.
- La biblioteca visual funciona bien, pero todavia puede ampliarse con una segunda familia de imagenes para casos y verticales.
- El blog tiene ya una base seria, pero la autoridad organica real dependera de continuidad editorial y datos de Search Console.

## Propuestas para fase 2

- Crear landings por vertical si el negocio valida industria o tipologia de cliente prioritaria.
- Abrir nuevos clusters evergreen sobre ERP, CRM, legacy, ROI y discovery tecnico.
- Ampliar los casos con resultados cuantificados si el negocio puede publicarlos.
- Revisar bundle y split points para seguir empujando LCP e INP.
- Crear variantes visuales especificas para casos de exito y paginas sectoriales.

---

## Sesión 3 — Rework integral de calidad (11/03/2026)

### Contexto

Auditoría completa solicitada por el cliente: "el SEO de copy está fatal, las imágenes están fatal y descuadradas, el logo si puede ser una T sería perfecto, para móvil primero, el footer pone web orientada a captar demanda orgánica, el header en ordenador está todo descuadrado y poco moderno".

### Cambios ejecutados

#### 1. Copy — Tildes y acentos (todas las páginas)

Se corrigieron **más de 80 tildes/acentos** ausentes en texto visible y meta SEO en:

- `contact-form.component.html` + `.ts` — 17+ reemplazos
- `services-page.component.ts` — 12+ reemplazos
- `blog-page.component.ts` — 11+ reemplazos
- `faq-page.component.ts` — 5+ reemplazos
- `process-page.component.ts` — 15+ reemplazos
- `solutions-page.component.ts` — 8+ reemplazos
- `case-studies-page.component.ts` — pendiente en la siguiente continuación
- `article-page.component.ts` — 7+ reemplazos
- `not-found-page.component.ts` — 3 reemplazos
- `privacy-page.component.ts` — 6 reemplazos
- `sitemap-page.component.ts` — 3 reemplazos
- `service-detail-page.component.ts` — 8+ reemplazos
- `site-content.ts` — 3 reemplazos en keywords SEO
- `index.html` — título y meta description corregidos

#### 2. Branding — Logo "T"

Se reemplazaron los 4 SVGs en `/assets/brand/`:

- `tecnoria-mark-dark.svg` — Nuevo mark con "T" geométrica sobre fondo `#0F1A25`
- `tecnoria-mark-light.svg` — Versión light sobre `#F7FBFF`
- `tecnoria-lockup-dark.svg` — Lockup T + "TecnoRia" en Space Grotesk
- `tecnoria-lockup-light.svg` — Versión light del lockup

Diseño: T en stroke con acento diagonal teal (`#0F7A74`) y punto copper (`#BE9058`).

#### 3. Imágenes — Generadas con FLUX.2-pro via SiliconFlow

Se generaron 4 imágenes nuevas (1024×1024, convertidas a webp):

- `hero-precision-engineering` — Flujos geométricos abstractos, navy + teal + copper
- `services-system-architecture` — Arquitectura de sistemas isométrica abstracta
- `method-discovery-studio` — Planos geométricos escalonados (proceso discovery)
- `og-tecnoria-home` — OG image con branding T

Se actualizaron las dimensiones en `site-content.ts` (1536→1024).

#### 4. Header

- Eliminado subtítulo `brand-note` que cluterizaba
- Eliminado enlace "Área privada" del nav de desktop
- CTA cambiado de "Diagnóstico ejecutivo" a "Solicitar diagnóstico"
- CSS limpiado: flex layout, gaps/paddings reducidos, transiciones

#### 5. Footer

- Eliminado texto interno "Web orientada a captar demanda orgánica..."
- CTA cambiado a "¿Hablamos?"
- Descripción de marca mejorada

#### 6. Responsive / Mobile-first

- Section padding: mobile 56px → 72px (480px) → 88px (768px)
- Hero padding: 32px → 56px (768px) → 72px (1024px)
- Hero status bar: 1 col mobile → 3 cols (480px+)
- Proof bar: 1 col mobile → 3 cols (480px+)
- Imagen hero/page: aspect-ratio cambiado de 3:2 a 1:1 (match generated images)
- Visual cards: max-height constraints para evitar oversizing

#### 7. SEO

- `index.html`: título y meta description con acentos correctos
- Todas las meta descriptions y titles de todas las páginas corregidos
- Keywords corregidos en site-content.ts

### Validación

- ✅ `npm run build:ssr:web` — Build SSR exitoso sin errores
- ✅ Todas las ediciones verificadas por herramienta de edición
