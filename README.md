# Jugada Maestra

Aplicación demo para gestión de club de fútbol amateur: jugadores, pagos, asistencia, calendario, notificaciones y portal de apoderados.

## Credenciales demo
- Administrador: `admin@club.cl` / `admin123`
- Apoderado: `maria@demo.cl` / `apo123`

## Ejecutar backend
```bash
cd backend
npm install
node init-db.js
node server.js
```
API: http://localhost:3001

## Ejecutar frontend
En otra terminal:
```bash
cd frontend
npm install
npm start
```

## Funcionalidad de pago online
El apoderado puede entrar a **Mis pagos** y presionar **Pagar cuota mensual**. La aplicación actualiza automáticamente la cuota pendiente en la base de datos y el administrador puede verla como pagada en el módulo **Pagos**.

Si ya habías inicializado la base de datos antes, ejecuta nuevamente:
```bash
cd backend
node init-db.js
```
para reiniciar datos de prueba.
