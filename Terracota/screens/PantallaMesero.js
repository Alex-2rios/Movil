import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  BarraSuperior,
  CajaBusqueda,
  Contenido,
  Divisor,
  EtiquetaEstado,
  FilaAcciones,
  ImagenProducto,
  MarcoTelefono,
  TituloConRegreso,
  colores,
} from '../components/TerracotaUI';
import { navegacionPorRol } from '../components/terracotaData';

export default function PantallaMesero({
  pantalla,
  cambiarPantalla,
  mesaSeleccionada,
  cambiarMesaSeleccionada,
  pedidos,
  setPedidosCajaPendientes,
  mesasDisponibles,
  productosDisponibles,
  alCrearPedido,
  alEntregarPedido,
  alCerrarSesion,
}) {
  const [filtroActivo, setFiltroActivo] = useState('TODOS');
  const [busqueda, setBusqueda] = useState('');
  const [busquedaMesa, setBusquedaMesa] = useState('');
  const [busquedaPedido, setBusquedaPedido] = useState('');
  const [carrito, setCarrito] = useState({});
  const [notas, setNotas] = useState({});
  const [idPedidoSeleccionado, setIdPedidoSeleccionado] = useState(null);
  const [pantallaRegresoDetalle, setPantallaRegresoDetalle] = useState('estado');

  const mesasFiltradas = useMemo(() => {
    const consulta = busquedaMesa.trim();
    if (!consulta) return mesasDisponibles;

    return mesasDisponibles.filter((mesa) => String(mesa.id).includes(consulta));
  }, [busquedaMesa, mesasDisponibles]);

  const productosFiltrados = useMemo(() => {
    const consulta = busqueda.trim().toLowerCase();

    return productosDisponibles.filter((producto) => {
      const coincideFiltro = filtroActivo === 'TODOS' || producto.categoria === filtroActivo;
      const coincideBusqueda = !consulta || producto.nombre.toLowerCase().includes(consulta);
      return coincideFiltro && coincideBusqueda;
    });
  }, [filtroActivo, busqueda, productosDisponibles]);

  const articulosSeleccionados = useMemo(
    () => productosDisponibles
      .map((producto) => ({
        ...producto,
        cantidad: carrito[producto.id] || 0,
        observacion: notas[producto.id] || '',
      }))
      .filter((producto) => producto.cantidad > 0),
    [carrito, notas, productosDisponibles]
  );

  const cantidadProductos = articulosSeleccionados.reduce((totalActual, articulo) => totalActual + articulo.cantidad, 0);
  const subtotal = articulosSeleccionados.reduce((totalActual, articulo) => totalActual + articulo.precio * articulo.cantidad, 0);
  const iva = Number((subtotal * 0.16).toFixed(2));
  const total = Number((subtotal + iva).toFixed(2));

  const pedidosFiltrados = useMemo(() => {
    const consulta = busquedaPedido.trim().toLocaleLowerCase('es-MX');
    const pedidosPorSeccion = pantalla === 'listos'
      ? pedidos.filter((pedido) => pedido.estado === 'LISTO')
      : pedidos;

    if (!consulta) return pedidosPorSeccion;

    return pedidosPorSeccion.filter((pedido) => [pedido.id, pedido.mesa, pedido.estado]
      .some((valor) => String(valor).toLocaleLowerCase('es-MX').includes(consulta)));
  }, [busquedaPedido, pantalla, pedidos]);

  const pedidoSeleccionado = pedidos.find((pedido) => pedido.id === idPedidoSeleccionado) || null;

  const cambiarCantidad = (idProducto, cantidad) => {
    setCarrito((actual) => {
      const siguienteCantidad = Math.min(Math.max((actual[idProducto] || 0) + cantidad, 0), 20);
      return { ...actual, [idProducto]: siguienteCantidad };
    });
  };

  const actualizarObservacion = (idProducto, valor) => {
    setNotas((actual) => ({ ...actual, [idProducto]: valor }));
  };

  const reiniciarPedido = () => {
    setCarrito({});
    setNotas({});
    setBusqueda('');
    setFiltroActivo('TODOS');
  };

  const mesaEstaOcupada = (idMesa) => {
    const mesa = mesasDisponibles.find((item) => item.id === idMesa);
    const estadosActivos = ['PENDIENTE', 'PREPARANDO', 'LISTO', 'ENTREGADO'];
    const tienePedidoActivo = pedidos.some((pedido) => pedido.mesa === idMesa && estadosActivos.includes(pedido.estado));
    return mesa?.estado === 'OCUPADA' || tienePedidoActivo;
  };

  const seleccionarMesa = (mesa) => {
    if (mesaEstaOcupada(mesa.id)) {
      Alert.alert('Mesa no disponible', `La mesa ${mesa.id} ya tiene un pedido activo.`);
      return;
    }

    cambiarMesaSeleccionada(mesa.id);
  };

  const confirmarMesa = () => {
    if (mesaEstaOcupada(mesaSeleccionada)) {
      Alert.alert('Selecciona otra mesa', 'La mesa seleccionada ya no se encuentra disponible.');
      return;
    }

    cambiarPantalla('crear');
  };

  const enviarPedido = async () => {
    if (articulosSeleccionados.length === 0) {
      Alert.alert('Pedido vacío', 'Agrega al menos un producto antes de enviar el pedido.');
      cambiarPantalla('crear');
      return;
    }

    if (mesaEstaOcupada(mesaSeleccionada)) {
      Alert.alert('Mesa no disponible', 'Selecciona una mesa disponible antes de enviar el pedido.');
      cambiarPantalla('mesa');
      return;
    }

    const solicitud = {
      mesa: mesaSeleccionada,
      items: articulosSeleccionados.map(({ id, cantidad, observacion }) => ({
        producto_clave: id,
        cantidad,
        observacion: observacion.trim(),
      })),
    };

    try {
      const nuevoPedido = await alCrearPedido(solicitud);
      setIdPedidoSeleccionado(nuevoPedido.id);
      reiniciarPedido();
      cambiarPantalla('estado');
    } catch (error) {
      Alert.alert('No se pudo crear el pedido', error.message);
    }
  };

  const abrirDetalle = (pedido) => {
    setIdPedidoSeleccionado(pedido.id);
    setPantallaRegresoDetalle(pantalla === 'listos' ? 'listos' : 'estado');
    cambiarPantalla('detalle');
  };

  const marcarComoEntregado = async () => {
    if (!pedidoSeleccionado || pedidoSeleccionado.estado !== 'LISTO') return;

    try {
      const entregado = await alEntregarPedido(pedidoSeleccionado.id);
      setPedidosCajaPendientes((actuales) => actuales.some((pedido) => pedido.id === entregado.id)
        ? actuales
        : [entregado, ...actuales]);
    } catch (error) {
      Alert.alert('No se pudo entregar el pedido', error.message);
    }
  };

  return (
    <MarcoTelefono elementosNavegacion={navegacionPorRol.mesero} activo={pantalla} alNavegar={cambiarPantalla}>
      <BarraSuperior alCerrarSesion={alCerrarSesion} />
      {pantalla === 'mesa' && (
        <Contenido>
          <TituloConRegreso titulo="Selecciona Tu Mesa" alRegresar={() => cambiarPantalla('inicio')} />
          <CajaBusqueda
            placeholder="Buscar mesa..."
            value={busquedaMesa}
            onChangeText={(valor) => setBusquedaMesa(valor.replace(/\D/g, ''))}
          />
          <View style={styles.tableGrid}>
            {mesasFiltradas.map((mesa) => {
              const ocupada = mesaEstaOcupada(mesa.id);
              const seleccionada = mesaSeleccionada === mesa.id;
              return (
                <TouchableOpacity
                  key={mesa.id}
                  style={[styles.tableCard, ocupada && styles.tableOccupied, seleccionada && styles.tableSelected]}
                  onPress={() => seleccionarMesa(mesa)}
                  activeOpacity={ocupada ? 1 : 0.82}
                  accessibilityRole="button"
                  accessibilityState={{ disabled: ocupada, selected: seleccionada }}
                  accessibilityLabel={`Mesa ${mesa.id}, ${ocupada ? 'ocupada' : 'disponible'}`}>
                  <ImagenProducto tipo="bolsa" />
                  <View>
                    <Text style={styles.tableTitle}>MESA {mesa.id}</Text>
                    <Text style={[styles.tableStatus, ocupada && styles.tableStatusBusy]}>
                      {ocupada ? 'OCUPADA' : 'DISPONIBLE'}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
          {mesasFiltradas.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No encontramos esa mesa.</Text>
            </View>
          )}
          <View style={styles.selectedBox}>
            <Text style={styles.selectedTitle}>MESA SELECCIONADA:</Text>
            <Text style={styles.selectedMeta}>MESA {mesaSeleccionada}</Text>
          </View>
          <FilaAcciones tituloDerecho="CONFIRMAR" alIzquierda={() => cambiarPantalla('inicio')} alDerecha={confirmarMesa} />
        </Contenido>
      )}

      {pantalla === 'crear' && (
        <Contenido>
          <TituloConRegreso titulo="Crear Pedido" alRegresar={() => cambiarPantalla('mesa')} />
          <Text style={styles.mesaTag}>MESA: {mesaSeleccionada}</Text>
          <CajaBusqueda
            placeholder="Buscar producto..."
            value={busqueda}
            onChangeText={setBusqueda}
          />
          <View style={styles.filters}>
            {['TODOS', 'BEBIDAS', 'POSTRES', 'ALIMENTOS', 'PROMOS'].map((filtro) => (
              <TouchableOpacity
                key={filtro}
                style={[styles.filter, filtroActivo === filtro && styles.filterActive]}
                onPress={() => setFiltroActivo(filtro)}
                activeOpacity={0.8}>
                <Text style={styles.filterText}>{filtro}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {productosFiltrados.map((item) => {
            const cantidad = carrito[item.id] || 0;

            return (
              <View key={item.id} style={[styles.productRow, cantidad > 0 && styles.productRowSelected]}>
                <ImagenProducto />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.nombre}</Text>
                  <Text style={styles.available}>DISPONIBLE · {item.categoria}</Text>
                  {cantidad > 0 && (
                    <TextInput
                      style={styles.observationInput}
                      placeholder="Observaciones"
                      placeholderTextColor="#B89D8C"
                      value={notas[item.id] || ''}
                      onChangeText={(valor) => actualizarObservacion(item.id, valor)}
                      maxLength={120}
                      accessibilityLabel={`Observaciones para ${item.nombre}`}
                    />
                  )}
                </View>
                <View style={styles.quantity}>
                  <Text style={styles.price}>{formatearDinero(item.precio)}</Text>
                  {cantidad > 0 ? (
                    <View style={styles.stepper}>
                      <TouchableOpacity onPress={() => cambiarCantidad(item.id, -1)}>
                        <Text style={styles.step}>−</Text>
                      </TouchableOpacity>
                      <Text style={styles.step}>{cantidad}</Text>
                      <TouchableOpacity onPress={() => cambiarCantidad(item.id, 1)}>
                        <Text style={styles.step}>＋</Text>
                      </TouchableOpacity>
                    </View>
                  ) : (
                    <TouchableOpacity style={styles.addButton} onPress={() => cambiarCantidad(item.id, 1)}>
                      <Text style={styles.addButtonText}>AGREGAR</Text>
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            );
          })}
          {productosFiltrados.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>No hay productos con ese filtro.</Text>
            </View>
          )}
          <View style={styles.totalPanel}>
            <View style={styles.totalLine}><Text>CANTIDAD DE PRODUCTOS:</Text><Text>{cantidadProductos}</Text></View>
            <View style={styles.totalLine}><Text>TOTAL:</Text><Text>{formatearDinero(total)}</Text></View>
            <TouchableOpacity
              style={[styles.fullButton, cantidadProductos === 0 && styles.disabledButton]}
              onPress={() => cantidadProductos > 0 && cambiarPantalla('resumen')}
              activeOpacity={cantidadProductos > 0 ? 0.8 : 1}>
              <Text style={styles.fullButtonText}>REVISAR PEDIDO</Text>
            </TouchableOpacity>
          </View>
        </Contenido>
      )}

      {pantalla === 'resumen' && (
        <Contenido>
          <TituloConRegreso titulo="Resumen Del Pedido" alRegresar={() => cambiarPantalla('crear')} />
          <Text style={styles.mesaTag}>MESA: {mesaSeleccionada}</Text>
          <View style={styles.summaryCard}>
            {articulosSeleccionados.map((item) => (
              <View key={item.id} style={styles.summaryRow}>
                <ImagenProducto />
                <View style={styles.productInfo}>
                  <Text style={styles.productName}>{item.nombre}</Text>
                  <Text style={styles.note}>{item.observacion || item.nota}</Text>
                </View>
                <Text style={styles.summaryQty}>{item.cantidad}</Text>
                <Text style={styles.price}>{formatearDinero(item.precio * item.cantidad)}</Text>
              </View>
            ))}
          </View>
          <View style={styles.totalsCard}>
            <View style={styles.totalLine}><Text>SUBTOTAL:</Text><Text>{formatearDinero(subtotal)}</Text></View>
            <View style={styles.totalLine}><Text>IVA (16%):</Text><Text>{formatearDinero(iva)}</Text></View>
            <View style={styles.totalLine}><Text>TOTAL:</Text><Text>{formatearDinero(total)}</Text></View>
          </View>
          <FilaAcciones
            tituloDerecho="ENVIAR PEDIDO"
            alIzquierda={() => cambiarPantalla('crear')}
            alDerecha={enviarPedido}
          />
        </Contenido>
      )}

      {(pantalla === 'estado' || pantalla === 'listos') && (
        <Contenido>
          <TituloConRegreso
            titulo={pantalla === 'listos' ? 'Pedidos Listos' : 'Estado de Pedidos'}
            alRegresar={() => cambiarPantalla('inicio')}
          />
          <CajaBusqueda
            placeholder="Buscar por pedido, mesa o estado..."
            value={busquedaPedido}
            onChangeText={setBusquedaPedido}
          />
          {pedidosFiltrados.map((pedido) => (
            <TarjetaPedido key={pedido.id} pedido={pedido} alVerDetalles={() => abrirDetalle(pedido)} />
          ))}
          {pedidosFiltrados.length === 0 && (
            <View style={styles.emptyBox}>
              <Text style={styles.emptyText}>
                {pantalla === 'listos' ? 'No hay pedidos listos para entregar.' : 'No encontramos pedidos.'}
              </Text>
            </View>
          )}
        </Contenido>
      )}

      {pantalla === 'detalle' && pedidoSeleccionado && (
        <Contenido>
          <TituloConRegreso titulo="Detalle del Pedido" alRegresar={() => cambiarPantalla(pantallaRegresoDetalle)} />
          <Text style={styles.mesaTag}>MESA: {pedidoSeleccionado.mesa}</Text>
          <View style={styles.detailCard}>
            <View style={styles.detailHeader}>
              <ImagenProducto tipo="bolsa" />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>PEDIDO #{pedidoSeleccionado.id}</Text>
                <Text style={styles.note}>MESA: {pedidoSeleccionado.mesa}</Text>
                <Text style={styles.note}>SE PIDIÓ A LAS {pedidoSeleccionado.hora}</Text>
              </View>
              <EtiquetaEstado
                etiqueta={pedidoSeleccionado.estado}
                tono={tonoPorEstado(pedidoSeleccionado.estado)}
              />
            </View>
            <Divisor />
            <Text style={styles.sectionLabel}>PRODUCTOS:</Text>
            {pedidoSeleccionado.items.map((item, indice) => (
              <View key={`${item.id}-${indice}`} style={styles.detailProduct}>
                <View>
                  <Text style={styles.detailProductName}>{item.nombre}</Text>
                  <Text style={styles.note}>OBSERVACIÓN: {item.observacion || 'Sin observaciones'}</Text>
                </View>
                <Text>X{item.cantidad}</Text>
              </View>
            ))}
            <Divisor />
            <View style={styles.totalLine}>
              <Text style={styles.sectionLabel}>TOTAL:</Text>
              <Text style={styles.productName}>{formatearDinero(pedidoSeleccionado.total)}</Text>
            </View>
          </View>
          {pedidoSeleccionado.estado === 'LISTO' ? (
            <FilaAcciones
              tituloIzquierdo="REGRESAR"
              tituloDerecho="MARCAR ENTREGADO"
              alIzquierda={() => cambiarPantalla(pantallaRegresoDetalle)}
              alDerecha={marcarComoEntregado}
            />
          ) : (
            <TouchableOpacity style={styles.fullButton} onPress={() => cambiarPantalla(pantallaRegresoDetalle)}>
              <Text style={styles.fullButtonText}>REGRESAR</Text>
            </TouchableOpacity>
          )}
        </Contenido>
      )}
    </MarcoTelefono>
  );
}

function TarjetaPedido({ pedido, alVerDetalles }) {
  const cantidadProductos = pedido.items.reduce((total, item) => total + item.cantidad, 0);

  return (
    <View style={styles.orderCard}>
      <ImagenProducto />
      <View style={styles.productInfo}>
        <Text style={styles.productName}>PEDIDO #{pedido.id}</Text>
        <Text style={styles.note}>MESA: {pedido.mesa}</Text>
        <Text style={styles.note}>PRODUCTOS: {cantidadProductos}</Text>
        <Text style={styles.note}>TOTAL: {formatearDinero(pedido.total)}</Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.time}>{pedido.hora}</Text>
        <EtiquetaEstado etiqueta={pedido.estado} tono={tonoPorEstado(pedido.estado)} />
        <TouchableOpacity style={styles.detailButton} onPress={alVerDetalles}>
          <Text style={styles.detailButtonText}>DETALLES</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function tonoPorEstado(estado) {
  if (estado === 'LISTO' || estado === 'ENTREGADO') return 'ready';
  if (estado === 'PREPARANDO') return 'pay';
  return 'neutral';
}

function formatearDinero(valor) {
  return Number(valor || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  });
}

const styles = StyleSheet.create({
  tableGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 14, marginBottom: 34 },
  tableCard: { width: '47%', minHeight: 78, backgroundColor: '#DFB78F', borderRadius: 9, flexDirection: 'row', alignItems: 'center', padding: 12, gap: 10, shadowColor: colores.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  tableOccupied: { backgroundColor: '#FFF2E7', borderWidth: 1, borderColor: colores.danger },
  tableSelected: { borderWidth: 2, borderColor: colores.terracottaDark },
  tableTitle: { color: colores.ink, fontWeight: '900', fontSize: 13 },
  tableStatus: { color: '#00A76A', fontSize: 8, fontWeight: '900', marginTop: 4 },
  tableStatusBusy: { color: colores.danger },
  selectedBox: { borderWidth: 1, borderColor: colores.line, backgroundColor: '#FFFDF8', borderRadius: 6, padding: 16, marginBottom: 22 },
  selectedTitle: { color: colores.ink, fontSize: 12, fontWeight: '900' },
  selectedMeta: { color: colores.ink, fontSize: 10, marginTop: 6 },
  filters: { flexDirection: 'row', gap: 6, marginBottom: 22 },
  filter: { backgroundColor: '#8F6651', borderRadius: 12, paddingHorizontal: 10, paddingVertical: 5 },
  filterActive: { backgroundColor: colores.terracotta },
  filterText: { color: colores.surface, fontSize: 8, fontWeight: '900' },
  productRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#C98663', borderRadius: 6, padding: 10, marginBottom: 14, gap: 10, backgroundColor: 'rgba(255, 253, 248, 0.28)' },
  productRowSelected: { backgroundColor: '#FFFDF8', borderColor: colores.terracottaDark },
  productInfo: { flex: 1 },
  productName: { color: colores.ink, fontSize: 14, fontWeight: '900' },
  available: { color: '#00A76A', fontSize: 8, fontWeight: '900', marginTop: 4 },
  observationInput: { height: 24, borderWidth: 1, borderColor: colores.terracotta, marginTop: 8, paddingHorizontal: 8, color: colores.ink, fontSize: 10, backgroundColor: '#FFFDF8' },
  quantity: { alignItems: 'flex-end', gap: 10 },
  price: { color: colores.danger, fontSize: 10, fontWeight: '900' },
  stepper: { flexDirection: 'row', borderWidth: 1, borderColor: colores.danger, borderRadius: 4, overflow: 'hidden' },
  step: { color: colores.danger, minWidth: 24, textAlign: 'center', paddingVertical: 2, fontWeight: '900' },
  addButton: { borderWidth: 1, borderColor: colores.danger, borderRadius: 4, paddingHorizontal: 9, paddingVertical: 4 },
  addButtonText: { color: colores.danger, fontSize: 8, fontWeight: '900' },
  emptyBox: { backgroundColor: '#FFFDF8', borderRadius: 8, padding: 18, marginBottom: 14, alignItems: 'center' },
  emptyText: { color: colores.muted, fontSize: 12, fontWeight: '700' },
  totalPanel: { backgroundColor: '#FFFDF8', padding: 18, marginHorizontal: -20, marginBottom: 10, borderTopWidth: 1, borderTopColor: colores.line },
  totalLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 10 },
  fullButton: { backgroundColor: '#8F6651', height: 32, borderRadius: 16, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  disabledButton: { opacity: 0.45 },
  fullButtonText: { color: colores.surface, fontSize: 10, fontWeight: '900' },
  mesaTag: { alignSelf: 'flex-start', backgroundColor: '#D6A783', color: colores.surface, fontWeight: '900', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 3, marginBottom: 20 },
  summaryCard: { backgroundColor: '#FFFDF8', borderRadius: 10, padding: 10, marginBottom: 14, shadowColor: colores.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', gap: 10, borderBottomWidth: 1, borderBottomColor: colores.ink, paddingVertical: 12 },
  note: { color: colores.muted, fontSize: 8, marginTop: 3 },
  summaryQty: { color: colores.ink, fontWeight: '900', marginRight: 12 },
  totalsCard: { backgroundColor: '#FFFDF8', borderRadius: 10, padding: 18, marginBottom: 22 },
  orderCard: { backgroundColor: '#FFFDF8', flexDirection: 'row', alignItems: 'center', gap: 12, padding: 12, marginBottom: 12, borderRadius: 4, shadowColor: colores.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  orderRight: { alignItems: 'flex-end', gap: 6 },
  time: { fontSize: 8, color: colores.ink },
  detailButton: { borderWidth: 1, borderColor: colores.danger, paddingHorizontal: 10, paddingVertical: 4 },
  detailButtonText: { color: colores.danger, fontSize: 8, fontWeight: '900' },
  detailCard: { backgroundColor: '#FFFDF8', padding: 18, marginBottom: 28, borderRadius: 4 },
  detailHeader: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  sectionLabel: { color: colores.ink, fontSize: 10, fontWeight: '900', marginBottom: 14 },
  detailProduct: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 16 },
  detailProductName: { color: colores.ink, fontSize: 9, fontWeight: '900' },
});
