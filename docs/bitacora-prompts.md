# Bitácora de Prompts

## Prompt 1: Análisis con NotebookLM
Analiza el caso Jugada Maestra. Identifica problemas actuales, pain points, actores, requerimientos funcionales, requerimientos no funcionales y casos de uso.

## Prompt 2: Prototipo con Stitch
Diseña un prototipo de alta fidelidad para una aplicación llamada Jugada Maestra, destinada a digitalizar la administración del club Los Halcones del Barrio. Debe incluir Login, Dashboard, Gestión de Jugadores, Pagos, Asistencia, Reportes, Calendario, Portal Apoderado y Notificaciones.

## Prompt 3: Base de datos SQL
Genera un script SQL relacional para una aplicación de club de fútbol amateur que registre jugadores, apoderados, categorías, pagos, entrenamientos, asistencias, eventos y notificaciones.

## Prompt 4: Backend
Genera un backend Node.js + Express con conexión a SQLite y endpoints REST para dashboard, jugadores, pagos, asistencias, eventos y notificaciones.

## Prompt 5: Frontend
Genera un frontend React + Vite que consuma la API y muestre dashboard, jugadores, pagos, asistencia, calendario y notificaciones.

## Iteración: pago online de apoderados
**Prompt usado:** Mejorar la aplicación para que los apoderados puedan pagar una cuota pendiente desde el portal de apoderado, registrando automáticamente el pago en la base de datos. El administrador debe poder ver el pago actualizado en su módulo Pagos.

**Resultado:** Se agregó el endpoint `POST /api/pagos/pagar-cuota`, el botón "Pagar cuota mensual" en el Portal Apoderado y actualización automática del estado del pago de Pendiente a Pagado.
