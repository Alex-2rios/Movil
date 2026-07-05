import { Platform } from 'react-native';

const DEFAULT_IP = Platform.OS === 'android' ? '10.0.2.2' : '127.0.0.1';
const API_URL = (process.env.EXPO_PUBLIC_API_URL || `http://${DEFAULT_IP}:8080/api/v1`).replace(/\/$/, '');

let accessToken = null;

export function clearSession() {
  accessToken = null;
}

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;
  if (options.body && !(options.body instanceof URLSearchParams)) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(`${API_URL}${path}`, { ...options, headers });
  const body = await response.json().catch(() => null);
  if (!response.ok) {
    const message = typeof body?.detail === 'string' ? body.detail : 'No fue posible completar la operación.';
    throw new Error(message);
  }
  return body;
}

export async function login(username, password) {
  const form = new URLSearchParams();
  form.append('username', username.trim());
  form.append('password', password);
  const session = await request('/auth/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: form,
  });
  accessToken = session.access_token;
  return session;
}

export const terracotaApi = {
  mesas: () => request('/catalogos/mesas'),
  productos: () => request('/catalogos/productos'),
  pedidosMesero: () => request('/mesero/pedidos'),
  crearPedido: (pedido) => request('/mesero/pedidos', { method: 'POST', body: JSON.stringify(pedido) }),
  entregarPedido: (id) => request(`/mesero/pedidos/${id}/entregar`, {
    method: 'PATCH', body: JSON.stringify({ estado: 'ENTREGADO' }),
  }),
  pedidosCocina: () => request('/cocina/pedidos'),
  cambiarEstado: (id, estado) => request(`/cocina/pedidos/${id}/estado`, {
    method: 'PATCH', body: JSON.stringify({ estado }),
  }),
  pedidosCaja: () => request('/caja/pedidos-pendientes'),
  tickets: () => request('/caja/tickets'),
  ventasHoy: () => request('/caja/ventas/hoy'),
  registrarPago: (pago) => request('/caja/pagos', { method: 'POST', body: JSON.stringify(pago) }),
};
