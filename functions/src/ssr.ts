/* eslint-disable linebreak-style */
import { onRequest } from "firebase-functions/v2/https";
import { onInit } from "firebase-functions/v2/core";

// Variable para cachear el servidor una vez cargado
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let cachedServer: any = null;

// Usar onInit para la inicialización lenta del servidor SSR
onInit(async () => {
  console.log("Initializing SSR server...");

  try {
    // Cargar el shim DOM ANTES de cargar el servidor
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const initDOMShim = require("../server-dom-shim-lazy.js");
    initDOMShim();

    // Ahora podemos cargar el servidor Angular Universal
    // En Cloud Functions, el código está en /workspace, y dist está en /workspace/dist
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const serverPath = require("../dist/landrick-angular/server/main");
    cachedServer = serverPath.app();

    console.log("✓ SSR server initialized successfully");
  } catch (error) {
    console.error("Error initializing SSR server:", error);
    throw error;
  }
});

export const ssr = onRequest(
  {
    region: "europe-west1",
    memory: "1GiB",
    timeoutSeconds: 60,
  },
  (request, response) => {
    console.log("SSR request received:", request.url);

    // El servidor ya debería estar inicializado por onInit
    if (!cachedServer) {
      console.error("Server not initialized yet");
      response.status(503).send("Server is initializing, please try again");
      return;
    }

    // Usar el servidor Express de Angular Universal
    return cachedServer(request, response);
  }
);
