<div align="center">

# GourmetGo Backend

**Backend REST para reservas gastronómicas móviles**

<p>
  <img src="https://img.shields.io/badge/Node.js-1F7A43?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
  <img src="https://img.shields.io/badge/Express-24292F?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
  <img src="https://img.shields.io/badge/MySQL-0F5B8C?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
  <img src="https://img.shields.io/badge/JWT-2F2A45?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />
  <img src="https://img.shields.io/badge/Nodemailer-C4473A?style=for-the-badge&logo=gmail&logoColor=white" alt="Nodemailer" />
  <img src="https://img.shields.io/badge/Android-3DDC84?style=for-the-badge&logo=android&logoColor=0B172A" alt="Android" />
</p>

<sub>API modular para autenticación, experiencias, reservas, tickets QR y calificaciones verificadas.</sub>

</div>

<br />

<table>
  <tr>
    <td><strong>Runtime</strong></td>
    <td>Node.js</td>
    <td><strong>Framework</strong></td>
    <td>Express 5</td>
  </tr>
  <tr>
    <td><strong>Database</strong></td>
    <td>MySQL</td>
    <td><strong>Security</strong></td>
    <td>JWT, bcrypt, roles</td>
  </tr>
  <tr>
    <td><strong>Client</strong></td>
    <td>Android</td>
    <td><strong>Messaging</strong></td>
    <td>Nodemailer, Gmail SMTP</td>
  </tr>
</table>

## Producto

GourmetGo conecta usuarios, chefs y restaurantes alrededor de experiencias culinarias reservables desde una aplicación Android. Este backend sostiene el flujo operativo completo: registro, catálogo, filtros, reserva, confirmación por correo, ticket QR, asistencia y calificación posterior.

Proyecto universitario desarrollado con criterios de backend productivo: contratos HTTP simples, modelo relacional, autenticación por roles y separación directa entre rutas, controladores, middlewares y configuración.

## Superficie funcional

| Flujo | Resultado |
| --- | --- |
| Identidad | Registro diferenciado para usuarios y anfitriones, login JWT y recuperación de contraseña temporal |
| Experiencias | Catálogo público, filtros, detalle, administración por anfitrión y eliminación protegida por código |
| Reservas | Control de cupo, prevención de duplicados, generación de QR y correo transaccional |
| Perfil | Lectura y actualización del usuario autenticado con reglas por rol |
| Calificaciones | Reseñas habilitadas solo para reservas asistidas y promedio actualizado por experiencia |
| Exportación | Payloads JSON para ticket y reservas propias |
| Soporte | Chatbot determinístico para preguntas frecuentes de la app |

## Arquitectura

```text
config
  db.js                       pool MySQL
  mail.js                     transporte SMTP
  scriptllenado-creacion.sql  esquema y datos base

src
  controllers                 reglas de negocio
  middlewares                 JWT, roles, validación, errores
  routes                      contrato HTTP por dominio
  utils                       generación de QR
  index.js                    arranque de Express
```

La organización evita capas innecesarias y mantiene cada responsabilidad visible. Las rutas definen la superficie pública, los controladores concentran los flujos de negocio, los middlewares protegen el acceso y la configuración desacopla infraestructura de ejecución.

## Modelo de dominio

| Entidad | Responsabilidad |
| --- | --- |
| `users` | Perfiles de usuarios, chefs y restaurantes |
| `experiences` | Eventos gastronómicos con cupo, precio, ubicación, menú, imagen y estado |
| `reservations` | Reservas, método de pago, estado operativo y ticket QR |
| `ratings` | Calificaciones vinculadas a reservas asistidas |
| `exp_delete_codes` | Códigos de confirmación para eliminación de experiencias |

## API principal

| Dominio | Alcance |
| --- | --- |
| Auth | Registro de usuarios y anfitriones, login, recuperación y cambio de contraseña |
| Users | Consulta y edición del perfil autenticado |
| Experiences | Listado, detalle, filtrado, creación, edición y eliminación protegida |
| Reservations | Creación de reservas, historial propio, asistentes y métricas por experiencia |
| Ratings | Registro y consulta de calificaciones asociadas a asistencia |
| Export | Datos estructurados para tickets y reservas |
| Assistant | Respuestas guiadas para dudas frecuentes |

## Decisiones de dominio

| Decisión | Impacto |
| --- | --- |
| Autenticación con Bearer Token | Cada operación privada conserva contexto de usuario y rol |
| Hash de contraseñas con bcrypt | Las credenciales no se almacenan en texto plano |
| Administración limitada a `CHEF` | La operación de experiencias queda separada del consumo del usuario final |
| Reserva contra cupo disponible | La API bloquea sobreventa antes de persistir la reserva |
| QR embebido en base64 | El cliente móvil recibe un ticket portable sin depender de archivos externos |
| Eliminación con código temporal | Las acciones destructivas agregan una confirmación por correo |
| Rating posterior a asistencia | La reputación se construye desde participación verificada |

## Ejecución local

```bash
npm install
```

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gourmetgo
DB_PORT=3306
JWT_SECRET=clave_local_de_desarrollo
EMAIL_USER=tu_cuenta_gmail
EMAIL_PASS=tu_google_app_password
```

```bash
mysql -u root -p < config/scriptllenado-creacion.sql
npm run dev
```

## Alcance

GourmetGo es una base backend compacta para operar reservas gastronómicas desde una experiencia móvil. El repositorio demuestra diseño de API, persistencia relacional, seguridad práctica y reglas de negocio aplicadas a un producto académico con presentación profesional.
