import { spawn, spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import net from "node:net";

const colors = {
  api: "\x1b[33m",
  web: "\x1b[36m",
  sys: "\x1b[35m",
};

const children = new Map();
let shuttingDown = false;

function prefixAndWrite(stream, name, color, chunk) {
  const text = chunk.toString();
  const lines = text.split(/\r?\n/);

  lines.forEach((line, index) => {
    if (!line && index === lines.length - 1) {
      return;
    }

    stream.write(`${color}[${name}]\x1b[0m ${line}\n`);
  });
}

function logSystem(message) {
  process.stdout.write(`${colors.sys}[dev]\x1b[0m ${message}\n`);
}

function getDevComposeBaseArgs() {
  const args = ["compose", "--project-name", "tecnoria-dev"];

  if (existsSync("infra/.env")) {
    args.push("--env-file", "infra/.env");
  }

  args.push("-f", "infra/docker-compose.dev.yml");
  return args;
}

function runSync(command, args, options = {}) {
  return spawnSync(command, args, {
    cwd: process.cwd(),
    env: process.env,
    stdio: "pipe",
    encoding: "utf8",
    shell: false,
    ...options,
  });
}

function ensureDevDependencies() {
  const skipDeps = process.env["SKIP_DEV_DEPS"]?.toLowerCase() === "true";
  if (skipDeps) {
    logSystem("SKIP_DEV_DEPS=true, no se levantan dependencias Docker.");
    return true;
  }

  logSystem("Levantando dependencias locales (Postgres + Mailpit)...");
  const args = [...getDevComposeBaseArgs(), "up", "-d"];
  const result = runSync("docker", args);

  if (result.error) {
    logSystem(
      "No se pudo ejecutar Docker. Instala/arranca Docker Desktop o usa SKIP_DEV_DEPS=true si ya tienes DB y SMTP."
    );
    logSystem(result.error.message);
    return false;
  }

  if ((result.status ?? 1) !== 0) {
    const stderr = result.stderr?.trim() || "";
    if (result.stdout?.trim()) {
      logSystem(result.stdout.trim());
    }
    if (stderr) {
      logSystem(stderr);
    }
    if (
      /dockerDesktopLinuxEngine|the system cannot find the file specified|error during connect/i.test(
        stderr
      )
    ) {
      logSystem("Docker daemon no esta activo. Abre Docker Desktop y espera a que quede en estado Running.");
    }
    logSystem("No se pudieron levantar las dependencias locales.");
    return false;
  }

  logSystem("Dependencias locales activas.");
  return true;
}

async function waitForTcpPort(host, port, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const reachable = await isTcpPortReachable(host, port, 1200);

    if (reachable) {
      return true;
    }

    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  return false;
}

async function isTcpPortReachable(host, port, timeoutMs = 1000) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port });
    const onFail = () => {
      socket.destroy();
      resolve(false);
    };

    socket.once("connect", () => {
      socket.end();
      resolve(true);
    });
    socket.once("error", onFail);
    socket.setTimeout(timeoutMs, onFail);
  });
}

async function ensurePortFree(port, label) {
  const busy = await isTcpPortReachable("127.0.0.1", port, 600);
  if (!busy) {
    return true;
  }

  logSystem(
    `Puerto ${port} ocupado antes de iniciar ${label}. Cierra el proceso previo o ejecuta: netstat -ano | findstr :${port}`
  );
  return false;
}

function runDevMigrations() {
  const skipMigrations = process.env["SKIP_DEV_MIGRATIONS"]?.toLowerCase() === "true";
  if (skipMigrations) {
    logSystem("SKIP_DEV_MIGRATIONS=true, se omiten migraciones de base de datos.");
    return true;
  }

  logSystem("Aplicando migraciones de API...");
  const result = spawnSync("npm run migrate:api", {
    cwd: process.cwd(),
    env: process.env,
    stdio: "inherit",
    shell: true,
  });
  if (result.error) {
    logSystem(`No se pudo ejecutar migraciones: ${result.error.message}`);
    return false;
  }

  if ((result.status ?? 1) !== 0) {
    logSystem("Migraciones fallidas. Corrige la base de datos y vuelve a ejecutar npm run dev.");
    return false;
  }

  return true;
}

function spawnRunner(name, command) {
  const child = spawn(command, {
    cwd: process.cwd(),
    env: process.env,
    shell: true,
    stdio: ["inherit", "pipe", "pipe"],
  });

  children.set(name, child);

  child.stdout.on("data", (chunk) =>
    prefixAndWrite(process.stdout, name, colors[name] || colors.sys, chunk)
  );
  child.stderr.on("data", (chunk) =>
    prefixAndWrite(process.stderr, name, colors[name] || colors.sys, chunk)
  );

  child.on("exit", (code, signal) => {
    children.delete(name);

    if (shuttingDown) {
      return;
    }

    if (signal || (code ?? 0) !== 0) {
      logSystem(`${name} finalizo con error (code=${code ?? "null"} signal=${signal ?? "none"}).`);
      stopAll(code ?? 1);
      return;
    }

    if (children.size === 0) {
      process.exit(0);
    }
  });

  return child;
}

async function waitForApiHealth(url, timeoutMs) {
  const startedAt = Date.now();

  while (Date.now() - startedAt < timeoutMs) {
    const apiProcess = children.get("api");
    if (!apiProcess || apiProcess.killed || apiProcess.exitCode !== null) {
      return false;
    }

    try {
      const response = await fetch(url);
      if (response.ok) {
        return true;
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, 900));
  }

  return false;
}

function stopAll(exitCode = 0) {
  if (shuttingDown) {
    return;
  }

  shuttingDown = true;
  for (const child of children.values()) {
    if (!child.killed) {
      child.kill("SIGTERM");
    }
  }

  setTimeout(() => process.exit(exitCode), 200);
}

async function main() {
  if (!(await ensurePortFree(3001, "API"))) {
    process.exit(1);
    return;
  }

  if (!(await ensurePortFree(4000, "SSR web"))) {
    process.exit(1);
    return;
  }

  if (!ensureDevDependencies()) {
    process.exit(1);
    return;
  }

  logSystem("Esperando Postgres en 127.0.0.1:5432...");
  const dbReady = await waitForTcpPort("127.0.0.1", 5432, 30000);
  if (!dbReady) {
    logSystem("Postgres no responde en 127.0.0.1:5432.");
    process.exit(1);
    return;
  }

  logSystem("Esperando SMTP local en 127.0.0.1:1025...");
  const smtpReady = await waitForTcpPort("127.0.0.1", 1025, 15000);
  if (!smtpReady) {
    logSystem("SMTP local no responde en 127.0.0.1:1025.");
    process.exit(1);
    return;
  }

  if (!runDevMigrations()) {
    process.exit(1);
    return;
  }

  logSystem("Iniciando API...");
  spawnRunner("api", "npm run dev:api");

  const apiReady = await waitForApiHealth("http://127.0.0.1:3001/health", 25000);
  if (!apiReady) {
    logSystem("La API no esta lista en http://127.0.0.1:3001. Revisa variables de entorno y base de datos.");
    stopAll(1);
    return;
  }

  logSystem("API OK. Iniciando SSR web...");
  spawnRunner("web", "npm run -w apps/web dev:ssr");
}

process.on("SIGINT", () => stopAll(0));
process.on("SIGTERM", () => stopAll(0));

void main();
