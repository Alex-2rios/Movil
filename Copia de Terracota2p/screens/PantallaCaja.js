import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  BarraSuperior,
  Contenido,
  Divisor,
  FilaAcciones,
  Icono,
  ImagenProducto,
  MarcoTelefono,
  TituloConRegreso,
  colores,
} from '../components/TerracotaUI';
import { metodosPago, navegacionPorRol } from '../components/terracotaData';

const pedidosMaqueta = [
  { id: '001', mesa: 'Mesa 2', descripcion: 'Pedido pendiente de pago' },
  { id: '002', mesa: 'Mesa 5', descripcion: 'Ticket por generar' },
];

const ticketsMaqueta = [
  { folio: 'T-0001', mesa: 'Mesa 1', metodo: 'Efectivo', descripcion: 'Ticket de ejemplo' },
  { folio: 'T-0002', mesa: 'Mesa 4', metodo: 'Tarjeta', descripcion: 'Ticket de ejemplo' },
];

export default function PantallaCaja({
  pantalla,
  cambiarPantalla,
  alCerrarSesion,
}) {
  const volverInicio = () => cambiarPantalla('inicio');

  return (
    <MarcoTelefono elementosNavegacion={navegacionPorRol.caja} activo={pantalla} alNavegar={cambiarPantalla}>
      <BarraSuperior alCerrarSesion={alCerrarSesion} />

      {pantalla === 'pedidos' && (
        <Contenido>
          <TituloConRegreso titulo="Pedidos pendientes" alRegresar={volverInicio} />
          <Text style={styles.helpText}>Selecciona un pedido pendiente de pago.</Text>
          {pedidosMaqueta.map((pedido) => (
            <TouchableOpacity
              key={pedido.id}
              style={styles.orderCard}
              onPress={() => cambiarPantalla('pago')}
              activeOpacity={0.85}>
              <ImagenProducto tipo="bolsa" />
              <View style={styles.flex}>
                <Text style={styles.orderTitle}>Pedido #{pedido.id}</Text>
                <Text style={styles.meta}>{pedido.mesa}</Text>
                <Text style={styles.meta}>{pedido.descripcion}</Text>
              </View>
              <Icono icono="›" tamaño={22} />
            </TouchableOpacity>
          ))}
        </Contenido>
      )}

      {pantalla === 'pago' && (
        <Contenido>
          <TituloConRegreso titulo="Registrar pago" alRegresar={() => cambiarPantalla('pedidos')} />
          <Text style={styles.helpText}>Completa los datos del pago.</Text>
          <View style={styles.paySummary}>
            <ImagenProducto tipo="bolsa" />
            <View style={styles.flex}>
              <Text style={styles.orderTitle}>Pedido seleccionado</Text>
              <Text style={styles.meta}>Datos del pedido seleccionado.</Text>
            </View>
          </View>

          <Text style={styles.sectionTitle}>Metodo de pago</Text>
          {metodosPago.map((item) => (
            <View key={item} style={styles.method}>
              <Icono
                icono={item === 'Efectivo' ? 'efectivo' : item === 'Tarjeta' ? 'tarjeta' : 'transferencia'}
                tono="brand"
                tamaño={18}
              />
              <Text style={styles.methodText}>{item}</Text>
            </View>
          ))}

          <View style={styles.formBox}>
            <Text style={styles.metaLarge}>Monto recibido</Text>
            <TextInput
              style={styles.amountInput}
              placeholder="$0.00"
              placeholderTextColor={colores.muted}
              editable={false}
            />
            <Text style={styles.meta}>Resultado del pago.</Text>
          </View>

          <FilaAcciones
            tituloDerecho="CONTINUAR"
            alIzquierda={() => cambiarPantalla('pedidos')}
            alDerecha={() => cambiarPantalla('success')}
          />
        </Contenido>
      )}

      {pantalla === 'success' && (
        <Contenido>
          <View style={styles.successIcon}>
            <Text style={styles.successCheck}>✓</Text>
          </View>
          <Text style={styles.successTitle}>Pantalla de confirmacion</Text>
          <Text style={styles.successMeta}>El pago se registro correctamente.</Text>
          <FilaAcciones
            tituloIzquierdo="PEDIDOS"
            tituloDerecho="VER TICKET"
            alIzquierda={() => cambiarPantalla('pedidos')}
            alDerecha={() => cambiarPantalla('ticketDetalle')}
          />
        </Contenido>
      )}

      {pantalla === 'ventas' && (
        <Contenido>
          <TituloConRegreso titulo="Ventas del dia" alRegresar={volverInicio} />
          <Text style={styles.helpText}>Consulta el resumen de ventas.</Text>
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Resumen de ventas</Text>
            <Text style={styles.meta}>Metricas del dia.</Text>
          </View>
          <View style={styles.reportCard}>
            <Text style={styles.reportTitle}>Metodos de pago</Text>
            <Text style={styles.meta}>Desglose por efectivo, tarjeta y transferencia.</Text>
          </View>
        </Contenido>
      )}

      {pantalla === 'tickets' && (
        <Contenido>
          <TituloConRegreso titulo="Historial de tickets" alRegresar={volverInicio} />
          <Text style={styles.helpText}>Consulta los tickets generados.</Text>
          {ticketsMaqueta.map((ticket) => (
            <TouchableOpacity
              key={ticket.folio}
              style={styles.ticketCard}
              onPress={() => cambiarPantalla('ticketDetalle')}
              activeOpacity={0.85}>
              <View>
                <Text style={styles.orderTitle}>{ticket.folio}</Text>
                <Text style={styles.meta}>{ticket.mesa}</Text>
                <Text style={styles.meta}>{ticket.metodo}</Text>
              </View>
              <Icono icono="›" tamaño={22} />
            </TouchableOpacity>
          ))}
        </Contenido>
      )}

      {pantalla === 'ticketDetalle' && (
        <Contenido>
          <TituloConRegreso titulo="Detalle del ticket" alRegresar={() => cambiarPantalla('tickets')} />
          <View style={styles.ticketDetail}>
            <Text style={styles.ticketTitle}>Ticket de ejemplo</Text>
            <Text style={styles.meta}>Mesa asignada</Text>
            <Divisor />
            <Text style={styles.meta}>Productos del pedido</Text>
            <Text style={styles.meta}>Metodo de pago</Text>
            <Text style={styles.meta}>Total del ticket</Text>
            <Divisor />
            <Text style={styles.helpText}>Detalle del ticket seleccionado.</Text>
          </View>
          <FilaAcciones
            tituloDerecho="REGRESAR"
            alIzquierda={() => cambiarPantalla('tickets')}
            alDerecha={() => cambiarPantalla('tickets')}
          />
        </Contenido>
      )}
    </MarcoTelefono>
  );
}

const styles = StyleSheet.create({
  helpText: {
    color: colores.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 18,
  },
  flex: {
    flex: 1,
  },
  orderCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  orderTitle: {
    color: colores.terracotta,
    fontSize: 16,
    fontWeight: '900',
  },
  meta: {
    color: colores.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 5,
  },
  paySummary: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 22,
    flexDirection: 'row',
    gap: 12,
    alignItems: 'center',
  },
  sectionTitle: {
    color: colores.ink,
    fontSize: 15,
    fontWeight: '900',
    marginBottom: 12,
  },
  method: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  methodText: {
    color: colores.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  formBox: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 16,
    marginVertical: 12,
  },
  metaLarge: {
    color: colores.ink,
    fontSize: 13,
    fontWeight: '900',
    marginBottom: 8,
  },
  amountInput: {
    borderBottomWidth: 1,
    borderBottomColor: colores.line,
    color: colores.muted,
    fontSize: 18,
    fontWeight: '900',
    paddingVertical: 6,
  },
  successIcon: {
    alignSelf: 'center',
    width: 82,
    height: 82,
    borderRadius: 41,
    backgroundColor: colores.success,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 34,
    marginBottom: 22,
  },
  successCheck: {
    color: colores.white,
    fontSize: 42,
    fontWeight: '900',
  },
  successTitle: {
    color: colores.terracottaDark,
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginBottom: 10,
  },
  successMeta: {
    color: colores.muted,
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 40,
  },
  reportCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 18,
    marginBottom: 14,
  },
  reportTitle: {
    color: colores.terracottaDark,
    fontSize: 18,
    fontWeight: '900',
  },
  ticketCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketDetail: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 20,
    marginBottom: 20,
  },
  ticketTitle: {
    color: colores.terracottaDark,
    fontSize: 22,
    fontWeight: '900',
    marginBottom: 8,
  },
});
