# Web Rework Master Plan

## Update v2 - SEO + UX/UI premium + chatbots como servicio pilar

- Se incorpora la landing `/servicios/desarrollo-chatbots-empresas` como sexto servicio principal del sitio publico.
- Se reasigna la intencion SEO para separar claramente `chatbots para empresas` de `inteligencia artificial para empresas` y evitar solape semantico.
- Home y pagina de servicios pasan a nombrar de forma explicita software, automatizacion, chatbots e IA como lineas visibles desde primer scroll.
- El formulario de contacto ya incluye `Chatbot / asistente virtual` como tipo de proyecto.
- Se anade enlazado interno fijo hacia la nueva landing desde home, servicios, FAQ, casos y contacto.
- La capa visual mantiene direccion `light premium tech`, pero gana mas aire, mejor jerarquia responsive y un bloque diferencial de automatizacion conversacional.
- El backlog editorial queda definido para una siguiente fase con tres piezas iniciales sobre decision, comparativa y casos de uso de chatbots.

## A. Auditoria de la web actual

### 1. Problemas de conversion

- La propuesta de valor estaba mezclada entre "agencia de marketing digital", "diseno web", "kit digital" y un intento parcial de "software empresarial B2B".
- La home no segmentaba bien entre cliente empresa y cliente emprendedor, por lo que el mensaje perdia claridad.
- Los CTA estaban dispersos, con texto inconsistente y un patron heredado de tema multiproposito.
- El formulario de contacto no estaba bien adaptado a distintos perfiles de cliente y no guiaba la cualificacion del lead con claridad.
- Habia demasiadas rutas heredadas que desviaban la atencion hacia servicios no alineados con el reposicionamiento actual.

### 2. Problemas SEO

- Mezcla de dominios canonicamente inconsistentes: `tecnoria.com` frente a `tecnoriasl.com`.
- `robots.txt` bloqueaba `/assets/`, algo contraproducente para rastreo y renderizado.
- `sitemap.xml` incluia URLs duplicadas, slugs desfasados y una arquitectura centrada en landings heredadas.
- Los metadatos globales estaban obsoletos y no seguian una estrategia semantica coherente.
- La web cargaba muchas rutas de bajo valor comercial con riesgo alto de canibalizacion y de dilucion tematica.

### 3. Problemas visuales y de autoridad

- La UI dependia de un tema legacy de tipo agency/template, poco diferencial y con una estetica generalista.
- La navegacion y el footer estaban cargados de restos de plantilla y texto irrelevante.
- Existian textos con problemas de encoding, lo que reducia profesionalidad y confianza.
- La sensacion general era mas cercana a una agencia de servicios variados que a una consultora tecnologica premium.

### 4. Problemas tecnicos

- CSS global sobredimensionado por imports heredados de Bootstrap, Swiper, flatpickr, lightbox y hojas locales legacy.
- Estructura de rutas demasiado grande para el recorrido comercial principal.
- Layout principal con componentes heredados no alineados con la nueva estrategia de captacion.
- Dependencia de assets y librerias que no aportaban valor directo a la nueva web corporativa.

### 5. Diagnostico resumido

La web anterior no estaba optimizada para maximizar captacion organica ni conversion porque:

- vendia demasiadas cosas a la vez,
- no explicaba con precision para quien era la empresa,
- no apoyaba el contacto con un proceso comercial claro,
- transmitia una identidad visual heredada y poco competitiva,
- y tenia una arquitectura SEO desordenada alrededor de slugs ya fuera de foco.

## B. Estrategia general de rework

### Vision

Reposicionar la web como plataforma de captacion organica y conversion para una empresa tecnologica orientada a:

- software a medida,
- automatizacion de procesos,
- inteligencia artificial aplicada,
- plataformas y SaaS,
- consultoria tecnologica.

### Objetivos

1. Mejorar claridad de propuesta de valor en el primer scroll.
2. Crear una arquitectura comercial con menos ruido y mejor intencion SEO.
3. Aumentar confianza mediante casos, metodologia, FAQ y contacto claro.
4. Reducir friccion en el formulario y en la navegacion.
5. Sustituir la estetica de plantilla por una identidad premium mas sobria y creible.

### Enfoque aplicado en el codigo

- Nuevo layout principal con header, footer y CTA flotante orientados a conversion.
- Home rediseñada como pagina de impacto comercial.
- Paginas de servicio dedicadas y semanticas.
- Casos de exito narrados como historias de resultado.
- Blog con contenido orientado a decision comercial.
- SEO tecnico actualizado en metadatos, `robots.txt` y `sitemap.xml`.
- Sistema visual nuevo con CSS propio y mucho menos peso global.

## C. Nueva arquitectura de informacion

### Arbol principal

- `/`
- `/servicios`
- `/servicios/desarrollo-software-medida`
- `/servicios/automatizacion-procesos`
- `/servicios/inteligencia-artificial-empresas`
- `/servicios/plataformas-saas`
- `/servicios/consultoria-tecnologica`
- `/casos-de-exito`
- `/soluciones`
- `/empresa`
- `/metodologia`
- `/blog`
- `/blog/cuanto-cuesta-desarrollar-software-medida`
- `/blog/cuando-automatizar-procesos-empresa`
- `/blog/software-medida-vs-herramienta-estandar`
- `/blog/que-necesitas-antes-de-crear-un-saas`
- `/faq`
- `/contacto`
- `/politica-de-privacidad`
- `/mapa-web`

### Politica de redirecciones

Las rutas heredadas mas relevantes se redirigen a:

- servicios equivalentes,
- contenidos de consideracion comercial,
- o contacto,

para no mantener en el recorrido principal landings ya fuera de posicionamiento.

## D. Estrategia SEO

### Clusters activos

#### 1. Software a medida

- Pagina pilar: `/servicios/desarrollo-software-medida`
- Apoyo: home, servicios, caso de exito operativo, articulo de coste, articulo comparativo

#### 2. Automatizacion de procesos

- Pagina pilar: `/servicios/automatizacion-procesos`
- Apoyo: home, soluciones, caso de automatizacion e IA, articulo de automatizacion

#### 3. Inteligencia artificial para empresas

- Pagina pilar: `/servicios/inteligencia-artificial-empresas`
- Apoyo: home, servicios, caso de automatizacion e IA

#### 4. Plataformas y SaaS

- Pagina pilar: `/servicios/plataformas-saas`
- Apoyo: home, caso MVP SaaS, articulo sobre crear un SaaS

#### 5. Consultoria tecnologica

- Pagina pilar: `/servicios/consultoria-tecnologica`
- Apoyo: servicios, metodologia, articulo comparativo

### Enlazado interno

- La home enlaza a todos los servicios prioritarios.
- Cada landing de servicio enlaza a contacto y a casos.
- El blog enlaza a servicios relacionados por CTA contextual.
- FAQ y metodologia actuan como refuerzo de conversion y apoyo semantico.
- El mapa web refuerza rastreo y descubrimiento interno.

### Decisiones para evitar canibalizacion

- Los servicios funcionan como landings comerciales principales.
- El blog se reserva para intencion de consideracion y comparativa.
- No se crean duplicados top-level adicionales para keywords casi identicas.

## E. Propuesta UX/UI

### Direccion de arte

- Light premium tech.
- Base clara con fondos suaves, capas translucidas y contraste alto.
- Acentos azul electrico y verde azulado.
- Tipografia: `Space Grotesk` para titulares y `Manrope` para cuerpo.

### Principios visuales

- Espacio amplio y jerarquia fuerte.
- Tarjetas con profundidad suave y brillo controlado.
- Header fijo con cristal y CTA visible.
- Componentes orientados a escaneo rapido.
- CTA final y barra flotante para contacto recurrente.

### Responsive

- Grids que colapsan a una columna en movil.
- Menu movil simplificado.
- CTA flotante adaptada a pantalla pequena.

## F. Wireframe textual por pagina

### Home

1. Hero con H1 claro, subtitulo, dos CTA y bloque de autoridad.
2. Problemas que resolvemos.
3. Servicios orientados a negocio.
4. Beneficios.
5. Casos de exito resumidos.
6. Segmentacion por tipo de cliente.
7. Metodologia.
8. Diferenciadores.
9. FAQ comercial.
10. CTA final.
11. Formulario.

### Servicios

1. Hero de enfoque comercial.
2. Cards de cada servicio con encaje y beneficios.
3. Bloque de necesidades.
4. Proceso de trabajo.
5. CTA final.

### Servicio individual

1. Hero.
2. Problemas que resuelve.
3. Resultados y beneficios.
4. Que incluye.
5. Casos de uso.
6. Casos relacionados.
7. FAQ especifica.
8. CTA.
9. Formulario.

### Casos de exito

1. Hero.
2. Casos narrados con problema, solucion e impacto.
3. CTA final.

### Soluciones

1. Hero.
2. Segmentacion por perfil de cliente.
3. Bloque de necesidades tipicas.
4. CTA final.

### Empresa

1. Hero.
2. Como trabajamos.
3. Diferenciadores.
4. CTA final.

### Metodologia

1. Hero.
2. Timeline del proceso.
3. Beneficios del metodo.
4. CTA final.

### Blog

1. Hero.
2. Cards de articulos.
3. Bloque SEO/CRO.

### FAQ

1. Hero.
2. Lista completa de preguntas.
3. CTA final.

### Contacto

1. Hero.
2. Canales directos.
3. Formulario optimizado.

## G. Copy base recomendado

### Titulares base

- "Desarrollamos software, automatizacion e IA para empresas que necesitan digitalizar y escalar con orden."
- "Tecnologia pensada para resolver operativa, lanzar producto y generar ventaja real."
- "Menos tareas manuales, mas control del negocio y una base tecnica preparada para crecer."

### Subtitulos base

- "Creamos herramientas internas, plataformas y flujos inteligentes para convertir procesos complejos en operaciones mas claras y eficientes."
- "Trabajamos con empresas, startups y proyectos emprendedores que necesitan una solucion seria, no solo una interfaz bonita."

### CTA base

- "Solicitar diagnostico"
- "Pedir presupuesto"
- "Ver servicios"
- "Hablar con el equipo"
- "Explorar casos de exito"

### Mensajes de confianza

- "Sin compromiso y con criterio desde la primera conversacion."
- "Si no encaja, te lo diremos con claridad."
- "Definimos primero el problema correcto y despues la tecnologia."

### FAQ base

Las FAQ del nuevo sitio cubren:

- encaje del servicio,
- tipo de cliente,
- plazos,
- mantenimiento,
- mejora de software existente,
- necesidad de discovery,
- y forma de empezar.

## H. Estrategia de conversion

### Decisiones clave implementadas

- CTA principal visible en header.
- CTA secundaria recurrente en hero, paginas de servicio y cierres.
- Barra flotante para contacto siempre accesible.
- Casos de exito junto a landings de servicio.
- FAQ para resolver objeciones comerciales.
- Formulario menos excluyente para empresa y emprendedor.

### Fricciones eliminadas

- Mensaje ambiguo sobre lo que vende la empresa.
- Navegacion sobredimensionada con demasiadas categorias de bajo foco.
- Formularios que no guiaban bien el contexto del lead.
- Footer y header con ruido de plantilla.

### Objeciones cubiertas

- "No se si esto es para mi" -> pagina soluciones y FAQ.
- "No se si sabran hacerlo" -> casos, metodologia y servicio detallado.
- "No se si merece la pena contactar" -> copy de diagnostico y CTA claros.
- "No se si son serios" -> layout sobrio, contenido estructurado y proceso visible.

## I. Recomendaciones tecnicas

### Implementado

- Metadatos por pagina con servicio SEO centralizado.
- Canonical consistente sobre `https://tecnoriasl.com`.
- JSON-LD para pagina, breadcrumbs, servicios, articulos y FAQ.
- `robots.txt` corregido para no bloquear assets.
- `sitemap.xml` reconstruido sobre la nueva arquitectura.
- CSS global propio reducido y mucho mas ligero.

### Mejora de rendimiento conseguida

En la build comparada:

- `styles.css` pasa de aproximadamente `697 kB` a `14.38 kB`.
- `main.js` baja de aproximadamente `366.99 kB` a `270.14 kB`.
- el total inicial del navegador baja de aproximadamente `4.48 MB` a `3.02 MB`.

### Riesgos residuales

- Sigue existiendo peso inicial heredado por dependencias y rutas internas de auth/admin.
- El paquete global de iconos legacy y la zona interna siguen inflando JS aunque ya no forman parte del recorrido comercial principal.
- Para una siguiente fase conviene desacoplar auth/admin del frontend corporativo si se quiere empujar mas Core Web Vitals.

## J. Roadmap de implementacion

### Fase 1. Auditoria

- revisar propuesta de valor,
- estructura,
- SEO tecnico,
- rendimiento,
- autoridad y conversion.

### Fase 2. Arquitectura

- decidir nuevo arbol de paginas,
- definir redirecciones,
- separar paginas pilar y blog.

### Fase 3. Copy y SEO

- definir H1, title, meta description y FAQs,
- fijar clusters,
- priorizar enlaces internos.

### Fase 4. UI

- crear identidad premium,
- nuevo sistema de componentes,
- responsive y CTA persistentes.

### Fase 5. Desarrollo

- implementar layout, paginas y formulario,
- actualizar rutas y contenido.

### Fase 6. Optimizacion

- depurar bundle legacy,
- revisar analitica,
- mejorar interacciones y assets.

### Fase 7. Medicion y mejora

- medir CTR organico,
- medir tasa de conversion a contacto,
- analizar formularios, rutas de entrada y scroll depth.

## K. Tareas y subtareas detalladas

### Hecho en esta iteracion

- Reemplazar layout principal heredado.
- Reorganizar la navegacion principal.
- Crear home nueva orientada a captacion.
- Crear pagina de servicios nueva.
- Crear 5 landings de servicio.
- Crear casos de exito, soluciones, empresa, metodologia, blog, FAQ, contacto, privacidad y mapa web.
- Sustituir formulario de contacto por una version mas alineada con CRO.
- Corregir metadatos, canonicidad, sitemap y robots.
- Reducir radicalmente el CSS global.
- Definir redirecciones para URLs heredadas.

### Siguiente bloque recomendado

1. Separar admin/auth en otra aplicacion o bundle.
2. Incorporar logos, testimonios y resultados reales verificados.
3. Conectar analitica de conversion y eventos de CTA/formulario.
4. Evaluar prerender de rutas SEO principales.
5. Crear nuevas piezas editoriales segun datos de Search Console.
6. Revisar Lighthouse movil y ajustar el peso de dependencias legacy.

## Resultado esperado

La nueva web debe transmitir:

- empresa tecnologica seria,
- empresa con criterio de negocio,
- empresa preparada para resolver proyectos complejos,
- empresa moderna y premium,
- empresa a la que merece la pena contactar.

Ese es el marco aplicado en el rework actual y el documento base para iteraciones siguientes.
