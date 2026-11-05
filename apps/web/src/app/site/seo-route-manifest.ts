export const PUBLIC_PATHS = new Set<string>([
  "/",
  "/servicios",
  "/servicios/desarrollo-software-medida",
  "/servicios/automatizacion-procesos",
  "/servicios/desarrollo-chatbots-empresas",
  "/servicios/inteligencia-artificial-empresas",
  "/servicios/plataformas-saas",
  "/servicios/consultoria-tecnologica",
  "/soluciones",
  "/casos-de-exito",
  "/metodologia",
  "/empresa",
  "/productos/talkaris",
  "/productos/auctorio",
  "/blog",
  "/blog/cuanto-cuesta-desarrollar-software-medida",
  "/blog/cuando-automatizar-procesos-empresa",
  "/blog/software-medida-vs-herramienta-estandar",
  "/blog/que-necesitas-antes-de-crear-un-saas",
  "/blog/chatbots-atencion-cliente-empresa",
  "/blog/ia-para-equipos-operativos",
  "/blog/migrar-software-legacy-sin-romper-operativa",
  "/blog/discovery-tecnico-que-debe-salir-de-la-primera-fase",
  "/blog/crm-erp-o-software-propio-cuando-integrar-y-cuando-construir",
  "/blog/automatizacion-documental-finanzas-y-operaciones",
  "/blog/asistentes-internos-para-onboarding-y-soporte-distribuido",
  "/blog/roadmap-producto-b2b-que-entra-en-el-primer-build",
  "/blog/cuadros-de-mando-operativos-cuando-excel-ya-no-da",
  "/faq",
  "/contacto",
  "/politica-de-privacidad",
  "/politica-de-cookies",
  "/mapa-web",
]);

export const LEGACY_REDIRECTS: Record<string, string> = {
  "/auth-cover-login": "/auth-login",
  "/auth-cover-re-password": "/auth-re-password",
  "/auth-cover-signup": "/auth-signup",
  "/auth-login-three": "/auth-login",
  "/auth-re-password-three": "/auth-re-password",
  "/auth-signup-three": "/auth-signup",
  "/nosotros": "/empresa",
  "/preguntas-frequentes": "/faq",
  "/desarrollo-de-software": "/servicios/desarrollo-software-medida",
  "/agencia-de-desarrollo-web": "/servicios/desarrollo-software-medida",
  "/agencia-de-ecommerce": "/servicios/plataformas-saas",
  "/agencia-de-funnels": "/servicios/plataformas-saas",
  "/agencia-disenio-wordpress": "/servicios/desarrollo-software-medida",
  "/agencia-disenio-web-corporativo": "/servicios/desarrollo-software-medida",
  "/gestion-redes-sociales": "/servicios/consultoria-tecnologica",
  "/agencia-marketing-contenidos": "/servicios/consultoria-tecnologica",
  "/agencia-de-branding": "/servicios/consultoria-tecnologica",
  "/email-marketing": "/servicios/consultoria-tecnologica",
  "/agencia-adwords": "/servicios/consultoria-tecnologica",
  "/facebook-ads": "/servicios/consultoria-tecnologica",
  "/instagram-ads": "/servicios/consultoria-tecnologica",
  "/linkeding-ads": "/servicios/consultoria-tecnologica",
  "/posicionamiento-seo-empresas": "/blog/software-medida-vs-herramienta-estandar",
  "/agencia-sem": "/blog/cuando-automatizar-procesos-empresa",
  "/agencia-seo-local": "/blog/software-medida-vs-herramienta-estandar",
  "/auditoria-seo": "/servicios/consultoria-tecnologica",
  "/agencia-de-linkbuilding": "/servicios/consultoria-tecnologica",
  "/agencia-seo-amazon": "/servicios/consultoria-tecnologica",
  "/pagina-web-kit-digital": "/servicios/desarrollo-software-medida",
  "/tienda-online-kit-digital": "/servicios/plataformas-saas",
  "/redes-sociales-kit-digital": "/contacto",
  "/crm-kit-digital": "/servicios/automatizacion-procesos",
  "/erp-kit-digital": "/servicios/automatizacion-procesos",
  "/factura-electronica-kit-digital": "/servicios/automatizacion-procesos",
  "/bi-analitica-kit-digital": "/servicios/desarrollo-software-medida",
  "/oficina-virtual-kit-digital": "/servicios/automatizacion-procesos",
  "/comunicaciones-seguras-kit-digital": "/contacto",
  "/ciberseguridad-kit-digital": "/contacto",
  "/presencia-avanzada-kit-digital": "/contacto",
  "/marketplace-kit-digital": "/servicios/plataformas-saas",
};

export function isPublicPath(path: string): boolean {
  return PUBLIC_PATHS.has(path);
}

const PRIVATE_EXACT_PATHS = new Set([
  "/dashboard",
  "/portal",
  "/acceso-restringido",
  "/auth-login",
  "/auth-signup",
  "/auth-re-password",
]);

export function isPrivatePath(path: string): boolean {
  return (
    PRIVATE_EXACT_PATHS.has(path) ||
    path.startsWith("/dashboard/") ||
    path.startsWith("/portal/")
  );
}
