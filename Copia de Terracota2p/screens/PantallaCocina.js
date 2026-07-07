import React from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BarraSuperior,
  Contenido,
  Divisor,
  EtiquetaEstado,
  Icono,
  MarcoTelefono,
  TituloConRegreso,
  colores,
} from '../components/TerracotaUI';
import { navegacionPorRol } from '../components/terracotaData';

const pedidosPorVista = {
  pendientes: [
    { id: '001', mesa: 'Mesa 2', estado: 'PENDIENTE', descripcion: 'Pedido pendiente de iniciar' },
    { id: '004', mesa: 'Mesa 6', estado: 'PENDIENTE', descripcion: 'Pedido de ejemplo' },
  ],
  preparacion: [
    { id: '002', mesa: 'Mesa 5', estado: 'PREPARANDO', descripcion: 'Pedido en preparacion' },
  ],
  listos: [
    { id: '003', mesa: 'Mesa 1', estado: 'LISTO', descripcion: 'Pedido listo para entregar' },
  ],
};

const pedidoDetalle = {
  id: '002',
  mesa: 'Mesa 5',
  estado: 'PREPARANDO',
  productos: ['Panini Terracota', 'Cafe americano', 'Observaciones del cliente'],
};

const configuracionListas = {
  pendientes: { titulo: 'Pedidos pendientes' },
  preparacion: { titulo: 'En preparacion' },
  listos: { titulo: 'Listos para entregar' },
};

export default function PantallaCocina({ pantalla, cambiarPantalla, alCerrarSesion }) {
  const listaActiva = configuracionListas[pantalla];
  const pedidos = pedidosPorVista[pantalla] || [];

  return (
    <MarcoTelefono elementosNavegacion={navegacionPorRol.cocina} activo={pantalla} alNavegar={cambiarPantalla}>
      <BarraSuperior alCerrarSesion={alCerrarSesion} />

      {listaActiva && (
        <Contenido>
          <TituloConRegreso titulo={listaActiva.titulo} alRegresar={() => cambiarPantalla('inicio')} />
          <Text style={styles.helpText}>Consulta los pedidos de cocina.</Text>
          {pedidos.map((pedido) => (
            <TouchableOpacity
              key={pedido.id}
              style={styles.kitchenRow}
              onPress={() => cambiarPantalla('detalle')}
              activeOpacity={0.85}>
              <View style={styles.flex}>
                <Text style={styles.orderTitle}>Pedido #{pedido.id}</Text>
                <Text style={styles.meta}>{pedido.mesa}</Text>
                <Text style={styles.meta}>{pedido.descripcion}</Text>
              </View>
              <EtiquetaEstado etiqueta={pedido.estado} tono={tonoPorEstado(pedido.estado)} />
            </TouchableOpacity>
          ))}
        </Contenido>
      )}

      {pantalla === 'detalle' && (
        <Contenido>
          <View style={styles.detailTop}>
            <Text style={styles.bigTitle}>Pedido #{pedidoDetalle.id}</Text>
            <EtiquetaEstado etiqueta={pedidoDetalle.estado} tono="pay" />
          </View>
          <View style={styles.orderMetaRow}>
            <Text style={styles.meta}>{pedidoDetalle.mesa}</Text>
            <Text style={styles.meta}>Datos del pedido</Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Progreso del pedido</Text>
            <View style={styles.steps}>
              <PasoProgreso etiqueta="Recibido" activo />
              <PasoProgreso etiqueta="Preparando" activo />
              <PasoProgreso etiqueta="Listo" />
            </View>
          </View>

          <View style={styles.productsCard}>
            <Text style={styles.progressTitle}>Productos</Text>
            <Divisor />
            {pedidoDetalle.productos.map((producto) => (
              <View key={producto} style={styles.productLine}>
                <Text style={styles.productName}>{producto}</Text>
                <Text style={styles.meta}>Detalle del producto</Text>
              </View>
            ))}
          </View>

          <View style={styles.actionRow}>
            <TouchableOpacity style={styles.backButton} onPress={() => cambiarPantalla('pendientes')}>
              <Text style={styles.backButtonText}>REGRESAR</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.prepButton} onPress={() => cambiarPantalla('preparacion')}>
              <Text style={styles.prepButtonText}>VER PREPARACION</Text>
            </TouchableOpacity>
          </View>
        </Contenido>
      )}
    </MarcoTelefono>
  );
}

function PasoProgreso({ etiqueta, activo }) {
  return (
    <View style={styles.stepWrap}>
      <View style={[styles.stepCircle, activo && styles.stepActive]}>
        <Icono
          icono={etiqueta === 'Recibido' ? 'recibido' : etiqueta === 'Preparando' ? 'preparando' : 'listo'}
          tono="light"
          tamaño={18}
        />
      </View>
      <Text style={styles.stepLabel}>{etiqueta}</Text>
    </View>
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
  flex: {
    flex: 1,
  },
  kitchenRow: {
    backgroundColor: '#FFFDF8',
    padding: 16,
    marginBottom: 12,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
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
    marginTop: 4,
  },
  detailTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  bigTitle: {
    color: colores.terracottaDark,
    fontSize: 28,
    fontWeight: '900',
  },
  orderMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  progressCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 18,
    marginBottom: 20,
  },
  progressTitle: {
    textAlign: 'center',
    color: colores.ink,
    fontWeight: '900',
    marginBottom: 18,
  },
  steps: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  stepWrap: {
    alignItems: 'center',
  },
  stepCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#DDB892',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#DDB892',
  },
  stepActive: {
    borderColor: '#21D44C',
  },
  stepLabel: {
    color: colores.ink,
    fontSize: 10,
    marginTop: 8,
    fontWeight: '900',
  },
  productsCard: {
    backgroundColor: '#FFFDF8',
    borderRadius: 8,
    padding: 18,
    marginBottom: 24,
  },
  productLine: {
    marginBottom: 14,
  },
  productName: {
    color: colores.ink,
    fontSize: 13,
    fontWeight: '900',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 18,
    alignItems: 'center',
  },
  backButton: {
    flex: 1,
    borderWidth: 1,
    borderColor: colores.ink,
    borderRadius: 16,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  prepButton: {
    flex: 1,
    backgroundColor: '#8F6651',
    borderRadius: 16,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButtonText: {
    color: colores.ink,
    fontSize: 10,
    fontWeight: '900',
  },
  prepButtonText: {
    color: colores.surface,
    fontSize: 10,
    fontWeight: '900',
  },
});
