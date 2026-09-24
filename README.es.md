# GourmetGo Backend — guía técnica

[English overview](README.md)

API REST de un proyecto académico para una aplicación Android de experiencias gastronómicas. Este repositorio contiene el backend de cuentas, experiencias, reservas, tickets QR y calificaciones.

## Configuración

Se requieren Node.js, npm, MySQL y credenciales de Gmail SMTP para los flujos de correo.

```sh
npm install
```

Crea un archivo `.env` en la raíz:

```dotenv
PORT=4000
DB_HOST=localhost
DB_PORT=3306
DB_USER=tu_usuario_mysql
DB_PASSWORD=tu_contrasena_mysql
DB_NAME=gourmetgo
JWT_SECRET=tu_clave_local_de_firma
EMAIL_USER=tu_cuenta_gmail
EMAIL_PASS=tu_google_app_password
```

El archivo [config/scriptllenado-creacion.sql](config/scriptllenado-creacion.sql) conserva cambios de esquema y datos de desarrollo. Incluye sentencias incompletas y operaciones de reinicio. Revisa y concilia su contenido con las consultas de [src/controllers](src/controllers) en una base desechable; todavía hace falta una migración inicial limpia.

Con la base preparada:

```sh
npm run dev
```

`npm start` ejecuta el servidor sin el monitor de desarrollo. El puerto predeterminado es `4000`; [`GET /db-test`](http://localhost:4000/db-test) devuelve `{"db":2}` cuando funciona la conexión a MySQL.

## Organización de la API

| Ruta base | Alcance |
| --- | --- |
| `/api/auth` | Registro, login, recuperación y cambio de contraseña |
| `/api/users` | Consulta y edición del perfil autenticado |
| `/api/experiences` | Catálogo, filtros y administración de experiencias |
| `/api/reservations` | Creación y consulta de reservas |
| `/api/ratings` | Calificaciones de reservas marcadas como asistidas |
| `/api/export` | Datos JSON de tickets y reservas |
| `POST /api/chatbot` | Respuestas fijas a preguntas admitidas |

Las rutas protegidas usan `Authorization: Bearer <token>`. Los métodos y middleware se definen en [src/routes](src/routes); los campos requeridos se validan en [validators.js](src/middlewares/validators.js).

Las contraseñas nuevas se procesan con bcrypt. Los correos usan Nodemailer y Gmail SMTP; las reservas generan un QR en base64. Los endpoints de exportación entregan JSON para que el cliente lo presente o transforme.

## Estado

Prototipo académico. Están pendientes la consolidación del esquema, la validación de consistencia de reservas y controles de acceso, y una suite de pruebas automatizadas. El cliente Android se mantiene fuera de este repositorio.

