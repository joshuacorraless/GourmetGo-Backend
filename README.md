<div align="center">

# GourmetGo Backend

<img src="https://img.shields.io/badge/Node.js-1F7A43?style=for-the-badge&logo=node.js&logoColor=white" alt="Node.js" />
<img src="https://img.shields.io/badge/Express-24292F?style=for-the-badge&logo=express&logoColor=white" alt="Express" />
<img src="https://img.shields.io/badge/MySQL-0F5B8C?style=for-the-badge&logo=mysql&logoColor=white" alt="MySQL" />
<img src="https://img.shields.io/badge/JWT-3B2E58?style=for-the-badge&logo=jsonwebtokens&logoColor=white" alt="JWT" />

API REST para la experiencia digital de reservas gastronómicas de GourmetGo.

</div>

## Visión Del Proyecto

GourmetGo Backend es el servicio central de una aplicación móvil Android orientada a la reserva de experiencias gastronómicas en restaurantes, talleres y eventos culinarios. El sistema organiza el flujo completo entre usuarios, chefs o restaurantes anfitriones, reservas, confirmaciones por correo, códigos QR de entrada y calificaciones posteriores al evento.

El proyecto fue desarrollado en contexto universitario para el curso de Requerimientos de Software, con enfoque en entregar una base funcional de backend que pudiera sostener una aplicación móvil real. La implementación prioriza una API clara, persistencia relacional, reglas de negocio explícitas y una separación sencilla entre rutas, controladores, middlewares y configuración.

## Identidad Técnica

| Capa | Decisión |
| --- | --- |
| Runtime | Node.js |
| Framework HTTP | Express 5 |
| Base de datos | MySQL mediante mysql2 con pool de conexiones |
| Seguridad | JSON Web Tokens, contraseñas con bcrypt, validación de entrada |
| Comunicación | Correos transaccionales con Nodemailer |
| Confirmación de reservas | QR en base64 generado desde el backend |
| Consumo principal | Aplicación Android creada en Android Studio |

## Capacidades Del Backend

| Área | Implementación |
| --- | --- |
| Autenticación | Registro diferenciado para usuarios y chefs, inicio de sesión, recuperación de contraseña y cambio obligatorio de contraseña temporal |
| Gestión de perfiles | Lectura y actualización del perfil autenticado con reglas distintas por rol |
| Experiencias | Creación, edición, consulta, filtrado y eliminación protegida con código de confirmación por correo |
| Reservas | Validación de cupo disponible, prevención de duplicados por nombre de entrada, generación de QR y envío de confirmación por email |
| Ratings | Calificación solo después de asistencia, control de una calificación por reserva y recálculo del promedio de la experiencia |
| Exportación | Endpoints JSON preparados para ticket de reserva y listado de reservas propias |
| Asistencia conversacional | Chatbot básico de respuestas guiadas para dudas frecuentes de la aplicación |

## Arquitectura Del Repositorio

```text
GourmetGo-Backend
  config
    db.js
    mail.js
    scriptllenado-creacion.sql
  src
    controllers
    middlewares
    routes
    utils
    index.js
```

La estructura separa responsabilidades de forma directa. Las rutas exponen el contrato HTTP, los controladores concentran la lógica de negocio, los middlewares resuelven autenticación, autorización y validación, y la carpeta de configuración centraliza la conexión a MySQL y el transporte de correo.

## Dominio Funcional

| Entidad | Propósito |
| --- | --- |
| users | Usuarios finales, chefs y restaurantes anfitriones |
| experiences | Eventos gastronómicos con capacidad, fecha, precio, ubicación, categoría, menú e imagen |
| reservations | Reservas asociadas a una experiencia, con datos de entrada, método de pago, estado y QR |
| ratings | Opiniones posteriores a la asistencia, conectadas a reservas reales |
| password_resets | Soporte para recuperación y cambio de contraseña temporal |
| exp_delete_codes | Confirmación temporal para eliminación segura de experiencias |
| faq | Base de preguntas frecuentes para soporte conversacional |

## Contrato HTTP Principal

| Método | Ruta | Uso |
| --- | --- | --- |
| POST | `/api/auth/register/user` | Registro de usuario final |
| POST | `/api/auth/register/chef` | Registro de chef o restaurante |
| POST | `/api/auth/login` | Autenticación y emisión de token JWT |
| POST | `/api/auth/forgot-password` | Envío de contraseña temporal por correo |
| PUT | `/api/auth/change-password` | Cambio de contraseña autenticado |
| GET | `/api/users/me` | Consulta del perfil autenticado |
| PUT | `/api/users/me` | Actualización del perfil autenticado |
| GET | `/api/experiences` | Listado público de experiencias |
| POST | `/api/experiences/filtrar` | Filtrado avanzado por provincia, categoría, precio, fecha y calificación |
| GET | `/api/experiences/:id` | Detalle de experiencia |
| GET | `/api/experiences/chef/:chefId` | Experiencias publicadas por un anfitrión |
| POST | `/api/experiences` | Creación de experiencia para rol CHEF |
| PUT | `/api/experiences/:id` | Actualización protegida de experiencia |
| POST | `/api/experiences/:id/request-delete` | Solicitud de código para eliminar experiencia |
| DELETE | `/api/experiences/:id` | Eliminación validada por código temporal |
| POST | `/api/reservations` | Creación de reserva con QR y correo de confirmación |
| GET | `/api/reservations/mine` | Reservas del usuario autenticado |
| GET | `/api/reservations/experience/:experience_id/users` | Lista y métricas de reservas por experiencia |
| POST | `/api/ratings` | Registro de calificación |
| GET | `/api/ratings/experience/:id` | Calificaciones de una experiencia |
| GET | `/api/export/ticket/:id` | Datos estructurados para ticket |
| GET | `/api/export/reservations/mine` | Datos estructurados para exportación de reservas |
| POST | `/api/chatbot` | Respuesta guiada para preguntas frecuentes |

## Reglas De Negocio Destacadas

| Regla | Resultado |
| --- | --- |
| Las contraseñas se almacenan con hash bcrypt | La base de datos no conserva credenciales en texto plano |
| Los endpoints privados requieren token Bearer | El backend identifica usuario y rol desde el JWT |
| Solo un anfitrión CHEF puede crear o editar experiencias | La administración de eventos queda aislada del usuario final |
| Una experiencia agotada no puede recibir más reservas | El cupo se protege antes de insertar la reserva |
| Cada reserva genera un QR único en base64 | La app puede mostrar o exportar el comprobante sin depender de archivos externos |
| La eliminación de experiencias requiere código temporal por correo | Se agrega una fricción de seguridad antes de borrar contenido operativo |
| Una calificación exige reserva asistida | Las reseñas se vinculan a participación real |

## Puesta En Marcha Local

Instalar dependencias.

```bash
npm install
```

Crear un archivo `.env` con las variables de ejecución.

```env
PORT=4000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=tu_password
DB_NAME=gourmetgo
DB_PORT=3306
JWT_SECRET=clave_segura_para_desarrollo
EMAIL_USER=correo@gmail.com
EMAIL_PASS=app_password_de_google
```

Preparar la base de datos con el script incluido.

```bash
mysql -u root -p < config/scriptllenado-creacion.sql
```

Ejecutar el servidor en modo desarrollo.

```bash
npm run dev
```

Ejecutar el servidor en modo estándar.

```bash
npm start
```

## Calidad Y Criterios De Implementación

| Criterio | Aplicación |
| --- | --- |
| Validación temprana | express-validator protege el contrato de entrada antes de llegar al controlador |
| Separación por dominio | Cada módulo agrupa rutas y controladores por responsabilidad funcional |
| Persistencia relacional | MySQL modela usuarios, experiencias, reservas, ratings y códigos temporales |
| Seguridad práctica | JWT, bcrypt y códigos de confirmación cubren los flujos críticos del sistema |
| Integración móvil | Las respuestas JSON están pensadas para consumo directo desde Android |

## Nota Académica

Este repositorio corresponde a una entrega universitaria, pero fue estructurado como un servicio backend presentable, mantenible y conectado a necesidades reales de producto. GourmetGo funciona como una demostración de diseño de API, modelado relacional, autenticación, reglas de negocio y soporte a una aplicación móvil orientada a reservas.

<div align="center">

Backend diseñado para convertir una experiencia gastronómica en un flujo digital completo.

</div>
