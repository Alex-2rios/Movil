import React, { useEffect, useState } from 'react';

import PantallaAutenticacion from './PantallaAutenticacion';
import PantallaCaja from './PantallaCaja';
import PantallaCocina from './PantallaCocina';
import PantallaInicioRol from './PantallaInicioRol';
import PantallaMesero from './PantallaMesero';
import { clearSession, login, terracotaApi } from '../services/api';

import { useRouter } from 'expo-router';

export default function PantallaMenu({ rolInicial = 'mesero' }) {
  const router = useRouter();
  const [sesion, setSesion] = useState(null);
  const [rol, setRol] = useState(rolInicial);
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
    clearSession();
    setSesion(null);
    setPantalla('inicio');
  };

  const iniciarSesion = async (usuario, contraseña, rolSolicitado) => {
    let nuevaSesion;
    try {
      nuevaSesion = await login(usuario, contraseña);
      if (!nuevaSesion.usuario.roles.includes(rolSolicitado)
        && !nuevaSesion.usuario.roles.includes('administrador')) {
        throw new Error(`El usuario no tiene asignado el rol ${rolSolicitado}.`);
      }

      if (rolSolicitado === 'mesero') {
        const [mesasApi, productosApi, pedidosApi] = await Promise.all([
          terracotaApi.mesas(), terracotaApi.productos(), terracotaApi.pedidosMesero(),
        ]);
        setMesas(mesasApi);
        setProductos(productosApi);
        setPedidosDelMesero(pedidosApi.map(normalizarPedido));
      } else if (rolSolicitado === 'cocina') {
        const pedidosApi = await terracotaApi.pedidosCocina();
        setPedidosDelMesero(pedidosApi.map(normalizarPedido));
      } else {
        const [pedidosApi, ticketsApi] = await Promise.all([terracotaApi.pedidosCaja(), terracotaApi.tickets()]);
        setPedidosCajaPendientes(pedidosApi.map(normalizarPedido));
        setTicketsCaja(ticketsApi.map(normalizarTicket));
      }
    } catch (error) {
      clearSession();
      throw error;
    }
    setSesion(nuevaSesion);
    setPantalla('inicio');
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
      />
    );
  }

  if (pantalla === 'inicio') {
    return (
      <PantallaInicioRol
        rol={rol}
        nombre={sesion.usuario.nombre}
        pedidos={pedidosDelMesero}
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
          alRegistrarPago={async (pago) => {
            const ticket = normalizarTicket(await terracotaApi.registrarPago(pago));
            setTicketsCaja((actuales) => [ticket, ...actuales]);
            setPedidosCajaPendientes((actuales) => actuales.filter((pedido) => pedido.id !== pago.pedido_id));
            return ticket;
          }}
        />
      );
    case 'cocina':
      return (
        <PantallaCocina
          pantalla={pantalla}
          cambiarPantalla={irAPantalla}
          alCerrarSesion={cerrarSesion}
          pedidos={pedidosDelMesero}
          alCambiarEstado={async (id, estado) => {
            const actualizado = normalizarPedido(await terracotaApi.cambiarEstado(id, estado));
            setPedidosDelMesero((actuales) => actuales.map((pedido) => pedido.id === id ? actualizado : pedido));
            return actualizado;
          }}
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
          alCrearPedido={async (pedido) => {
            const creado = normalizarPedido(await terracotaApi.crearPedido(pedido));
            setPedidosDelMesero((actuales) => [creado, ...actuales]);
            return creado;
          }}
          alEntregarPedido={async (id) => {
            const actualizado = normalizarPedido(await terracotaApi.entregarPedido(id));
            setPedidosDelMesero((actuales) => actuales.map((pedido) => pedido.id === id ? actualizado : pedido));
            return actualizado;
          }}
          alCerrarSesion={cerrarSesion}
        />
      );
  }
}

function normalizarPedido(pedido) {
  return {
    ...pedido,
    total: Number(pedido.total),
    subtotal: Number(pedido.subtotal || 0),
    impuesto: Number(pedido.impuesto || 0),
    hora: pedido.hora || formatearHora(pedido.creado_en),
    items: (pedido.items || []).map((item) => ({ ...item, id: item.producto_id, precio: Number(item.precio) })),
  };
}

function normalizarTicket(ticket) {
  const fecha = ticket.emitido_en ? new Date(ticket.emitido_en) : new Date();
  return {
    ...ticket,
    pedidoId: ticket.pedidoId || ticket.pedido_id,
    total: Number(ticket.total),
    cambio: Number(ticket.cambio || 0),
    fecha: ticket.fecha || fecha.toLocaleDateString('es-MX', { day: '2-digit', month: '2-digit', year: 'numeric' }),
    hora: ticket.hora || fecha.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
    items: (ticket.items || []).map((item) => ({ ...item, precio: Number(item.precio) })),
  };
}

function formatearHora(fecha) {
  return fecha
    ? new Date(fecha).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
    : '';
}
