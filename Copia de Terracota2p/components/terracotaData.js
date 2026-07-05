export const roles = [
  { clave: 'mesero', etiqueta: 'Mesero' },
  { clave: 'caja', etiqueta: 'Caja' },
  { clave: 'cocina', etiqueta: 'Cocina' },
];

export const inicioPorRol = {
  mesero: {
    titulo: 'Bienvenido, Luis E',
    etiqueta: 'ROL: CLIENTE / MESERO',
    acciones: [
      { clave: 'mesa', titulo: 'SELECCIONAR MESA', icono: 'mesa' },
      { clave: 'crear', titulo: 'CREAR PEDIDO', icono: 'crearPedido', contorno: true },
      { clave: 'estado', titulo: 'VER ESTADO PEDIDO', icono: 'estado' },
      { clave: 'listos', titulo: 'PEDIDOS LISTOS', icono: 'pedidosListos', contorno: true },
    ],
  },
  caja: {
    titulo: 'Bienvenido, Luis E',
    etiqueta: 'ROL: CAJA',
    acciones: [
      { clave: 'pedidos', titulo: 'PEDIDOS PENDIENTES', icono: 'pedidosPendientes' },
      { clave: 'pago', titulo: 'REGISTRAR PAGO', icono: 'ventas', contorno: true },
      { clave: 'ventas', titulo: 'VENTAS DEL DIA', icono: 'ventas' },
      { clave: 'tickets', titulo: 'TICKETS GENERADOS', icono: 'tickets', contorno: true },
    ],
  },
  cocina: {
    titulo: 'Bienvenido, Luis E',
    etiqueta: 'ROL: COCINA',
    estadisticas: [
      { etiqueta: 'Pedidos pendientes', valor: 6, icono: 'pedidosPendientes' },
      { etiqueta: 'En preparacion', valor: 3, icono: 'estadoOscuro' },
    ],
    acciones: [
      { clave: 'pendientes', titulo: 'Pedidos en cocina', icono: 'pedidosPendientes' },
      { clave: 'preparacion', titulo: 'En preparacion', icono: 'estadoOscuro', contorno: true },
      { clave: 'listos', titulo: 'Listos para entregar', icono: 'pedidosListos' },
    ],
  },
};

export const navegacionPorRol = {
  mesero: [
    { clave: 'inicio', etiqueta: 'Inicio', icono: 'home' },
    { clave: 'crear', etiqueta: 'Pedidos', icono: 'pedidos' },
    { clave: 'estado', etiqueta: 'Estado', icono: 'estado' },
    { clave: 'mesa', etiqueta: 'Mesa', icono: 'mesa' },
  ],
  caja: [
    { clave: 'inicio', etiqueta: 'Inicio', icono: 'home' },
    { clave: 'pedidos', etiqueta: 'Pedidos', icono: 'pedidos' },
    { clave: 'ventas', etiqueta: 'Ventas', icono: 'ventas' },
    { clave: 'tickets', etiqueta: 'Tickets', icono: 'tickets' },
  ],
  cocina: [
    { clave: 'inicio', etiqueta: 'Inicio', icono: 'home' },
    { clave: 'pendientes', etiqueta: 'Pedidos', icono: 'pedidos' },
  ],
};

export const metodosPago = ['Efectivo', 'Tarjeta', 'Transferencia'];
