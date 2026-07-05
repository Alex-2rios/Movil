import React, { useState, useEffect } from 'react';
import { Alert } from 'react-native';

import PantallaAutenticacion from './PantallaAutenticacion';
import PantallaCaja from './PantallaCaja';
import PantallaCocina from './PantallaCocina';
import PantallaInicioRol from './PantallaInicioRol';
import PantallaMesero from './PantallaMesero';
import { login as apiLogin, terracotaApi, clearSession as apiClearSession } from '../services/api';

const mesasDemo = [
  { id: 1, estado: 'DISPONIBLE' },
  { id: 2, estado: 'DISPONIBLE' },
  { id: 3, estado: 'OCUPADA' },
  { id: 4, estado: 'DISPONIBLE' },
  { id: 5, estado: 'DISPONIBLE' },
  { id: 6, estado: 'DISPONIBLE' },
];

const productosDemo = [
  { id: 'CAFE-AMERICANO', nombre: 'Café Americano', categoria: 'BEBIDAS', precio: 35 },
  { id: 'CAPUCHINO', nombre: 'Capuchino', categoria: 'BEBIDAS', precio: 52 },
  { id: 'PANINI', nombre: 'Panini Terracota', categoria: 'ALIMENTOS', precio: 89 },
  { id: 'ENSALADA', nombre: 'Ensalada de la casa', categoria: 'ALIMENTOS', precio: 96 },
  { id: 'PASTEL', nombre: 'Pastel de chocolate', categoria: 'POSTRES', precio: 58 },
  { id: 'COMBO', nombre: 'Combo café + postre', categoria: 'PROMOS', precio: 99 },
];

const pedidosDemo = [
  {
    id: 101,
    mesa: 3,
    estado: 'PENDIENTE',
    hora: '10:25',
    subtotal: 141,
    impuesto: 22.56,
    total: 163.56,
    items: [
      { id: 'PANINI', nombre: 'Panini Terracota', cantidad: 1, precio: 89, observacion: 'Sin cebolla' },
      { id: 'CAPUCHINO', nombre: 'Capuchino', cantidad: 1, precio: 52, observacion: '' },
    ],
  },
  {
    id: 102,
    mesa: 5,
    estado: 'PREPARANDO',
    hora: '10:40',
    subtotal: 154,
    impuesto: 24.64,
    total: 178.64,
    items: [
      { id: 'ENSALADA', nombre: 'Ensalada de la casa', cantidad: 1, precio: 96, observacion: 'Aderezo aparte' },
      { id: 'PASTEL', nombre: 'Pastel de chocolate', cantidad: 1, precio: 58, observacion: '' },
    ],
  },
  {
    id: 103,
    mesa: 2,
    estado: 'LISTO',
    hora: '10:55',
    subtotal: 134,
    impuesto: 21.44,
    total: 155.44,
    items: [
      { id: 'CAFE-AMERICANO', nombre: 'Café Americano', cantidad: 1, precio: 35, observacion: '' },
      { id: 'COMBO', nombre: 'Combo café + postre', cantidad: 1, precio: 99, observacion: 'Para llevar' },
    ],
  },
];

const ticketsDemo = [
  {
    folio: 'T-0001',
    pedidoId: 90,
    mesa: 1,
    metodo: 'EFECTIVO',
    total: 214.60,
    cambio: 5.40,
    fecha: fechaActual(),
    hora: '09:35',
    items: [
      { nombre: 'Capuchino', cantidad: 2, precio: 52 },
      { nombre: 'Combo café + postre', cantidad: 1, precio: 99 },
    ],
  },
];

export default function PantallaMenu() {
  const [sesion, setSesion] = useState(null);
  const [rol, setRol] = useState('mesero');
  const [pantalla, setPantalla] = useState('inicio');
  const [mesaSeleccionada, setMesaSeleccionada] = useState(1);
  const [pedidosCajaPendientes, setPedidosCajaPendientes] = useState([]);
  const [ticketsCaja, setTicketsCaja] = useState([]);
  const [pedidosDelMesero, setPedidosDelMesero] = useState([]);
  const [mesas, setMesas] = useState([]);
  const [productos, setProductos] = useState([]);

  const irAPantalla = (siguientePantalla) => {
    setPantalla(siguientePantalla);
  };

  const cerrarSesion = () => {
    apiClearSession();
    setSesion(null);
    setPantalla('inicio');
  };

  const formatApiPedido = (pedido) => {
    const dateObj = new Date(pedido.creado_en);
    const hora = dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' });
    return {
      ...pedido,
      hora,
      items: (pedido.items || []).map((item) => ({
        id: item.producto_id,
        nombre: item.nombre,
        cantidad: item.cantidad,
        precio: Number(item.precio),
        observacion: item.observacion || '',
      })),
    };
  };

  const cargarCatalogo = async () => {
    try {
      const mesasData = await terracotaApi.mesas();
      const productosData = await terracotaApi.productos();
      setMesas(mesasData.map((m) => ({ id: m.numero, estado: m.estado })));
      setProductos(
        productosData.map((p) => ({
          id: p.clave,
          nombre: p.nombre,
          categoria: p.categoria.toUpperCase(),
          precio: Number(p.precio),
        })),
      );
    } catch (e) {
      console.warn('Error cargando catálogos del servidor:', e);
      setMesas(mesasDemo);
      setProductos(productosDemo);
    }
  };

  const cargarPedidos = async () => {
    if (!sesion) return;
    try {
      if (rol === 'mesero') {
        const raw = await terracotaApi.pedidosMesero();
        setPedidosDelMesero(raw.map(formatApiPedido));
      } else if (rol === 'cocina') {
        const raw = await terracotaApi.pedidosCocina();
        setPedidosDelMesero(raw.map(formatApiPedido));
      } else if (rol === 'caja') {
        const raw = await terracotaApi.pedidosCaja();
        setPedidosCajaPendientes(raw.map(formatApiPedido));
        const rawTickets = await terracotaApi.tickets();
        setTicketsCaja(
          rawTickets.map((t) => {
            const dateObj = new Date(t.emitido_en);
            return {
              folio: t.folio,
              pedidoId: t.pedido_id,
              mesa: t.mesa,
              metodo: t.metodo,
              total: Number(t.total),
              cambio: Number(t.cambio),
              fecha: dateObj.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
              hora: dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
              items: (t.items || []).map((item) => ({
                nombre: item.nombre,
                cantidad: item.cantidad,
                precio: Number(item.precio),
              })),
            };
          }),
        );
      }
    } catch (e) {
      console.warn('Error cargando pedidos del servidor:', e);
    }
  };

  useEffect(() => {
    if (sesion) {
      cargarCatalogo();
      cargarPedidos();
    }
  }, [sesion, rol, pantalla]);

  const iniciarSesion = async (usuario, contraseña, rolSolicitado) => {
    try {
      const sessionData = await apiLogin(usuario, contraseña);
      if (!sessionData.usuario.roles.includes(rolSolicitado)) {
        throw new Error(`El usuario no tiene el rol de ${rolSolicitado}.`);
      }
      setRol(rolSolicitado);
      setSesion(sessionData);
      setPantalla('inicio');
    } catch (error) {
      Alert.alert('Error de inicio de sesión', error.message);
      throw error;
    }
  };

  const iniciarSesionDemo = (rolSolicitado) => {
    setRol(rolSolicitado);
    setSesion({
      access_token: 'maqueta-local',
      usuario: {
        id: 1,
        nombre: 'Usuario Demo (' + rolSolicitado.toUpperCase() + ')',
        usuario: 'demo',
        roles: [rolSolicitado],
      },
    });
    setPantalla('inicio');
    // Cargar datos locales de maqueta
    setMesas(mesasDemo);
    setProductos(productosDemo);
    if (rolSolicitado === 'mesero' || rolSolicitado === 'cocina') {
      setPedidosDelMesero(pedidosDemo);
    } else if (rolSolicitado === 'caja') {
      setPedidosCajaPendientes(pedidosDemo.filter((p) => p.estado === 'ENTREGADO' || p.estado === 'LISTO'));
      setTicketsCaja(ticketsDemo);
    }
  };

  const crearPedidoDemo = async (pedido) => {
    if (!sesion || sesion.access_token === 'maqueta-local') {
      const items = pedido.items.map((item) => {
        const prod = productosDemo.find((r) => r.id === item.producto_clave);
        return {
          id: prod.id,
          nombre: prod.nombre,
          cantidad: item.cantidad,
          precio: prod.precio,
          observacion: item.observacion || '',
        };
      });
      const subtotal = items.reduce((tot, it) => tot + it.precio * it.cantidad, 0);
      const impuesto = Number((subtotal * 0.16).toFixed(2));
      const nuevoPedido = {
        id: Date.now(),
        mesa: pedido.mesa,
        estado: 'PENDIENTE',
        hora: '12:00',
        subtotal,
        impuesto,
        total: Number((subtotal + impuesto).toFixed(2)),
        items,
      };
      setPedidosDelMesero((actuales) => [nuevoPedido, ...actuales]);
      return nuevoPedido;
    }
    try {
      const resp = await terracotaApi.crearPedido(pedido);
      const mapped = formatApiPedido(resp);
      setPedidosDelMesero((actuales) => [mapped, ...actuales]);
      return mapped;
    } catch (e) {
      Alert.alert('Error creando pedido', e.message);
      throw e;
    }
  };

  const cambiarEstadoPedidoDemo = async (id, estado) => {
    if (!sesion || sesion.access_token === 'maqueta-local') {
      let actualizado = null;
      setPedidosDelMesero((actuales) => actuales.map((pedido) => {
        if (pedido.id !== id) return pedido;
        actualizado = { ...pedido, estado };
        return actualizado;
      }));
      return actualizado;
    }
    try {
      const resp = await terracotaApi.cambiarEstado(id, estado);
      const mapped = formatApiPedido(resp);
      setPedidosDelMesero((actuales) => actuales.map((p) => (p.id === id ? mapped : p)));
      return mapped;
    } catch (e) {
      Alert.alert('Error actualizando pedido', e.message);
      throw e;
    }
  };

  const entregarPedidoDemo = async (id) => {
    if (!sesion || sesion.access_token === 'maqueta-local') {
      const actualizado = await cambiarEstadoPedidoDemo(id, 'ENTREGADO');
      if (actualizado) {
        setPedidosCajaPendientes((actuales) => actuales.some((pedido) => pedido.id === actualizado.id)
          ? actuales
          : [actualizado, ...actuales]);
      }
      return actualizado;
    }
    try {
      const resp = await terracotaApi.entregarPedido(id);
      const mapped = formatApiPedido(resp);
      setPedidosDelMesero((actuales) => actuales.map((p) => (p.id === id ? mapped : p)));
      setPedidosCajaPendientes((actuales) =>
        actuales.some((p) => p.id === mapped.id) ? actuales : [mapped, ...actuales],
      );
      return mapped;
    } catch (e) {
      Alert.alert('Error entregando pedido', e.message);
      throw e;
    }
  };

  const registrarPagoDemo = async (pago) => {
    if (!sesion || sesion.access_token === 'maqueta-local') {
      const pedido = pedidosCajaPendientes.find((registro) => registro.id === pago.pedido_id);
      const total = pedido?.total || 0;
      const recibido = pago.monto_recibido || total;
      const ticket = {
        folio: `T-${String(ticketsCaja.length + 1).padStart(4, '0')}`,
        pedidoId: pago.pedido_id,
        mesa: pedido?.mesa || '-',
        metodo: pago.metodo,
        total,
        cambio: Math.max(0, recibido - total),
        fecha: '05/07/2026',
        hora: '12:00',
        items: pedido?.items || [],
      };
      setTicketsCaja((actuales) => [ticket, ...actuales]);
      setPedidosCajaPendientes((actuales) => actuales.filter((registro) => registro.id !== pago.pedido_id));
      return ticket;
    }
    try {
      const resp = await terracotaApi.registrarPago(pago);
      const dateObj = new Date(resp.emitido_en);
      const ticket = {
        folio: resp.folio,
        pedidoId: resp.pedido_id,
        mesa: resp.mesa,
        metodo: resp.metodo,
        total: Number(resp.total),
        cambio: Number(resp.cambio),
        fecha: dateObj.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
        hora: dateObj.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
        items: (resp.items || []).map((item) => ({
          nombre: item.nombre,
          cantidad: item.cantidad,
          precio: Number(item.precio),
        })),
      };
      setTicketsCaja((actuales) => [ticket, ...actuales]);
      setPedidosCajaPendientes((actuales) => actuales.filter((p) => p.id !== pago.pedido_id));
      return ticket;
    } catch (e) {
      Alert.alert('Error registrando pago', e.message);
      throw e;
    }
  };

  if (!sesion) {
    return (
      <PantallaAutenticacion
        rol={rol}
        alCambiarRol={(siguienteRol) => {
          setRol(siguienteRol);
          setPantalla('inicio');
        }}
        alEntrar={iniciarSesion}
        alEntrarDemo={iniciarSesionDemo}
      />
    );
  }

  if (pantalla === 'inicio') {
    return (
      <PantallaInicioRol
        rol={rol}
        nombre={sesion.usuario.nombre}
        pedidos={rol === 'caja' ? pedidosCajaPendientes : pedidosDelMesero}
        alNavegar={irAPantalla}
        alCerrarSesion={cerrarSesion}
      />
    );
  }

  switch (rol) {
    case 'caja':
      return (
        <PantallaCaja
          pantalla={pantalla}
          cambiarPantalla={irAPantalla}
          alCerrarSesion={cerrarSesion}
          pedidosPendientes={pedidosCajaPendientes}
          tickets={ticketsCaja}
          alRegistrarPago={registrarPagoDemo}
        />
      );
    case 'cocina':
      return (
        <PantallaCocina
          pantalla={pantalla}
          cambiarPantalla={irAPantalla}
          alCerrarSesion={cerrarSesion}
          pedidos={pedidosDelMesero}
          alCambiarEstado={cambiarEstadoPedidoDemo}
        />
      );
    default:
      return (
        <PantallaMesero
          pantalla={pantalla}
          cambiarPantalla={irAPantalla}
          mesaSeleccionada={mesaSeleccionada}
          cambiarMesaSeleccionada={setMesaSeleccionada}
          pedidos={pedidosDelMesero}
          setPedidosCajaPendientes={setPedidosCajaPendientes}
          mesasDisponibles={mesas}
          productosDisponibles={productos}
          alCrearPedido={crearPedidoDemo}
          alEntregarPedido={entregarPedidoDemo}
          alCerrarSesion={cerrarSesion}
        />
      );
  }
}

function fechaActual() {
  return new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

function horaActual() {
  return new Date().toLocaleTimeString('es-MX', {
    hour: '2-digit',
    minute: '2-digit',
  });
}
