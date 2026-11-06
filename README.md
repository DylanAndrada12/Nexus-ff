# NEXUS FF

Plataforma de torneos de Free Fire en Argentina. Los torneos se publican con su fecha, modalidad, cupos, premios y un grupo de WhatsApp exclusivo. La inscripción se coordina en ese grupo y la organización confirma los equipos desde el panel administrativo.

## Desarrollo

```bash
npm install
npm run db:generate
npm run db:push
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## Comandos

```bash
npm run dev            # Servidor de desarrollo
npm run build          # Build de producción
npm run typecheck      # Verificación de tipos
npm run lint           # ESLint
npm run db:studio      # Prisma Studio
npm run admin:create   # Crear usuario administrador
```

## Variables de entorno

Copiá `.env.example` a `.env`. Las variables principales son `DATABASE_URL`, `SESSION_SECRET` y `APP_URL`. El correo es opcional (`RESEND_API_KEY`, `EMAIL_FROM`).

## Documentación

El estado completo del proyecto, la arquitectura y las tareas pendientes están en [`PROJECT_STATUS.md`](./PROJECT_STATUS.md).
