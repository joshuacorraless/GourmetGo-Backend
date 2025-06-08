CREATE DATABASE IF NOT EXISTS gourmetgo;
USE gourmetgo;

CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  nombre VARCHAR(100) NOT NULL,
  correo VARCHAR(150) NOT NULL UNIQUE,
  contrasena VARCHAR(255) NOT NULL,
  telefon VARCHAR(10),
  identificacion VARCHAR(9),
  foto_url VARCHAR(255),
  preferencias TEXT,
  creado_en TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* nuevo cambio hoy 6/7/2025 daniela goat*/
ALTER TABLE users
  ADD COLUMN contacto      VARCHAR(120) NULL,
  ADD COLUMN ubicacion     VARCHAR(255) NULL,
  ADD COLUMN tipo_cocina   VARCHAR(80)  NULL;



ALTER TABLE users
ADD COLUMN rol ENUM('USER','CHEF','RESTAURANT') DEFAULT 'USER';

SELECT * FROM USERS;
UPDATE users
SET    rol = 'CHEF'
WHERE  correo = 'corralesjosh39@gmail.com';


ALTER TABLE users
  CHANGE COLUMN telefon  telefono  CHAR(8);

ALTER TABLE experiences
  MODIFY COLUMN ubicacion VARCHAR(500);   -- o bien  TEXT


CREATE TABLE experiences (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  chef_id     INT NOT NULL,
  nombre      VARCHAR(120) NOT NULL,
  descripcion TEXT NOT NULL,
  fecha_hora  DATETIME NOT NULL,
  ubicacion   VARCHAR(255) NOT NULL,
  capacidad   INT NOT NULL,
  precio      DECIMAL(10,2) NOT NULL,
  duracion_h  DECIMAL(4,2) NOT NULL,
  categoria   VARCHAR(60),
  estado      ENUM('Activo','Agotado','Próximamente') DEFAULT 'Próximamente',
  menu_text   TEXT,
  menu_img    VARCHAR(255),
  requisitos  TEXT,
  FOREIGN KEY (chef_id) REFERENCES users(id)
);


ALTER TABLE experiences
ADD COLUMN `img_url` VARCHAR(500) NULL DEFAULT NULL AFTER `requisitos`,
ADD COLUMN `calificacion` DOUBLE NULL DEFAULT NULL AFTER `img_url`,
ADD COLUMN `Provincia` VARCHAR(500) NULL DEFAULT NULL AFTER `calificacion`;


USE gourmetgo;

/* ───── Inserciones de experiencias de prueba ───── */
INSERT INTO experiences
  (host_id, nombre, descripcion, fecha_hora, ubicacion,
   capacidad, precio, duracion_h, categoria, requisitos, estado)
VALUES
  /* 1 */
  (2,
   'Ruta de Quesos',
   'Tour gastronómico por fincas lecheras con degustación de quesos artesanales.',
   '2025-07-05 16:00:00',
   'https://goo.gl/maps/8dT3C1hJkM9MGz3w9',
   25,
   25000.00,
   2.5,
   'Tour',
   'Zapatos cómodos y abrigo ligero',
   'Próximamente'),

  /* 2 */
  (2,
   'Cena Sensorial: Sabores a Ciegas',
   'Menú de cinco tiempos degustado con los ojos vendados para realzar aroma y textura.',
   '2025-07-12 19:00:00',
   'https://www.google.com/maps/place/9.935063,-84.079499',
   30,
   45000.00,
   3.0,
   'Experiencia',
   'Reportar alergias 48 h antes',
   'Próximamente'),

  /* 3 */
  (2,
   'Taller de Sushi para Principiantes',
   'Aprende técnicas básicas de sushi, preparación de arroz y elaboración de makis y nigiris.',
   '2025-07-20 15:00:00',
   'https://goo.gl/maps/P7Yxe3GjG2QUpZgA8',
   20,
   30000.00,
   3.0,
   'Taller',
   'Llevar delantal propio',
   'Próximamente');


SELECT id, nombre, estado FROM experiences;
select * from reservations;
ALTER TABLE reservations
  MODIFY COLUMN codigo_qr TEXT;

UPDATE reservations SET estado = 'Asistido' WHERE id = 2;

select * from experiences;

ALTER TABLE experiences
  CHANGE COLUMN chef_id host_id INT NOT NULL;

UPDATE experiences
SET ubicacion = 'https://www.google.com/maps/place/Costa+Rica+Institute+of+Technology/@9.8554672,-83.9149992,713m/data=!3m2!1e3!4b1!4m6!3m5!1s0x8fa0dff29640d73b:0xc11e19b85da8947f!8m2!3d9.8554619!4d-83.9124243!16zL20vMDd3N2x2?entry=ttu&g_ep=EgoyMDI1MDUyOC4wIKXMDSoASAFQAw%3D%3D'
WHERE id = 2;


CREATE TABLE reservations (
  id              INT AUTO_INCREMENT PRIMARY KEY,
  user_id         INT,
  experience_id   INT,
  nombre_entrada  VARCHAR(100),
  correo_entrada  VARCHAR(150),
  telefono_entry  CHAR(8),
  cantidad        INT,
  metodo_pago     ENUM('Lugar','Transferencia'),
  codigo_qr       VARCHAR(255),
  estado          ENUM('Confirmada','Cancelada','Asistido') DEFAULT 'Confirmada',
  creado_en       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id),
  FOREIGN KEY (experience_id) REFERENCES experiences(id)
);

CREATE TABLE ratings (
  id             INT AUTO_INCREMENT PRIMARY KEY,
  reservation_id INT,
  puntuacion     TINYINT CHECK (puntuacion BETWEEN 1 AND 5),
  comentario     TEXT,
  imagen_url     VARCHAR(255),
  creado_en      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (reservation_id) REFERENCES reservations(id)
);

CREATE TABLE password_resets (
  id          INT AUTO_INCREMENT PRIMARY KEY,
  user_id     INT,
  temp_pass   VARCHAR(255),
  expires_at  DATETIME,
  FOREIGN KEY (user_id) REFERENCES users(id)
);

CREATE TABLE faq (
  id INT AUTO_INCREMENT PRIMARY KEY,
  pregunta VARCHAR(255),
  respuesta TEXT
);

CREATE TABLE exp_delete_codes (
  experience_id INT,
  code          CHAR(6),
  expires_at    DATETIME,
  PRIMARY KEY (experience_id),
  FOREIGN KEY (experience_id) REFERENCES experiences(id) ON DELETE CASCADE
);






/* ───────────────────────────────────────── */
/* 1) Limpia todas las tablas dependientes   */
/* ───────────────────────────────────────── */
SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE ratings;
TRUNCATE TABLE reservations;
TRUNCATE TABLE exp_delete_codes;
TRUNCATE TABLE experiences;
TRUNCATE TABLE faq;
TRUNCATE TABLE users;

SET FOREIGN_KEY_CHECKS = 1;

/* ───────────────────────────────────────── */
/* 2) Usuario único: Joshua (rol CHEF)       */
/*    Password:  abcABC1234.                */
/* ───────────────────────────────────────── */
DELETE FROM users WHERE correo = 'corralesjosh39@gmail.com'; 
INSERT INTO users (nombre, correo, contrasena, rol, must_change_pw) VALUES ('Joshua','corralesjosh39@gmail.com','$2b$10$Gcze9bhgU1rePNwBf2UlE.ZQt3oBvz0gqcIKrazOEC/g6EwCBdDZC','CHEF',0);

INSERT INTO users
  (nombre, correo, contrasena, rol, must_change_pw)
VALUES
  ('Joshua', 'corralesjosh39@gmail.com',
   '$2b$10$Gcze9bhgU1rePNwBf2UlE.ZQt3oBvz0gqcIKrazOEC/g6EwCBdDZC',  -- hash de abcABC1234.
   'CHEF', 0);

/* Guarda su id para las experiencias */
SET @HOST := LAST_INSERT_ID();

/* ───────────────────────────────────────── */
/* 3) Tres experiencias requeridas           */
/* ───────────────────────────────────────── */
INSERT INTO experiences
  (host_id, nombre, descripcion, fecha_hora, ubicacion,
   capacidad, precio, duracion_h, categoria, requisitos, estado)
VALUES
  /* 1 */
  (@HOST, 'Cena Sensorial: Sabores a Ciegas',
   'Menú de cinco tiempos degustado con los ojos vendados, guiado por aromas y texturas.',
   '2025-04-25 19:00:00',
   'https://www.google.com/maps/place/Costa+Rica+Institute+of+Technology/@9.8554672,-83.9149992,713m/data=!…',
   30, 45000, 2.5, 'Experiencia', 'Reportar alergias 48 h antes', 'Próximamente'),

  /* 2 */
  (@HOST, 'Taller de Sushi para Principiantes',
   'Aprende técnicas básicas de sushi, preparación de arroz, makis y nigiris.',
   '2025-05-02 15:00:00',
   'https://www.google.com/maps/place/Costa+Rica+Institute+of+Technology/@9.8554672,-83.9149992,713m/data=!…',
   50, 30000, 3.0, 'Taller', 'Llevar delantal propio', 'Activo'),

  /* 3 */
  (@HOST, 'Ruta de Sabores de la Calle',
   'Tour guiado por cinco estaciones de comida callejera con chefs invitados.',
   '2025-05-11 12:00:00',
   'https://www.google.com/maps/place/Costa+Rica+Institute+of+Technology/@9.8554672,-83.9149992,713m/data=!…',
   20, 35000, 2.0, 'Tour', 'Calzado cómodo', 'Agotado');
   
UPDATE experiences
SET ubicacion = 'https://maps.app.goo.gl/kfaeGJLuLXzaphMCA'
WHERE id = 1;   -- ajusta id

UPDATE experiences
SET ubicacion = 'https://maps.app.goo.gl/sKJQYYhdpav3oKgw8'
WHERE id = 2;

UPDATE experiences
SET ubicacion = 'https://maps.app.goo.gl/SYCZPgREx1JudPHM9'
WHERE id = 3;



select * from experiences;