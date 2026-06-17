import React, { useEffect, useState } from 'react';
import { createRoot } from 'react-dom/client';
import { Calendar, CreditCard, Users, Activity, Bell, BarChart3, LogOut, UserRound, Home } from 'lucide-react';
import './styles.css';

const API = 'http://localhost:3001/api';
const fetchJson = async (path) => (await fetch(`${API}${path}`)).json();
const postJson = async (path, body) => (await fetch(`${API}${path}`, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body)
})).json();

const DEMO_USERS = {
  administrador: { email: 'admin@club.cl', password: 'admin123', name: 'Don Rafa', role: 'administrador' },
  apoderado: { email: 'maria@demo.cl', password: 'apo123', name: 'María González', role: 'apoderado', id_apoderado: 1 }
};

function Login({ onLogin }) {
  const [role, setRole] = useState('administrador');
  const [email, setEmail] = useState(DEMO_USERS.administrador.email);
  const [password, setPassword] = useState(DEMO_USERS.administrador.password);
  const [error, setError] = useState('');

  function changeRole(nextRole) {
    setRole(nextRole);
    setEmail(DEMO_USERS[nextRole].email);
    setPassword(DEMO_USERS[nextRole].password);
    setError('');
  }

  function submit(e) {
    e.preventDefault();
    const demo = DEMO_USERS[role];
    if (email.trim().toLowerCase() === demo.email && password === demo.password) {
      onLogin(demo);
    } else {
      setError('Correo o contraseña incorrectos para el perfil seleccionado.');
    }
  }

  return <div className="login-page">
    <form className="login-card" onSubmit={submit}>
      <div className="brand-badge">⚽</div>
      <h1>Jugada Maestra</h1>
      <p>Ingresa según tu perfil de usuario.</p>
      <div className="role-tabs">
        <button type="button" className={role === 'administrador' ? 'selected' : ''} onClick={() => changeRole('administrador')}>Administrador</button>
        <button type="button" className={role === 'apoderado' ? 'selected' : ''} onClick={() => changeRole('apoderado')}>Apoderado</button>
      </div>
      <label>Correo electrónico</label>
      <input value={email} onChange={e => setEmail(e.target.value)} placeholder="correo@club.cl" />
      <label>Contraseña</label>
      <input value={password} onChange={e => setPassword(e.target.value)} type="password" placeholder="contraseña" />
      {error && <div className="error-box">{error}</div>}
      <button className="primary-btn" type="submit">Ingresar</button>
      <div className="demo-box">
        <strong>Credenciales demo</strong>
        <span>Administrador: admin@club.cl / admin123</span>
        <span>Apoderado: maria@demo.cl / apo123</span>
      </div>
    </form>
  </div>;
}

function Sidebar({ page, setPage, user, onLogout }) {
  const adminItems = [
    ['dashboard','Dashboard',BarChart3], ['jugadores','Jugadores',Users], ['pagos','Pagos',CreditCard],
    ['asistencia','Asistencia',Activity], ['reportes','Reportes',BarChart3], ['calendario','Calendario',Calendar], ['notificaciones','Notificaciones',Bell]
  ];
  const parentItems = [
    ['portal','Mi inicio',Home], ['portalPagos','Mis pagos',CreditCard], ['portalAsistencia','Asistencia',Activity], ['calendario','Calendario',Calendar], ['notificaciones','Notificaciones',Bell]
  ];
  const items = user.role === 'administrador' ? adminItems : parentItems;
  return <aside className="sidebar">
    <h2>⚽ Jugada Maestra</h2>
    <div className="user-chip"><UserRound size={18}/><div><strong>{user.name}</strong><span>{user.role === 'administrador' ? 'Administrador' : 'Apoderado'}</span></div></div>
    {items.map(([id,label,Icon])=><button key={id} className={page===id?'active':''} onClick={()=>setPage(id)}><Icon size={18}/>{label}</button>)}
    <button className="logout" onClick={onLogout}><LogOut size={18}/>Cerrar sesión</button>
  </aside>;
}
function Card({ label, value }) { return <div className="card"><span>{label}</span><strong>{value}</strong></div>; }
function Dashboard() {
  const [data,setData]=useState(null); useEffect(()=>{fetchJson('/dashboard').then(r=>setData(r.data))},[]);
  if(!data) return <p>Cargando...</p>;
  const variacion = data.ingresosMesAnterior ? Math.round(((data.ingresosMes - data.ingresosMesAnterior) / data.ingresosMesAnterior) * 100) : 0;
  return <><h1>Dashboard Administrador</h1><p className="subtitle">Vista exclusiva de Don Rafa para monitorear la salud financiera y deportiva del club.</p><div className="grid cards"><Card label="Jugadores inscritos" value={data.totalJugadores}/><Card label="Al día" value={data.alDia}/><Card label="Morosos" value={data.morosos}/><Card label="Ingresos mes actual" value={`$${data.ingresosMes.toLocaleString('es-CL')}`}/><Card label="Variación ingresos" value={`${variacion}%`}/></div><section className="panel"><h2>Asistencia promedio por categoría</h2>{data.asistencia.map(a=><div className="bar" key={a.categoria}><span>{a.categoria}</span><div><i style={{width:`${a.promedio}%`}}></i></div><b>{a.promedio}%</b></div>)}</section></>;
}
function Jugadores(){ const [rows,setRows]=useState([]); useEffect(()=>{fetchJson('/jugadores').then(r=>setRows(r.data))},[]); return <><h1>Gestión de jugadores</h1><Table rows={rows} cols={['nombre','apellido','categoria','apoderado','telefono','estado_pago']}/></> }
function Pagos(){ const [rows,setRows]=useState([]); useEffect(()=>{fetchJson('/pagos').then(r=>setRows(r.data))},[]); return <><h1>Registro de pagos</h1><Table rows={rows} cols={['jugador','categoria','mes','anio','monto','estado','fecha_pago']}/></> }
function Asistencia(){ const [rows,setRows]=useState([]); useEffect(()=>{fetchJson('/asistencias').then(r=>setRows(r.data))},[]); return <><h1>Control de asistencia</h1><Table rows={rows.map(r=>({...r, asistio:r.asistio?'Asistió':'No asistió'}))} cols={['jugador','categoria','fecha','hora','asistio']}/></> }
function Calendario(){ const [rows,setRows]=useState([]); useEffect(()=>{fetchJson('/eventos').then(r=>setRows(r.data))},[]); return <><h1>Calendario</h1><div className="events">{rows.map(e=><article key={e.id_evento}><strong>{e.titulo}</strong><span>{e.tipo} · {e.fecha} {e.hora}</span><small>{e.lugar} {e.categoria ? `· ${e.categoria}`:''}</small></article>)}</div></> }
function Notificaciones(){ const [rows,setRows]=useState([]); useEffect(()=>{fetchJson('/notificaciones').then(r=>setRows(r.data))},[]); return <><h1>Notificaciones</h1><div className="events">{rows.map(n=><article key={n.id_notificacion} className={!n.leida?'unread':''}><strong>{n.titulo}</strong><span>{n.tipo} · {n.fecha} · {n.leida?'Leída':'No leída'}</span><small>{n.mensaje}</small></article>)}</div></> }
function Reportes(){ const [data,setData]=useState(null); const [pagos,setPagos]=useState([]); useEffect(()=>{fetchJson('/dashboard').then(r=>setData(r.data)); fetchJson('/pagos').then(r=>setPagos(r.data));},[]); if(!data) return <p>Cargando...</p>; const pendientes = pagos.filter(p=>p.estado==='Pendiente'); return <><h1>Reportes</h1><p className="subtitle">Indicadores financieros y deportivos para la toma de decisiones.</p><div className="grid cards"><Card label="Ingresos junio" value={`$${data.ingresosMes.toLocaleString('es-CL')}`}/><Card label="Ingresos mayo" value={`$${data.ingresosMesAnterior.toLocaleString('es-CL')}`}/><Card label="Jugadores morosos" value={data.morosos}/><Card label="Jugadores al día" value={data.alDia}/></div><section className="panel"><h2>Morosos</h2><Table rows={pendientes} cols={['jugador','categoria','monto','mes','anio','estado']}/></section></> }
function PortalApoderado(){ const [jugadores,setJugadores]=useState([]); const [eventos,setEventos]=useState([]); const [pagos,setPagos]=useState([]); useEffect(()=>{fetchJson('/jugadores').then(r=>setJugadores(r.data.filter(j=>j.apoderado.includes('María')))); fetchJson('/eventos').then(r=>setEventos(r.data.slice(0,2))); fetchJson('/pagos').then(r=>setPagos(r.data.filter(p=>p.jugador.includes('Lucas') || p.jugador.includes('Tomás'))));},[]); const jugador = jugadores[0]; return <><h1>Portal Apoderado</h1><p className="subtitle">Vista para padres y apoderados. No muestra el dashboard administrativo.</p><div className="grid cards"><Card label="Jugador" value={jugador ? `${jugador.nombre} ${jugador.apellido}` : 'Lucas González'}/><Card label="Categoría" value={jugador?.categoria ?? 'Infantil'}/><Card label="Estado de pago" value={jugador?.estado_pago ?? 'Pagado'}/><Card label="Próximo evento" value={eventos[0]?.fecha ?? '2026-06-10'}/></div><section className="panel"><h2>Próximos eventos</h2><div className="events">{eventos.map(e=><article key={e.id_evento}><strong>{e.titulo}</strong><span>{e.fecha} · {e.hora}</span><small>{e.lugar}</small></article>)}</div></section><section className="panel"><h2>Historial de pagos familiar</h2><Table rows={pagos} cols={['jugador','mes','anio','monto','estado','fecha_pago']}/></section></> }
function PortalPagos(){
  const [rows,setRows]=useState([]);
  const [message,setMessage]=useState('');
  const loadPagos = () => fetchJson('/pagos').then(r=>setRows(r.data.filter(p=>p.jugador.includes('Lucas') || p.jugador.includes('Tomás'))));
  useEffect(()=>{loadPagos()},[]);
  const pendiente = rows.find(p => p.estado === 'Pendiente');

  async function pagarCuota(){
    if(!pendiente){ setMessage('No existen cuotas pendientes para pagar.'); return; }
    const result = await postJson('/pagos/pagar-cuota', { id_pago: pendiente.id_pago });
    if(result.ok){
      setMessage(`Pago registrado correctamente para ${pendiente.jugador}. El administrador ya puede verlo en el módulo Pagos.`);
      await loadPagos();
    } else {
      setMessage(result.error || 'No se pudo registrar el pago.');
    }
  }

  return <><h1>Mis pagos</h1><p className="subtitle">El apoderado puede pagar una cuota pendiente desde la aplicación. Al confirmar, el pago se registra automáticamente en la base de datos y queda visible para Don Rafa en el módulo administrativo de pagos.</p><section className="panel payment-box"><h2>Pago de cuota mensual</h2>{pendiente ? <><p>Cuota pendiente: <strong>{pendiente.jugador}</strong> · {pendiente.mes}/{pendiente.anio} · ${pendiente.monto.toLocaleString('es-CL')}</p><button className="primary-action" onClick={pagarCuota}>Pagar cuota mensual</button></> : <p>Todas las cuotas familiares están al día.</p>}{message && <div className="success-box">{message}</div>}</section><Table rows={rows} cols={['jugador','mes','anio','monto','estado','fecha_pago']}/></> }
function PortalAsistencia(){ const [rows,setRows]=useState([]); useEffect(()=>{fetchJson('/asistencias').then(r=>setRows(r.data.filter(a=>a.jugador.includes('Lucas') || a.jugador.includes('Tomás')).map(r=>({...r, asistio:r.asistio?'Asistió':'No asistió'}))))},[]); return <><h1>Asistencia de mi hijo</h1><Table rows={rows} cols={['jugador','categoria','fecha','hora','asistio']}/></> }
function Table({rows,cols}){return <div className="table"><table><thead><tr>{cols.map(c=><th key={c}>{c.replace('_',' ')}</th>)}</tr></thead><tbody>{rows.map((r,i)=><tr key={i}>{cols.map(c=><td key={c}>{r[c] ?? '-'}</td>)}</tr>)}</tbody></table></div>}
function App(){
  const [user,setUser]=useState(null);
  const [page,setPage]=useState('dashboard');
  function handleLogin(loggedUser){ setUser(loggedUser); setPage(loggedUser.role === 'administrador' ? 'dashboard' : 'portal'); }
  function handleLogout(){ setUser(null); setPage('dashboard'); }
  if(!user) return <Login onLogin={handleLogin}/>;
  const adminPages={dashboard:<Dashboard/>,jugadores:<Jugadores/>,pagos:<Pagos/>,asistencia:<Asistencia/>,reportes:<Reportes/>,calendario:<Calendario/>,notificaciones:<Notificaciones/>};
  const parentPages={portal:<PortalApoderado/>,portalPagos:<PortalPagos/>,portalAsistencia:<PortalAsistencia/>,calendario:<Calendario/>,notificaciones:<Notificaciones/>};
  const pages = user.role === 'administrador' ? adminPages : parentPages;
  return <div className="app"><Sidebar page={page} setPage={setPage} user={user} onLogout={handleLogout}/><main>{pages[page] ?? pages[Object.keys(pages)[0]]}</main></div>;
}

createRoot(document.getElementById('root')).render(<App />);
