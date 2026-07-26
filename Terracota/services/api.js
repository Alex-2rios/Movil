import { Platform } from 'react-native';
import Constants from 'expo-constants';

let lanIp = '';
if (Constants.manifest?.debuggerHost) {
  lanIp = Constants.manifest.debuggerHost.split(':')[0];
} else if (Constants?.expoConfig?.hostUri) {
  lanIp = Constants.expoConfig.hostUri.split(':')[0];
}

const API_URL = lanIp
  ? `http://${lanIp}:8080/api/v1`
  : (Platform.OS === 'android' ? 'http://10.0.2.2:8080/api/v1' : 'http://127.0.0.1:8080/api/v1');

let accessToken = null;

export function clearSession() {
  accessToken = null;
}

async function request(path, options = {}) {
  const headers = { Accept: 'application/json', ...options.headers };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  if (options.body && !(options.headers && options.headers['Content-Type'])) {
    headers['Content-Type'] = options.body instanceof URLSearchParams
      ? 'application/x-www-form-urlencoded'
      : 'application/json';
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
    body: form.toString(),
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
