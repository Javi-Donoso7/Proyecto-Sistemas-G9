PRAGMA foreign_keys = ON;

DROP TABLE IF EXISTS notificaciones;
DROP TABLE IF EXISTS asistencias;
DROP TABLE IF EXISTS pagos;
DROP TABLE IF EXISTS eventos;
DROP TABLE IF EXISTS entrenamientos;
DROP TABLE IF EXISTS jugadores;
DROP TABLE IF EXISTS apoderados;
DROP TABLE IF EXISTS categorias;

CREATE TABLE categorias (
  id_categoria INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL UNIQUE
);

CREATE TABLE apoderados (
  id_apoderado INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  telefono TEXT,
  correo TEXT UNIQUE
);

CREATE TABLE jugadores (
  id_jugador INTEGER PRIMARY KEY AUTOINCREMENT,
  nombre TEXT NOT NULL,
  apellido TEXT NOT NULL,
  fecha_nacimiento TEXT,
  id_categoria INTEGER NOT NULL,
  id_apoderado INTEGER NOT NULL,
  activo INTEGER NOT NULL DEFAULT 1,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria),
  FOREIGN KEY (id_apoderado) REFERENCES apoderados(id_apoderado)
);

CREATE TABLE pagos (
  id_pago INTEGER PRIMARY KEY AUTOINCREMENT,
  id_jugador INTEGER NOT NULL,
  mes INTEGER NOT NULL,
  anio INTEGER NOT NULL,
  monto INTEGER NOT NULL,
  fecha_pago TEXT,
  estado TEXT NOT NULL CHECK (estado IN ('Pagado','Pendiente')),
  FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador)
);

CREATE TABLE entrenamientos (
  id_entrenamiento INTEGER PRIMARY KEY AUTOINCREMENT,
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  lugar TEXT NOT NULL,
  id_categoria INTEGER NOT NULL,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE asistencias (
  id_asistencia INTEGER PRIMARY KEY AUTOINCREMENT,
  id_jugador INTEGER NOT NULL,
  id_entrenamiento INTEGER NOT NULL,
  asistio INTEGER NOT NULL CHECK (asistio IN (0,1)),
  FOREIGN KEY (id_jugador) REFERENCES jugadores(id_jugador),
  FOREIGN KEY (id_entrenamiento) REFERENCES entrenamientos(id_entrenamiento),
  UNIQUE(id_jugador, id_entrenamiento)
);

CREATE TABLE eventos (
  id_evento INTEGER PRIMARY KEY AUTOINCREMENT,
  titulo TEXT NOT NULL,
  tipo TEXT NOT NULL CHECK (tipo IN ('Partido','Entrenamiento','Reunion','Evento')),
  fecha TEXT NOT NULL,
  hora TEXT NOT NULL,
  lugar TEXT NOT NULL,
  id_categoria INTEGER,
  FOREIGN KEY (id_categoria) REFERENCES categorias(id_categoria)
);

CREATE TABLE notificaciones (
  id_notificacion INTEGER PRIMARY KEY AUTOINCREMENT,
  id_apoderado INTEGER,
  titulo TEXT NOT NULL,
  mensaje TEXT NOT NULL,
  tipo TEXT NOT NULL,
  fecha TEXT NOT NULL,
  leida INTEGER NOT NULL DEFAULT 0,
  FOREIGN KEY (id_apoderado) REFERENCES apoderados(id_apoderado)
);

INSERT INTO categorias (nombre) VALUES ('Infantil'), ('Juvenil'), ('Adulto');

INSERT INTO apoderados (nombre, apellido, telefono, correo) VALUES
('María','González','+56911111111','maria@demo.cl'),
('Carlos','Pérez','+56922222222','carlos@demo.cl'),
('Andrea','Rojas','+56933333333','andrea@demo.cl');

INSERT INTO jugadores (nombre, apellido, fecha_nacimiento, id_categoria, id_apoderado) VALUES
('Lucas','González','2014-03-12',1,1),
('Matías','Pérez','2011-08-20',2,2),
('Diego','Rojas','1999-04-05',3,3),
('Tomás','González','2013-11-18',1,1),
('Benjamín','Pérez','2010-05-14',2,2);

INSERT INTO pagos (id_jugador, mes, anio, monto, fecha_pago, estado) VALUES
(1,6,2026,15000,'2026-06-03','Pagado'),
(2,6,2026,15000,NULL,'Pendiente'),
(3,6,2026,15000,'2026-06-05','Pagado'),
(4,6,2026,15000,NULL,'Pendiente'),
(5,6,2026,15000,'2026-06-02','Pagado'),
(1,5,2026,15000,'2026-05-03','Pagado'),
(2,5,2026,15000,'2026-05-06','Pagado');

INSERT INTO entrenamientos (fecha, hora, lugar, id_categoria) VALUES
('2026-06-10','18:00','Cancha Municipal',1),
('2026-06-11','19:00','Cancha Municipal',2),
('2026-06-12','20:00','Cancha Municipal',3);

INSERT INTO asistencias (id_jugador, id_entrenamiento, asistio) VALUES
(1,1,1),(4,1,0),(2,2,1),(5,2,1),(3,3,1);

INSERT INTO eventos (titulo,tipo,fecha,hora,lugar,id_categoria) VALUES
('Entrenamiento Infantil','Entrenamiento','2026-06-10','18:00','Cancha Municipal',1),
('Partido Juvenil vs Cóndores','Partido','2026-06-15','10:00','Estadio Barrio Norte',2),
('Reunión de apoderados','Reunion','2026-06-18','19:30','Sede Club',NULL);

INSERT INTO notificaciones (id_apoderado,titulo,mensaje,tipo,fecha,leida) VALUES
(1,'Próximo entrenamiento','Infantil entrena el miércoles a las 18:00.','Entrenamiento','2026-06-09',0),
(2,'Cuota pendiente','Recuerda regularizar la cuota mensual de junio.','Pago','2026-06-09',0),
(3,'Partido programado','El equipo adulto jugará este fin de semana.','Partido','2026-06-09',1);
