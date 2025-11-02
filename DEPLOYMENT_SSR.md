# Despliegue SSR a Firebase

## Estado Actual

✅ El servidor SSR funciona correctamente en local (puerto 4000)
✅ El shim DOM completo está funcionando
✅ Zone.js se carga correctamente

## Pasos para Desplegar

### 1. Construir la aplicación

```bash
npm run build:ssr
```

### 2. Copiar archivos a Functions

```bash
npm run copy:dist
```

### 3. Instalar dependencias en Functions

```bash
cd functions
npm install
cd ..
```

### 4. Desplegar a Firebase

```bash
firebase deploy
```

O todo junto:

```bash
npm run deploy:firebase
```

## Estructura de Archivos

- `server-dom-shim.js` - Shim DOM que se carga ANTES de todo
- `server.ts` - Servidor Express de Angular Universal
- `functions/src/ssr.ts` - Cloud Function que sirve el SSR
- `firebase.json` - Configuración que redirige todas las rutas a la función SSR

## URLs de Prueba

Local: http://localhost:4000
Firebase: https://[tu-proyecto].web.app

## Comandos Útiles

- `npm run serve:ssr` - Arrancar servidor SSR localmente
- `npm run dev:ssr` - Build desarrollo + arrancar servidor
- `firebase serve` - Probar localmente con emuladores de Firebase
- `firebase deploy --only hosting` - Desplegar solo hosting
- `firebase deploy --only functions` - Desplegar solo functions

## Notas Importantes

1. El shim DOM incluye Zone.js automáticamente
2. No es necesario requerir zone.js por separado
3. El servidor usa el fallback DOM si no encuentra el template de index.html
4. El comando correcto para arrancar es: `node --require ./server-dom-shim.js dist/landrick-angular/server/main.js`
