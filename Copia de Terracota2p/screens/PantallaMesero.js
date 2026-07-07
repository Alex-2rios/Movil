import React from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import {
  BarraSuperior,
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

const mesasMaqueta = [
  { id: 1, estado: 'Disponible' },
  { id: 2, estado: 'Ocupada' },
  { id: 3, estado: 'Disponible' },
  { id: 4, estado: 'Reservada' },
];

const productosMaqueta = [
  { nombre: 'Cafe americano', categoria: 'Bebidas' },
  { nombre: 'Panini Terracota', categoria: 'Alimentos' },
  { nombre: 'Pastel de chocolate', categoria: 'Postres' },
];

const pedidosMaqueta = [
  { id: '001', mesa: 'Mesa 2', estado: 'PENDIENTE', descripcion: 'Productos seleccionados por el cliente' },
  { id: '002', mesa: 'Mesa 5', estado: 'PREPARANDO', descripcion: 'Pedido en cocina' },
  { id: '003', mesa: 'Mesa 1', estado: 'LISTO', descripcion: 'Listo para entregar' },
];

const pedidosListosMaqueta = [
  { id: '003', mesa: 'Mesa 1', estado: 'LISTO', descripcion: 'Listo para entregar' },
];

const pedidoDetalle = {
  id: '003',
  mesa: 'Mesa 1',
  estado: 'LISTO',
  productos: ['Cafe americano', 'Combo cafe + postre', 'Observaciones del cliente'],
};

export default function PantallaMesero({
  pantalla,
  cambiarPantalla,
  alCerrarSesion,
}) {
  const volverInicio = () => cambiarPantalla('inicio');
  const pedidosVisibles = pantalla === 'listos' ? pedidosListosMaqueta : pedidosMaqueta;

  return (
    <MarcoTelefono elementosNavegacion={navegacionPorRol.mesero} activo={pantalla} alNavegar={cambiarPantalla}>
      <BarraSuperior alCerrarSesion={alCerrarSesion} />

      {pantalla === 'mesa' && (
        <Contenido>
          <TituloConRegreso titulo="Seleccionar mesa" alRegresar={volverInicio} />
          <Text style={styles.helpText}>Selecciona la mesa para el pedido.</Text>
          <View style={styles.tableGrid}>
            {mesasMaqueta.map((mesa) => (
              <View key={mesa.id} style={styles.tableCard}>
                <ImagenProducto tipo="bolsa" />
                <View>
                  <Text style={styles.tableTitle}>MESA {mesa.id}</Text>
                  <Text style={styles.tableStatus}>{mesa.estado}</Text>
                </View>
              </View>
            ))}
          </View>
          <FilaAcciones
            tituloDerecho="CONTINUAR"
            alIzquierda={volverInicio}
            alDerecha={() => cambiarPantalla('crear')}
          />
        </Contenido>
      )}

      {pantalla === 'crear' && (
        <Contenido>
          <TituloConRegreso titulo="Crear pedido" alRegresar={() => cambiarPantalla('mesa')} />
          <Text style={styles.helpText}>Elige los productos para el pedido.</Text>
          {productosMaqueta.map((producto) => (
            <View key={producto.nombre} style={styles.productRow}>
              <ImagenProducto />
              <View style={styles.productInfo}>
                <Text style={styles.productName}>{producto.nombre}</Text>
                <Text style={styles.available}>{producto.categoria}</Text>
                <TextInput
                  style={styles.observationInput}
                  placeholder="Observaciones"
                  placeholderTextColor="#B89D8C"
                  editable={false}
                />
              </View>
              <View style={styles.badgeMock}>
                <Text style={styles.badgeMockText}>Agregar</Text>
              </View>
            </View>
          ))}
          <View style={styles.infoPanel}>
            <Text style={styles.infoTitle}>Resumen del pedido</Text>
            <Text style={styles.infoText}>Revisa los productos antes de continuar.</Text>
          </View>
          <FilaAcciones
            tituloDerecho="REVISAR"
            alIzquierda={() => cambiarPantalla('mesa')}
            alDerecha={() => cambiarPantalla('resumen')}
          />
        </Contenido>
      )}

      {pantalla === 'resumen' && (
        <Contenido>
          <TituloConRegreso titulo="Resumen del pedido" alRegresar={() => cambiarPantalla('crear')} />
          <View style={styles.summaryCard}>
            {pedidoDetalle.productos.map((producto) => (
              <View key={producto} style={styles.summaryRow}>
                <ImagenProducto />
                <Text style={styles.productName}>{producto}</Text>
              </View>
            ))}
            <Divisor />
            <Text style={styles.infoText}>Resumen general del pedido seleccionado.</Text>
          </View>
          <FilaAcciones
            tituloDerecho="VER ESTADO"
            alIzquierda={() => cambiarPantalla('crear')}
            alDerecha={() => cambiarPantalla('estado')}
          />
        </Contenido>
      )}

      {(pantalla === 'estado' || pantalla === 'listos') && (
        <Contenido>
          <TituloConRegreso
            titulo={pantalla === 'listos' ? 'Pedidos listos' : 'Estado del pedido'}
            alRegresar={volverInicio}
          />
          <Text style={styles.helpText}>Consulta el estado de los pedidos.</Text>
          {pedidosVisibles.map((pedido) => (
            <TouchableOpacity
              key={pedido.id}
              style={styles.orderCard}
              onPress={() => cambiarPantalla('detalle')}
              activeOpacity={0.85}>
              <View>
                <Text style={styles.orderTitle}>Pedido #{pedido.id}</Text>
                <Text style={styles.note}>{pedido.mesa}</Text>
                <Text style={styles.note}>{pedido.descripcion}</Text>
              </View>
              <EtiquetaEstado etiqueta={pedido.estado} tono={tonoPorEstado(pedido.estado)} />
            </TouchableOpacity>
          ))}
        </Contenido>
      )}

      {pantalla === 'detalle' && (
        <Contenido>
          <TituloConRegreso titulo={`Pedido #${pedidoDetalle.id}`} alRegresar={() => cambiarPantalla('estado')} />
          <View style={styles.detailCard}>
            <View style={styles.detailTop}>
              <Text style={styles.orderTitle}>{pedidoDetalle.mesa}</Text>
              <EtiquetaEstado etiqueta={pedidoDetalle.estado} tono="ready" />
            </View>
            <Divisor />
            {pedidoDetalle.productos.map((producto) => (
              <View key={producto} style={styles.detailLine}>
                <Text style={styles.productName}>{producto}</Text>
                <Text style={styles.note}>Detalle del producto</Text>
              </View>
            ))}
            <Divisor />
            <Text style={styles.infoText}>Detalle general del pedido.</Text>
          </View>
          <FilaAcciones
            tituloDerecho="REGRESAR"
            alIzquierda={() => cambiarPantalla('estado')}
            alDerecha={() => cambiarPantalla('listos')}
          />
        </Contenido>
      )}
    </MarcoTelefono>
  );
}

function tonoPorEstado(estado) {
  if (estado === 'LISTO') return 'ready';
  if (estado === 'PREPARANDO') return 'pay';
  return 'neutral';
}

const styles = StyleSheet.create({
  helpText: {
    color: colores.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginBottom: 18,
  },
  tableGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  tableCard: {
    width: '47%',
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 14,
    gap: 10,
    shadowColor: colores.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 7,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  tableTitle: {
    color: colores.ink,
    fontSize: 15,
    fontWeight: '900',
  },
  tableStatus: {
    color: colores.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  productRow: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  productInfo: {
    flex: 1,
  },
  productName: {
    color: colores.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  available: {
    color: colores.muted,
    fontSize: 10,
    fontWeight: '700',
    marginTop: 4,
  },
  observationInput: {
    borderBottomWidth: 1,
    borderBottomColor: colores.line,
    color: colores.muted,
    fontSize: 12,
    marginTop: 8,
    paddingVertical: 4,
  },
  badgeMock: {
    borderWidth: 1,
    borderColor: colores.terracotta,
    borderRadius: 14,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  badgeMockText: {
    color: colores.terracotta,
    fontSize: 10,
    fontWeight: '900',
  },
  infoPanel: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 18,
  },
  infoTitle: {
    color: colores.terracottaDark,
    fontSize: 16,
    fontWeight: '900',
    marginBottom: 6,
  },
  infoText: {
    color: colores.muted,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
  },
  summaryCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 20,
  },
  summaryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom: 12,
  },
  orderCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 14,
  },
  orderTitle: {
    color: colores.terracotta,
    fontSize: 16,
    fontWeight: '900',
  },
  note: {
    color: colores.muted,
    fontSize: 11,
    fontWeight: '700',
    marginTop: 4,
  },
  detailCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 18,
    marginBottom: 20,
  },
  detailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailLine: {
    marginBottom: 14,
  },
});
