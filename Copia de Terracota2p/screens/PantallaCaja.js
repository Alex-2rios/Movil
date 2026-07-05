import React, { useMemo, useState } from 'react';
import { Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  BarraSuperior,
  CajaBusqueda,
  Contenido,
  Divisor,
  FilaAcciones,
  Icono,
  ImagenProducto,
  Logo,
  MarcoTelefono,
  TituloConRegreso,
  colores,
} from '../components/TerracotaUI';
import { metodosPago, navegacionPorRol } from '../components/terracotaData';
import { compartirTicketPdf } from '../utils/ticketPdf';

export default function PantallaCaja({
  pantalla,
  cambiarPantalla,
  alCerrarSesion,
  pedidosPendientes,
  tickets,
  alRegistrarPago,
}) {
  const [metodo, setMetodo] = useState('Efectivo');
  const [pedidoSeleccionado, setPedidoSeleccionado] = useState(null);
  const [montoRecibido, setMontoRecibido] = useState('');
  const [ultimoTicket, setUltimoTicket] = useState(null);
  const [ticketSeleccionado, setTicketSeleccionado] = useState(null);
  const [busquedaTicket, setBusquedaTicket] = useState('');
  const [busquedaPedido, setBusquedaPedido] = useState('');

  const pedidosFiltrados = useMemo(() => {
    const termino = busquedaPedido.trim().toLocaleLowerCase('es-MX');
    if (!termino) return pedidosPendientes;

    return pedidosPendientes.filter((pedido) => [pedido.id, pedido.mesa, pedido.hora]
      .some((valor) => String(valor).toLocaleLowerCase('es-MX').includes(termino)));
  }, [busquedaPedido, pedidosPendientes]);

  const ticketsFiltrados = useMemo(() => {
    const termino = busquedaTicket.trim().toLocaleLowerCase('es-MX');

    if (!termino) return tickets;

    return tickets.filter((ticket) => [
      ticket.folio,
      ticket.mesa,
      ticket.fecha,
      ticket.hora,
      ticket.metodo,
      ...ticket.items.map((item) => item.nombre),
    ].some((valor) => String(valor).toLocaleLowerCase('es-MX').includes(termino)));
  }, [busquedaTicket, tickets]);

  const cambio = useMemo(() => {
    if (!pedidoSeleccionado || metodo !== 'Efectivo') return 0;

    const recibido = Number(montoRecibido.replace(',', '.'));
    return Number.isFinite(recibido) ? Math.max(0, recibido - pedidoSeleccionado.total) : 0;
  }, [metodo, montoRecibido, pedidoSeleccionado]);

  const fechaHoy = new Date().toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
  const ticketsHoy = useMemo(
    () => tickets.filter((ticket) => ticket.fecha === fechaHoy),
    [fechaHoy, tickets],
  );
  const totalHoy = ticketsHoy.reduce((acumulado, ticket) => acumulado + ticket.total, 0);

  const iniciarPago = (pedido) => {
    setPedidoSeleccionado(pedido);
    setMetodo('Efectivo');
    setMontoRecibido('');
    cambiarPantalla('pago');
  };

  const confirmarPago = async () => {
    if (!pedidoSeleccionado) {
      Alert.alert('Selecciona un pedido', 'Primero elige un pedido pendiente de pago.');
      return;
    }

    const recibido = metodo === 'Efectivo'
      ? Number(montoRecibido.replace(',', '.'))
      : pedidoSeleccionado.total;

    if (!Number.isFinite(recibido) || recibido <= 0) {
      Alert.alert('Monto inválido', 'Ingresa el monto recibido.');
      return;
    }

    if (recibido < pedidoSeleccionado.total) {
      Alert.alert(
        'Monto insuficiente',
        `Faltan ${formatearDinero(pedidoSeleccionado.total - recibido)} para completar el pago.`,
      );
      return;
    }

    try {
      const ticketGenerado = await alRegistrarPago({
        pedido_id: pedidoSeleccionado.id,
        metodo: metodo.toLocaleUpperCase('es-MX'),
        monto_recibido: metodo === 'Efectivo' ? recibido : undefined,
      });
      setUltimoTicket(ticketGenerado);
      cambiarPantalla('success');
    } catch (error) {
      Alert.alert('No se pudo registrar el pago', error.message);
    }
  };

  const abrirTicket = (ticket) => {
    setTicketSeleccionado(ticket);
    cambiarPantalla('ticketDetalle');
  };

  const cerrarTicket = () => {
    setTicketSeleccionado(null);
    cambiarPantalla('tickets');
  };

  const compartirTicket = async () => {
    if (!ticketSeleccionado) return;
    try {
      await compartirTicketPdf(ticketSeleccionado);
    } catch (error) {
      Alert.alert('No se pudo generar el PDF', error.message);
    }
  };

  return (
    <MarcoTelefono elementosNavegacion={navegacionPorRol.caja} activo={pantalla} alNavegar={cambiarPantalla}>
      <BarraSuperior alCerrarSesion={alCerrarSesion} />

      {(pantalla === 'pedidos' || pantalla === 'pago') && (
        <Contenido>
          <TituloConRegreso titulo={pantalla === 'pedidos' ? 'Pedidos pendientes de pago' : 'Registrar Pago'} alRegresar={() => cambiarPantalla('inicio')} />
          {pantalla === 'pedidos' && (
            <CajaBusqueda
              placeholder="Buscar por pedido o mesa..."
              value={busquedaPedido}
              onChangeText={setBusquedaPedido}
            />
          )}
          {pantalla === 'pedidos' && pedidosFiltrados.map((pedido) => (
            <PedidoCaja key={`${pedido.id}-${pedido.mesa}`} pedido={pedido} alPagar={() => iniciarPago(pedido)} />
          ))}
          {pantalla === 'pedidos' && pedidosPendientes.length === 0 && (
            <View style={styles.emptyTickets}>
              <Text style={styles.emptyTicketsTitle}>No hay pagos pendientes</Text>
              <Text style={styles.emptyTicketsText}>Todos los pedidos han sido cobrados.</Text>
            </View>
          )}
          {pantalla === 'pedidos' && pedidosPendientes.length > 0 && pedidosFiltrados.length === 0 && (
            <View style={styles.emptyTickets}>
              <Text style={styles.emptyTicketsTitle}>No encontramos pedidos</Text>
              <Text style={styles.emptyTicketsText}>Prueba con otro número de pedido o mesa.</Text>
            </View>
          )}

          {pantalla === 'pago' && !pedidoSeleccionado && (
            <View style={styles.emptyTickets}>
              <Text style={styles.emptyTicketsTitle}>Selecciona un pedido</Text>
              <Text style={styles.emptyTicketsText}>Elige el pedido que deseas cobrar desde la lista de pendientes.</Text>
              <TouchableOpacity style={styles.selectOrderButton} onPress={() => cambiarPantalla('pedidos')}>
                <Text style={styles.selectOrderButtonText}>VER PEDIDOS</Text>
              </TouchableOpacity>
            </View>
          )}

          {pantalla === 'pago' && pedidoSeleccionado && (
            <>
              <View style={styles.paySummary}>
                <ImagenProducto tipo="bolsa" />
                <View style={styles.flex}>
                  <Text style={styles.orderTitle}>PEDIDO #{pedidoSeleccionado.id}</Text>
                  <Text style={styles.meta}>MESA: {pedidoSeleccionado.mesa}</Text>
                  <Text style={styles.meta}>{pedidoSeleccionado.items.length} producto(s)</Text>
                </View>
                <View>
                  <Text style={styles.meta}>TOTAL</Text>
                  <Text style={styles.total}>{formatearDinero(pedidoSeleccionado.total)}</Text>
                </View>
              </View>

              <Text style={styles.sectionTitle}>Método de pago</Text>
              {metodosPago.map((item) => (
                <TouchableOpacity
                  key={item}
                  style={[styles.method, metodo === item && styles.methodActive]}
                  onPress={() => setMetodo(item)}
                  activeOpacity={0.85}>
                  <Icono
                    icono={item === 'Efectivo' ? 'efectivo' : item === 'Tarjeta' ? 'tarjeta' : 'transferencia'}
                    tono="brand"
                    tamaño={18}
                  />
                  <Text style={styles.methodText}>{item}</Text>
                </TouchableOpacity>
              ))}

              <View style={styles.payLine}>
                <Text style={styles.metaLarge}>MONTO RECIBIDO</Text>
                {metodo === 'Efectivo' ? (
                  <View style={styles.amountInputWrap}>
                    <Text style={styles.currencyPrefix}>$</Text>
                    <TextInput
                      style={styles.amountInput}
                      value={montoRecibido}
                      onChangeText={(valor) => setMontoRecibido(valor.replace(/[^0-9.,]/g, ''))}
                      placeholder="0.00"
                      placeholderTextColor={colores.muted}
                      keyboardType="decimal-pad"
                      returnKeyType="done"
                      accessibilityLabel="Monto recibido"
                    />
                  </View>
                ) : (
                  <Text style={styles.amount}>{formatearDinero(pedidoSeleccionado.total)}</Text>
                )}
              </View>
              <View style={styles.payLine}>
                <Text style={styles.metaLarge}>CAMBIO</Text>
                <Text style={styles.amount}>{metodo === 'Efectivo' ? formatearDinero(cambio) : 'No aplica'}</Text>
              </View>
              <FilaAcciones
                tituloDerecho="CONFIRMAR PAGO"
                alIzquierda={() => cambiarPantalla('pedidos')}
                alDerecha={confirmarPago}
              />
            </>
          )}
        </Contenido>
      )}

      {pantalla === 'success' && ultimoTicket && (
        <Contenido>
          <View style={styles.successIcon}><Text style={styles.successCheck}>✓</Text></View>
          <Text style={styles.successTitle}>¡Pago Registrado!</Text>
          <Text style={styles.successMeta}>El ticket está listo para consultarse y compartir.</Text>
          <View style={styles.ticketCard}>
            <Text style={styles.orderTitle}>PEDIDO #{ultimoTicket.pedidoId}</Text>
            <Text style={styles.meta}>MESA: {ultimoTicket.mesa}</Text>
            <Divisor />
            <View style={styles.payLine}><Text>TOTAL PAGADO</Text><Text style={styles.green}>{formatearDinero(ultimoTicket.total)}</Text></View>
            <View style={styles.payLine}><Text>MÉTODO DE PAGO</Text><Text>{ultimoTicket.metodo}</Text></View>
            <View style={styles.payLine}><Text>CAMBIO ENTREGADO</Text><Text>{formatearDinero(ultimoTicket.cambio)}</Text></View>
          </View>
          <FilaAcciones
            tituloIzquierdo="PEDIDOS"
            tituloDerecho="VER TICKET"
            alIzquierda={() => {
              setPedidoSeleccionado(null);
              cambiarPantalla('pedidos');
            }}
            alDerecha={() => abrirTicket(ultimoTicket)}
          />
        </Contenido>
      )}

      {pantalla === 'ventas' && (
        <Contenido>
          <TituloConRegreso titulo="Ventas del día" alRegresar={() => cambiarPantalla('inicio')} />
          <Text style={styles.datePill}>FECHA: {fechaHoy}</Text>
          <MetricaGrande titulo="VENTAS TOTALES" valor={formatearDinero(totalHoy)} />
          <MetricaGrande titulo="PEDIDOS TOTALES" valor={String(ticketsHoy.length)} />
          <Text style={styles.sectionTitle}>Métodos de pago</Text>
          {metodosPago.map((item) => {
            const totalMetodo = ticketsHoy
              .filter((ticket) => ticket.metodo === item.toLocaleUpperCase('es-MX'))
              .reduce((acumulado, ticket) => acumulado + ticket.total, 0);
            const porcentaje = totalHoy > 0 ? Math.round((totalMetodo / totalHoy) * 100) : 0;

            return (
              <View key={item} style={styles.paymentStat}>
                <Text style={styles.methodText}>{item}</Text>
                <Text>{formatearDinero(totalMetodo)}</Text>
                <Text>{porcentaje}%</Text>
              </View>
            );
          })}
        </Contenido>
      )}

      {pantalla === 'tickets' && (
        <Contenido>
          <TituloConRegreso titulo="Historial de Tickets" alRegresar={() => cambiarPantalla('inicio')} />
          <CajaBusqueda
            placeholder="Buscar por folio, mesa o método..."
            value={busquedaTicket}
            onChangeText={setBusquedaTicket}
          />

          <View style={styles.ticketsSummaryRow}>
            <View style={styles.ticketsSummaryBox}>
              <Text style={styles.ticketsSummaryNum}>{tickets.length}</Text>
              <Text style={styles.ticketsSummaryLabel}>Tickets registrados</Text>
            </View>
            <View style={styles.ticketsSummaryBox}>
              <Text style={styles.ticketsSummaryNum}>
                ${tickets.reduce((acc, t) => acc + t.total, 0).toFixed(0)}
              </Text>
              <Text style={styles.ticketsSummaryLabel}>Total acumulado</Text>
            </View>
          </View>

          {ticketsFiltrados.map((ticket) => (
            <TarjetaTicket key={ticket.folio} ticket={ticket} alVer={() => abrirTicket(ticket)} />
          ))}
          {ticketsFiltrados.length === 0 && (
            <View style={styles.emptyTickets}>
              <Text style={styles.emptyTicketsTitle}>No encontramos tickets</Text>
              <Text style={styles.emptyTicketsText}>Prueba con otro folio, mesa o método de pago.</Text>
            </View>
          )}
        </Contenido>
      )}

      {pantalla === 'ticketDetalle' && ticketSeleccionado && (
        <Contenido>
          <TituloConRegreso titulo={`Ticket #${ticketSeleccionado.folio}`} alRegresar={cerrarTicket} />

          <View style={styles.printTicket}>
            <Logo />
            <Divisor />
            <View style={styles.ticketMetaRow}>
              <View>
                <Text style={styles.ticketMetaLabel}>FOLIO</Text>
                <Text style={styles.ticketMetaValue}>#{ticketSeleccionado.folio}</Text>
              </View>
              <View style={styles.ticketMetaCenter}>
                <Text style={styles.ticketMetaLabel}>MESA</Text>
                <Text style={styles.ticketMetaValue}>{ticketSeleccionado.mesa}</Text>
              </View>
              <View style={styles.ticketMetaRight}>
                <Text style={styles.ticketMetaLabel}>MÉTODO</Text>
                <Text style={styles.ticketMetaValue}>{ticketSeleccionado.metodo}</Text>
              </View>
            </View>
            <Text style={styles.ticketFecha}>
              {ticketSeleccionado.fecha}  ·  {ticketSeleccionado.hora}
            </Text>
            <Divisor />

            <View style={styles.ticketTableHeader}>
              <Text style={styles.ticketColProduct}>PRODUCTO</Text>
              <Text style={styles.ticketColQty}>CANT.</Text>
              <Text style={styles.ticketColPrice}>PRECIO</Text>
            </View>
            <Divisor />

            {ticketSeleccionado.items.map((item, indice) => (
              <View key={`${item.nombre}-${indice}`} style={styles.ticketItemRow}>
                <Text style={styles.ticketItemName}>{item.nombre}</Text>
                <Text style={styles.ticketItemQty}>x{item.cantidad}</Text>
                <Text style={styles.ticketItemPrice}>${(item.precio * item.cantidad).toFixed(2)}</Text>
              </View>
            ))}

            <Divisor />
            <View style={styles.payLine}>
              <Text style={styles.ticketTotalLabel}>TOTAL</Text>
              <Text style={styles.ticketTotalValue}>${ticketSeleccionado.total.toFixed(2)}</Text>
            </View>
            {ticketSeleccionado.cambio > 0 && (
              <View style={styles.payLine}>
                <Text style={styles.meta}>CAMBIO ENTREGADO</Text>
                <Text style={styles.meta}>${ticketSeleccionado.cambio.toFixed(2)}</Text>
              </View>
            )}
          </View>

          <TouchableOpacity
            style={styles.shareButton}
            onPress={compartirTicket}
            activeOpacity={0.82}
            accessibilityRole="button"
            accessibilityLabel="Simular compartir ticket">
            <Icono icono="compartir" tono="light" tamaño={16} />
            <Text style={styles.shareText}>
              SIMULAR COMPARTIR
            </Text>
          </TouchableOpacity>
        </Contenido>
      )}
    </MarcoTelefono>
  );
}

function TarjetaTicket({ ticket, alVer }) {
  const colorMetodo = ticket.metodo === 'EFECTIVO'
    ? '#4CAF50'
    : ticket.metodo === 'TARJETA'
    ? '#2196F3'
    : '#FF9800';

  return (
    <TouchableOpacity style={styles.ticketRow} onPress={alVer} activeOpacity={0.82}>
      <View style={[styles.ticketFolioBox, { backgroundColor: colorMetodo + '22', borderColor: colorMetodo }]}>
        <Text style={[styles.ticketFolioText, { color: colorMetodo }]}>#{ticket.folio}</Text>
      </View>
      <View style={styles.flex}>
        <Text style={styles.orderTitle}>Mesa {ticket.mesa}</Text>
        <Text style={styles.meta}>{ticket.fecha}  ·  {ticket.hora}</Text>
        <Text style={[styles.ticketMetodoBadge, { color: colorMetodo }]}>{ticket.metodo}</Text>
      </View>
      <View style={styles.ticketRowRight}>
        <Text style={styles.ticketTotal}>${ticket.total.toFixed(2)}</Text>
        <Text style={styles.ticketVerBtn}>VER →</Text>
      </View>
    </TouchableOpacity>
  );
}

function PedidoCaja({ pedido, alPagar }) {
  return (
    <View style={styles.cashOrder}>
      <ImagenProducto />
      <View style={styles.flex}>
        <Text style={styles.orderTitle}>PEDIDO #{pedido.id}</Text>
        <Text style={styles.meta}>MESA: {pedido.mesa}</Text>
      </View>
      <View style={styles.orderRight}>
        <Text style={styles.meta}>{pedido.hora}</Text>
        <Text style={styles.danger}>TOTAL {formatearDinero(pedido.total)}</Text>
        <TouchableOpacity style={styles.payButton} onPress={alPagar}>
          <Text style={styles.payButtonText}>PAGAR →</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function formatearDinero(valor) {
  return Number(valor || 0).toLocaleString('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 2,
  });
}

function MetricaGrande({ titulo, valor }) {
  return (
    <View style={styles.bigMetric}>
      <Text style={styles.bigMetricTitle}>{titulo}</Text>
      <Text style={styles.bigMetricValue}>{valor}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  cashOrder: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFDF8', padding: 14, marginBottom: 14, borderRadius: 6, shadowColor: colores.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  orderTitle: { color: colores.ink, fontSize: 14, fontWeight: '900' },
  meta: { color: colores.muted, fontSize: 10, fontWeight: '700', marginTop: 4 },
  orderRight: { alignItems: 'flex-end', gap: 5 },
  danger: { color: colores.danger, fontSize: 9, fontWeight: '900' },
  payButton: { backgroundColor: '#FFB15E', borderRadius: 12, paddingHorizontal: 14, paddingVertical: 5, minWidth: 70, alignItems: 'center' },
  payButtonText: { color: colores.ink, fontSize: 8, fontWeight: '900' },
  paySummary: { backgroundColor: '#FFFDF8', borderRadius: 16, padding: 16, flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 24, shadowColor: colores.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  total: { color: colores.ink, fontWeight: '900', marginTop: 8 },
  sectionTitle: { color: colores.terracotta, fontSize: 15, fontWeight: '900', marginBottom: 14 },
  method: { backgroundColor: '#FFFDF8', borderWidth: 1, borderColor: colores.line, borderRadius: 8, flexDirection: 'row', alignItems: 'center', gap: 12, padding: 15, marginBottom: 10 },
  methodActive: { backgroundColor: '#D4AE98', borderColor: colores.terracotta },
  methodText: { color: colores.terracotta, fontSize: 14, fontWeight: '900' },
  payLine: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  metaLarge: { color: colores.muted, fontSize: 13, fontWeight: '900' },
  amountInputWrap: { minWidth: 116, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colores.line, backgroundColor: '#FFFDF8', paddingHorizontal: 12 },
  currencyPrefix: { color: colores.ink, fontSize: 15, fontWeight: '900' },
  amountInput: { minWidth: 80, paddingHorizontal: 5, paddingVertical: 8, color: colores.ink, fontSize: 15, fontWeight: '900', textAlign: 'right' },
  amount: { color: colores.ink, fontWeight: '900' },
  selectOrderButton: { marginTop: 18, backgroundColor: colores.terracottaDark, borderRadius: 7, paddingHorizontal: 24, paddingVertical: 11 },
  selectOrderButtonText: { color: colores.surface, fontSize: 11, fontWeight: '900' },
  successIcon: { width: 96, height: 96, borderRadius: 48, alignSelf: 'center', backgroundColor: colores.terracotta, alignItems: 'center', justifyContent: 'center', marginTop: 40 },
  successCheck: { color: colores.surface, fontSize: 66, fontWeight: '900' },
  successTitle: { color: colores.ink, fontSize: 20, fontWeight: '900', textAlign: 'center', marginTop: 30 },
  successMeta: { color: colores.terracotta, fontSize: 11, textAlign: 'center', marginBottom: 30 },
  ticketCard: { backgroundColor: '#FFFDF8', borderRadius: 8, padding: 22, marginBottom: 28 },
  green: { color: colores.success, fontWeight: '900' },
  datePill: { backgroundColor: '#FFFDF8', borderRadius: 20, textAlign: 'center', paddingVertical: 10, marginBottom: 20, fontWeight: '900' },
  bigMetric: { backgroundColor: '#FFFDF8', borderWidth: 1, borderColor: colores.line, borderRadius: 10, padding: 20, marginBottom: 20, alignItems: 'center', shadowColor: colores.shadow, shadowOpacity: 0.07, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  bigMetricTitle: { color: colores.terracotta, fontSize: 24, fontWeight: '900', fontStyle: 'italic' },
  bigMetricValue: { color: '#555', fontSize: 34, fontWeight: '900' },
  paymentStat: { backgroundColor: '#FFFDF8', flexDirection: 'row', justifyContent: 'space-between', padding: 16, borderBottomWidth: 1, borderBottomColor: colores.line },
  shareButton: { alignSelf: 'center', backgroundColor: '#8F6651', borderRadius: 8, paddingHorizontal: 48, paddingVertical: 14, flexDirection: 'row', alignItems: 'center', gap: 10 },
  shareText: { color: colores.surface, fontWeight: '900' },

  ticketsSummaryRow: { flexDirection: 'row', gap: 14, marginBottom: 20 },
  ticketsSummaryBox: { flex: 1, backgroundColor: '#FFFDF8', borderRadius: 10, padding: 16, alignItems: 'center', borderWidth: 1, borderColor: colores.line, shadowColor: colores.shadow, shadowOpacity: 0.07, shadowRadius: 6, shadowOffset: { width: 0, height: 2 }, elevation: 1 },
  ticketsSummaryNum: { color: colores.terracottaDark, fontSize: 28, fontWeight: '900' },
  ticketsSummaryLabel: { color: colores.muted, fontSize: 10, fontWeight: '700', marginTop: 2 },
  emptyTickets: { alignItems: 'center', backgroundColor: '#FFFDF8', borderRadius: 10, padding: 24 },
  emptyTicketsTitle: { color: colores.ink, fontSize: 15, fontWeight: '900' },
  emptyTicketsText: { color: colores.muted, fontSize: 11, marginTop: 6, textAlign: 'center' },

  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 12, backgroundColor: '#FFFDF8', borderRadius: 8, padding: 14, marginBottom: 12, shadowColor: colores.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  ticketFolioBox: { width: 52, height: 52, borderRadius: 8, borderWidth: 1, alignItems: 'center', justifyContent: 'center' },
  ticketFolioText: { fontSize: 9, fontWeight: '900', textAlign: 'center' },
  ticketMetodoBadge: { fontSize: 8, fontWeight: '900', marginTop: 4 },
  ticketRowRight: { alignItems: 'flex-end', gap: 6 },
  ticketTotal: { color: colores.terracottaDark, fontSize: 15, fontWeight: '900' },
  ticketVerBtn: { color: colores.terracotta, fontSize: 9, fontWeight: '900' },

  printTicket: { backgroundColor: '#FFFDF8', borderRadius: 8, padding: 22, marginBottom: 18 },
  ticketMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginVertical: 14 },
  ticketMetaCenter: { alignItems: 'center' },
  ticketMetaRight: { alignItems: 'flex-end' },
  ticketMetaLabel: { color: colores.muted, fontSize: 9, fontWeight: '700' },
  ticketMetaValue: { color: colores.ink, fontSize: 13, fontWeight: '900', marginTop: 2 },
  ticketFecha: { color: colores.muted, fontSize: 10, fontWeight: '700', textAlign: 'center', marginBottom: 4 },
  ticketTableHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  ticketColProduct: { flex: 1, color: colores.muted, fontSize: 9, fontWeight: '900' },
  ticketColQty: { width: 36, color: colores.muted, fontSize: 9, fontWeight: '900', textAlign: 'center' },
  ticketColPrice: { width: 60, color: colores.muted, fontSize: 9, fontWeight: '900', textAlign: 'right' },
  ticketItemRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 6, borderBottomWidth: 1, borderBottomColor: '#F0E8DE' },
  ticketItemName: { flex: 1, color: colores.ink, fontSize: 10, fontWeight: '700' },
  ticketItemQty: { width: 36, color: colores.muted, fontSize: 10, fontWeight: '900', textAlign: 'center' },
  ticketItemPrice: { width: 60, color: colores.ink, fontSize: 10, fontWeight: '900', textAlign: 'right' },
  ticketTotalLabel: { color: colores.ink, fontSize: 13, fontWeight: '900' },
  ticketTotalValue: { color: colores.terracottaDark, fontSize: 16, fontWeight: '900' },
});
