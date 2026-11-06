# PROJECT_STATUS.md — NEXUS FF

> Actualizado el 2026-11-06. Usá este archivo como contexto de sesión en cada continuación del proyecto.

---

## 1. Resumen del proyecto

**NEXUS FF** es una plataforma web para la gestión de torneos de Free Fire en Argentina.

Los torneos se publican con fecha, modalidad, cupos, premios y un enlace propio de WhatsApp. La inscripción se coordina en ese grupo y la organización confirma manualmente cada equipo desde el panel administrativo. Los capitanes administran sus equipos y plantillas; los administradores gestionan torneos, inscripciones, salas, resultados, rankings y usuarios.

No hay pagos, checkout ni integraciones de cobro dentro de la plataforma.

---

## 2. Tecnologías utilizadas

| Capa | Tecnología |
|------|-----------|
| Framework | **Next.js 16.4.5** (App Router, React 19) |
| Lenguaje | **TypeScript 5** |
| Estilos | **Tailwind CSS 4** |
| Base de datos | **SQLite** (dev) vía **Prisma 6** |
| Autenticación | Sesiones propias con **jose** (JWT) + bcryptjs |
| Iconos | **lucide-react** |
| Validación | **Zod 4** |
| ORM | **Prisma Client 6** |
| Scripts | **tsx** |
| Linter | ESLint 9 |

> [!NOTE]
> No hay librerías UI externas (shadcn, MUI, etc.). Los componentes son 100% propios.
> Para producción se recomienda migrar a PostgreSQL (ver comentario en `prisma/schema.prisma`).

---

## 3. Arquitectura existente

```
src/
├── actions/          # Server Actions (Next.js) — lógica de negocio
│   ├── admin.ts      # Torneos, salas, resultados, inscripciones, usuarios, configuración
│   ├── auth.ts       # Login, registro, recuperar contraseña
│   ├── notifications.ts
│   ├── profile.ts
│   ├── registrations.ts  # Canje de códigos de torneos privados
│   ├── support.ts
│   └── teams.ts      # CRUD de equipos y miembros
│
├── app/
│   ├── (auth)/       # Login, registro, recuperar, restablecer contraseña
│   ├── (public)/     # Landing, torneos, equipos, ranking, resultados
│   ├── admin/        # Panel administrativo (protegido por rol ADMIN)
│   ├── panel/        # Panel de capitanes (protegido por autenticación)
│   └── api/
│       ├── admin/    # Exportación CSV de inscripciones
│       ├── health/
│       └── uploads/  # Subida de imágenes
│
├── components/
│   ├── admin/        # TournamentForm (crear/editar torneo)
│   ├── forms/        # ActionForm, AuthForms, ConfirmButton, ImageUploadField, SubmitButton
│   ├── panel/        # PanelNav
│   ├── ui.tsx        # Componentes compartidos (Badge, PageHeader, EmptyState, etc.)
│   ├── whatsapp-registration.tsx  # Modal de inscripción por WhatsApp
│   ├── ranking-table.tsx
│   ├── site-header.tsx / site-footer.tsx
│   └── mobile-menu.tsx
│
└── lib/
    ├── auth/         # DAL (getCurrentUser, requireUser, requireAdmin) + session
    ├── queries/      # Consultas DB por dominio (admin, captain, public)
    ├── tournaments.ts    # Ocupación, ventana de inscripción, puntos, premios
    ├── team-eligibility.ts
    ├── notifications.ts
    ├── audit.ts
    ├── email.ts
    ├── rate-limit.ts
    ├── rankings.ts
    ├── validation.ts
    ├── constants.ts
    ├── format.ts
    ├── env.ts
    └── slug.ts
```

### Modelos de base de datos (SQLite/Prisma)

- `User` → `Team` → `TeamMember`
- `Tournament` → `Registration`
- `Tournament` → `Room` (sala con código y contraseña)
- `Tournament` → `TournamentResult`
- `TournamentInvite` (acceso a torneos privados)
- `Notification`, `AuditLog`, `Setting`, `Announcement`, `SupportMessage`
- `PasswordResetToken`, `EmailVerificationToken`

`Tournament.whatsappUrl` guarda el enlace del grupo de WhatsApp exclusivo de cada torneo.

### Roles de usuario

- `PLAYER` — usuario base
- `CAPTAIN` — puede crear y administrar equipos
- `ADMIN` — acceso total al panel de administración

---

## 4. Funcionalidades implementadas ✅

### Autenticación
- [x] Registro de usuario con validación
- [x] Login / logout con sesión JWT
- [x] Recuperación de contraseña (token por email)
- [x] Restablecimiento de contraseña (`/restablecer/[token]`)

### Pública
- [x] Landing page (hero, torneos, campeones, ranking, resultados, contacto)
- [x] Listado y búsqueda de torneos (`/torneos?q=`)
- [x] Detalle de torneo con modal “¡Inscribite por WhatsApp!”
- [x] Mensaje “La inscripción todavía no está disponible” cuando el torneo no tiene enlace
- [x] Perfil público de equipo (`/equipos/[id]`)
- [x] Ranking público (`/ranking`)
- [x] Resultados públicos (`/resultados`)

### Panel de capitanes (`/panel`)
- [x] Dashboard del capitán
- [x] CRUD de equipos y gestión de miembros (titulares y suplentes)
- [x] Listado de torneos disponibles (`/panel/torneos`)
- [x] Canje de código de acceso a torneo privado
- [x] Vista de inscripciones confirmadas por la organización
- [x] Acceso a salas cuando se publican
- [x] Notificaciones
- [x] Perfil de usuario
- [x] Historial de participaciones

### Panel administrativo (`/admin`)
- [x] Resumen operativo (inscripciones, torneos, equipos, usuarios, mensajes)
- [x] CRUD completo de torneos
- [x] Configuración del enlace de WhatsApp por torneo con validación de dominio
- [x] Confirmación manual de equipos desde el detalle del torneo
- [x] Validación de plantilla, modalidad, UID repetidos y suspensión al confirmar
- [x] Cancelación de inscripciones con liberación de cupo
- [x] Sala de torneo (crear/editar/publicar código y contraseña)
- [x] Carga y publicación de resultados por torneo
- [x] Rankings automáticos por resultados publicados
- [x] Gestión de usuarios y equipos
- [x] Mensajes de soporte
- [x] Log de auditoría
- [x] Configuración del sitio (contacto, redes, horarios)
- [x] Invitaciones a torneos privados
- [x] Anuncios en banner del sitio
- [x] Exportación CSV de inscripciones

### Infraestructura
- [x] API de uploads de imágenes (`/api/uploads`)
- [x] Health check (`/api/health`)
- [x] Rate limiting en memoria (sin Redis, apto para instancia única)
- [x] Sistema de notificaciones internas
- [x] Audit logging
- [x] Email (configurado por variables de entorno)
- [x] Script de creación de admin (`npm run admin:create`)

---

## 5. Funcionalidades parcialmente implementadas ⚠️

| Área | Estado |
|------|--------|
| **Email transaccional** | `sendEmail` está listo pero depende de configurar un proveedor en `.env`. |
| **Multi-ronda (MULTI_ROUND)** | El esquema y las constantes lo contemplan; no hay UI diferenciada para múltiples rondas. |
| **Notificaciones por email** | Las notificaciones internas funcionan; el envío por email depende del proveedor configurado. |

---

## 6. Funcionalidades pendientes / no implementadas ❌

| Funcionalidad | Notas |
|--------------|-------|
| **Verificación de email automática** | Existe el modelo y la pantalla, pero el registro no exige verificación. |
| **2FA** | No implementado. |
| **Bracket visual** | No hay representación gráfica de llaves. |
| **Chat o foro interno** | La comunicación ocurre en los grupos de WhatsApp de cada torneo. |
| **Tests automatizados** | No hay tests unitarios ni de integración. |

---

## 7. Problemas detectados / consideraciones técnicas 🔴

| # | Problema | Impacto |
|---|---------|---------|
| 1 | **SQLite en producción** no es viable para acceso concurrente alto. Migrar a PostgreSQL antes de lanzar. | Alto |
| 2 | **Rate limiting en memoria** se reinicia con cada deploy/restart. No funciona en multi-instancia. | Medio |
| 3 | **Verificación de email opcional** al registrarse. | Medio |
| 4 | **WhatsApp manual** depende de que la organización confirme los cupos a tiempo. | Medio |

---

## 8. Cómo ejecutar el proyecto

### Requisitos previos
- Node.js 20+
- npm (incluido con Node)

### Instalación
```bash
# Instalar dependencias
npm install

# Generar el cliente de Prisma
npm run db:generate

# Aplicar el esquema a la base de datos SQLite
npm run db:push

# Crear el primer usuario administrador
npm run admin:create
```

### Variables de entorno
Copiá `.env.example` a `.env` y completá:

```env
DATABASE_URL="file:./dev.db"
SESSION_SECRET="un-secreto-largo-y-random"
APP_URL="http://localhost:3000"

# Email (opcional)
RESEND_API_KEY=""
EMAIL_FROM="NEXUS FF <no-reply@nexusff.com>"
```

### Ejecutar en desarrollo
```bash
npm run dev
# → http://localhost:3000
```

### Otros comandos útiles
```bash
npm run build          # Build de producción
npm run typecheck      # Verificar tipos TypeScript
npm run lint           # Ejecutar ESLint
npm run db:studio      # Abrir Prisma Studio
npm run admin:create   # Crear usuario administrador
```

---

## 9. Flujo de inscripción por WhatsApp

1. El administrador crea o edita un torneo y carga el enlace del grupo en **WhatsApp**.
2. El enlace debe ser `https://chat.whatsapp.com/...`; si está vacío, el torneo se publica sin inscripción disponible.
3. En la página pública del torneo, el botón **Inscribirse** abre el modal **“¡Inscribite por WhatsApp!”** con el enlace de ese torneo.
4. El equipo entra al grupo y coordina con la organización.
5. Un administrador agrega el equipo como confirmado desde **Admin → Torneo → Inscripciones**.
6. El capitán recibe una notificación y ve la inscripción confirmada en su panel.

---

## 10. Próximas tareas recomendadas (prioridad sugerida)

### Alta prioridad
1. **Verificación de email** al registrarse.
2. **Tests básicos** de las Server Actions de inscripciones y equipos.
3. **Configurar proveedor de email** para recuperación de contraseña en producción.

### Media prioridad
4. **Open Graph por torneo** con imágenes propias.
5. **Bracket visual** para torneos de eliminación.
6. **Migración a PostgreSQL** antes de producción.

### Baja prioridad / largo plazo
7. **Redis para rate limiting** si se pasa a múltiples instancias.
8. **2FA** para administradores.

---

*Este archivo debe actualizarse cada vez que se complete o descarte una funcionalidad.*
