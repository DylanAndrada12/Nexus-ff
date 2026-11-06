/**
 * Crea (o promueve) el primer administrador de NEXUS FF.
 *
 * Uso interactivo:
 *   npm run admin:create
 *
 * Uso no interactivo:
 *   $env:ADMIN_EMAIL="admin@nexusff.com"
 *   $env:ADMIN_NAME="Administrador"
 *   $env:ADMIN_PASSWORD="UnaClaveSegura123"
 *   npm run admin:create
 *
 * También acepta argumentos posicionales:
 *   npm run admin:create -- admin@nexusff.com "Administrador"
 * La contraseña se pide de forma oculta si no está en ADMIN_PASSWORD.
 */
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import * as readline from "node:readline/promises";
import { stdin as input, stdout as output } from "node:process";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

function loadEnvFile() {
  if (process.env.DATABASE_URL) return;
  try {
    const content = readFileSync(resolve(process.cwd(), ".env"), "utf8");
    for (const line of content.split(/\r?\n/)) {
      const match = line.match(/^\s*([\w.-]+)\s*=\s*(.*)?\s*$/);
      if (!match) continue;
      const key = match[1];
      let value = (match[2] ?? "").trim();
      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }
      if (process.env[key] === undefined) {
        process.env[key] = value;
      }
    }
  } catch {
    // Sin .env: Prisma usará DATABASE_URL del entorno o fallará con un error claro.
  }
}

async function promptHidden(question: string): Promise<string> {
  const rl = readline.createInterface({ input, output, terminal: true });
  const mutable = rl as unknown as {
    _writeToOutput?: (text: string) => void;
  };
  let muted = false;

  if (mutable._writeToOutput) {
    const original = mutable._writeToOutput.bind(rl);
    mutable._writeToOutput = (text: string) => {
      if (muted) return;
      original(text);
    };
  }

  output.write(question);
  muted = true;
  try {
    const answer = await rl.question("");
    return answer;
  } finally {
    muted = false;
    output.write("\n");
    rl.close();
  }
}

function fail(message: string): never {
  console.error(`\n✖ ${message}\n`);
  process.exit(1);
}

async function main() {
  loadEnvFile();

  if (!process.env.DATABASE_URL) {
    fail(
      "Falta DATABASE_URL. Copiá .env.example a .env y ejecutá primero `npm run db:push`.",
    );
  }

  const args = process.argv.slice(2).filter((arg) => !arg.startsWith("--"));
  const positionalEmail = args[0];
  const positionalName = args[1];

  const email = (process.env.ADMIN_EMAIL ?? positionalEmail ?? "").trim().toLowerCase();
  const name = (process.env.ADMIN_NAME ?? positionalName ?? "").trim();
  const isInteractive = Boolean(input.isTTY);

  let resolvedEmail = email;
  let resolvedName = name;
  let password = process.env.ADMIN_PASSWORD ?? "";

  if ((!resolvedEmail || !resolvedName || !password) && !isInteractive) {
    fail(
      "En un entorno no interactivo definí ADMIN_EMAIL, ADMIN_NAME y ADMIN_PASSWORD, o pasá email y nombre como argumentos.",
    );
  }

  const rl = readline.createInterface({ input, output, terminal: true });
  try {
    if (!resolvedEmail) {
      resolvedEmail = (await rl.question("Email del administrador: ")).trim();
    }
    if (!resolvedName) {
      resolvedName = (await rl.question("Nombre del administrador: ")).trim();
    }
  } finally {
    rl.close();
  }

  if (!resolvedEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(resolvedEmail)) {
    fail("El email no es válido.");
  }
  if (resolvedName.length < 2 || resolvedName.length > 60) {
    fail("El nombre debe tener entre 2 y 60 caracteres.");
  }

  if (!password) {
    if (!isInteractive) {
      fail("Falta ADMIN_PASSWORD.");
    }
    password = await promptHidden("Contraseña (mínimo 8, con letra y número): ");
    const repeat = await promptHidden("Repetir contraseña: ");
    if (password !== repeat) fail("Las contraseñas no coinciden.");
  }

  if (password.length < 8 || !/[A-Za-zÁÉÍÓÚáéíóúÑñ]/.test(password) || !/\d/.test(password)) {
    fail("La contraseña debe tener al menos 8 caracteres, una letra y un número.");
  }

  const prisma = new PrismaClient();
  try {
    const existing = await prisma.user.findUnique({
      where: { email: resolvedEmail },
      select: { id: true, role: true },
    });

    const passwordHash = await bcrypt.hash(password, 12);

    if (existing) {
      await prisma.user.update({
        where: { id: existing.id },
        data: {
          name: resolvedName,
          passwordHash,
          role: "ADMIN",
          suspended: false,
        },
      });
      console.log(
        `\n✔ Cuenta existente actualizada. ${resolvedEmail} ahora es ADMIN y la contraseña fue reemplazada.`,
      );
      console.log(`  Rol anterior: ${existing.role}`);
    } else {
      await prisma.user.create({
        data: {
          email: resolvedEmail,
          name: resolvedName,
          passwordHash,
          role: "ADMIN",
        },
      });
      console.log(`\n✔ Administrador creado: ${resolvedEmail}`);
    }

    console.log(
      `  Iniciá sesión en ${process.env.APP_URL ?? "http://localhost:3000"}/login\n`,
    );
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((error) => {
  console.error("\n✖ No se pudo crear el administrador.");
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
