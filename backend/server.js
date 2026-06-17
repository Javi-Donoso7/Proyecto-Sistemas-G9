import express from 'express';
import cors from 'cors';
import Database from 'better-sqlite3';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbPath = path.join(__dirname, 'jugada_maestra.sqlite');
const schemaPath = path.join(__dirname, '..', 'db', 'schema.sql');

if (!fs.existsSync(dbPath)) {
  const dbInit = new Database(dbPath);
  dbInit.exec(fs.readFileSync(schemaPath, 'utf8'));
  dbInit.close();
}

const db = new Database(dbPath);
db.pragma('foreign_keys = ON');

const app = express();
app.use(cors());
app.use(express.json());

const ok = (data) => ({ ok: true, data });

app.get('/api/health', (_req, res) => res.json(ok({ status: 'online' })));

app.get('/api/dashboard', (_req, res) => {
  const totalJugadores = db.prepare('SELECT COUNT(*) total FROM jugadores WHERE activo = 1').get().total;
  const pagos = db.prepare("SELECT estado, COUNT(*) cantidad, COALESCE(SUM(monto),0) monto FROM pagos WHERE mes = 6 AND anio = 2026 GROUP BY estado").all();
  const alDia = pagos.find(p => p.estado === 'Pagado')?.cantidad ?? 0;
  const morosos = pagos.find(p => p.estado === 'Pendiente')?.cantidad ?? 0;
  const ingresosMes = pagos.find(p => p.estado === 'Pagado')?.monto ?? 0;
  const ingresosMesAnterior = db.prepare("SELECT COALESCE(SUM(monto),0) total FROM pagos WHERE mes = 5 AND anio = 2026 AND estado = 'Pagado'").get().total;
  const asistencia = db.prepare(`
    SELECT c.nombre categoria, ROUND(AVG(a.asistio) * 100, 1) promedio
    FROM asistencias a
    JOIN jugadores j ON j.id_jugador = a.id_jugador
    JOIN categorias c ON c.id_categoria = j.id_categoria
    GROUP BY c.nombre
  `).all();
  res.json(ok({ totalJugadores, alDia, morosos, ingresosMes, ingresosMesAnterior, asistencia }));
});

app.get('/api/jugadores', (_req, res) => {
  const rows = db.prepare(`
    SELECT j.id_jugador, j.nombre, j.apellido, j.fecha_nacimiento, c.nombre categoria,
           a.nombre || ' ' || a.apellido apoderado, a.telefono,
           COALESCE((SELECT estado FROM pagos p WHERE p.id_jugador=j.id_jugador AND p.mes=6 AND p.anio=2026 LIMIT 1),'Pendiente') estado_pago
    FROM jugadores j
    JOIN categorias c ON c.id_categoria = j.id_categoria
    JOIN apoderados a ON a.id_apoderado = j.id_apoderado
    WHERE j.activo = 1
    ORDER BY j.apellido, j.nombre
  `).all();
  res.json(ok(rows));
});

app.post('/api/jugadores', (req, res) => {
  const { nombre, apellido, fecha_nacimiento, id_categoria, id_apoderado } = req.body;
  if (!nombre || !apellido || !id_categoria || !id_apoderado) return res.status(400).json({ ok:false, error:'Faltan datos obligatorios' });
  const info = db.prepare(`INSERT INTO jugadores (nombre, apellido, fecha_nacimiento, id_categoria, id_apoderado) VALUES (?,?,?,?,?)`)
    .run(nombre, apellido, fecha_nacimiento ?? null, id_categoria, id_apoderado);
  res.status(201).json(ok({ id_jugador: info.lastInsertRowid }));
});

app.get('/api/categorias', (_req, res) => res.json(ok(db.prepare('SELECT * FROM categorias').all())));
app.get('/api/apoderados', (_req, res) => res.json(ok(db.prepare('SELECT * FROM apoderados').all())));

app.get('/api/pagos', (_req, res) => {
  const rows = db.prepare(`
    SELECT p.*, j.nombre || ' ' || j.apellido jugador, c.nombre categoria
    FROM pagos p
    JOIN jugadores j ON j.id_jugador = p.id_jugador
    JOIN categorias c ON c.id_categoria = j.id_categoria
    ORDER BY p.anio DESC, p.mes DESC
  `).all();
  res.json(ok(rows));
});

app.post('/api/pagos', (req, res) => {
  const { id_jugador, mes, anio, monto, fecha_pago, estado } = req.body;
  if (!id_jugador || !mes || !anio || !monto || !estado) return res.status(400).json({ ok:false, error:'Faltan datos obligatorios' });
  const info = db.prepare(`INSERT INTO pagos (id_jugador, mes, anio, monto, fecha_pago, estado) VALUES (?,?,?,?,?,?)`)
    .run(id_jugador, mes, anio, monto, fecha_pago || null, estado);
  res.status(201).json(ok({ id_pago: info.lastInsertRowid }));
});


app.post('/api/pagos/pagar-cuota', (req, res) => {
  const { id_pago } = req.body;
  if (!id_pago) return res.status(400).json({ ok:false, error:'Falta id_pago' });

  const pago = db.prepare('SELECT * FROM pagos WHERE id_pago = ?').get(id_pago);
  if (!pago) return res.status(404).json({ ok:false, error:'Pago no encontrado' });
  if (pago.estado === 'Pagado') return res.json(ok({ message:'La cuota ya estaba pagada', id_pago }));

  const hoy = new Date().toISOString().slice(0,10);
  db.prepare(`UPDATE pagos SET estado = 'Pagado', fecha_pago = ? WHERE id_pago = ?`).run(hoy, id_pago);

  const apoderado = db.prepare(`
    SELECT a.id_apoderado
    FROM pagos p
    JOIN jugadores j ON j.id_jugador = p.id_jugador
    JOIN apoderados a ON a.id_apoderado = j.id_apoderado
    WHERE p.id_pago = ?
  `).get(id_pago);

  if (apoderado) {
    db.prepare(`INSERT INTO notificaciones (id_apoderado, titulo, mensaje, tipo, fecha, leida)
      VALUES (?, 'Pago registrado', 'La cuota fue pagada correctamente desde la aplicación.', 'Pago', ?, 0)`)
      .run(apoderado.id_apoderado, hoy);
  }

  res.json(ok({ id_pago, estado:'Pagado', fecha_pago:hoy }));
});

app.get('/api/asistencias', (_req, res) => {
  const rows = db.prepare(`
    SELECT a.*, j.nombre || ' ' || j.apellido jugador, e.fecha, e.hora, c.nombre categoria
    FROM asistencias a
    JOIN jugadores j ON j.id_jugador = a.id_jugador
    JOIN entrenamientos e ON e.id_entrenamiento = a.id_entrenamiento
    JOIN categorias c ON c.id_categoria = e.id_categoria
    ORDER BY e.fecha DESC
  `).all();
  res.json(ok(rows));
});

app.post('/api/asistencias', (req, res) => {
  const { id_jugador, id_entrenamiento, asistio } = req.body;
  if (!id_jugador || !id_entrenamiento || asistio === undefined) return res.status(400).json({ ok:false, error:'Faltan datos obligatorios' });
  db.prepare(`INSERT OR REPLACE INTO asistencias (id_jugador, id_entrenamiento, asistio) VALUES (?,?,?)`).run(id_jugador, id_entrenamiento, asistio ? 1 : 0);
  res.status(201).json(ok({ saved: true }));
});

app.get('/api/entrenamientos', (_req, res) => res.json(ok(db.prepare(`SELECT e.*, c.nombre categoria FROM entrenamientos e JOIN categorias c ON c.id_categoria=e.id_categoria`).all())));
app.get('/api/eventos', (_req, res) => res.json(ok(db.prepare(`SELECT ev.*, c.nombre categoria FROM eventos ev LEFT JOIN categorias c ON c.id_categoria=ev.id_categoria ORDER BY fecha`).all())));
app.get('/api/notificaciones', (_req, res) => res.json(ok(db.prepare(`SELECT * FROM notificaciones ORDER BY fecha DESC`).all())));

const port = process.env.PORT || 3001;
app.listen(port, () => console.log(`API Jugada Maestra ejecutándose en http://localhost:${port}`));
