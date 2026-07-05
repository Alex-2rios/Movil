import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import {
  BarraSuperior,
  CajaBusqueda,
  Contenido,
  Divisor,
  EtiquetaEstado,
  Icono,
  MarcoTelefono,
  TituloConRegreso,
  colores,
} from '../components/TerracotaUI';
import { navegacionPorRol } from '../components/terracotaData';

export default function PantallaCocina({ pantalla, cambiarPantalla, alCerrarSesion, pedidos, alCambiarEstado }) {
  const [idPedidoSeleccionado, setIdPedidoSeleccionado] = useState(null);
  const [pantallaRegreso, setPantallaRegreso] = useState('pendientes');
  const [busqueda, setBusqueda] = useState('');

  const pedidoSeleccionado = pedidos.find((pedido) => pedido.id === idPedidoSeleccionado) || null;
  const etapa = pedidoSeleccionado?.estado.toLocaleLowerCase('es-MX') || 'pendiente';
  const configuracionListas = {
    pendientes: { titulo: 'Pedidos Pendientes', estados: ['PENDIENTE'] },
    preparacion: { titulo: 'En Preparación', estados: ['PREPARANDO'] },
    listos: { titulo: 'Listos Para Entregar', estados: ['LISTO'] },
  };
  const listaActiva = configuracionListas[pantalla];
  const consulta = busqueda.trim().toLocaleLowerCase('es-MX');
  const pedidosVisibles = listaActiva
    ? pedidos.filter((pedido) => listaActiva.estados.includes(pedido.estado))
      .filter((pedido) => !consulta || [pedido.id, pedido.mesa, pedido.estado]
        .some((valor) => String(valor).toLocaleLowerCase('es-MX').includes(consulta)))
    : [];

  const abrirPedido = (pedido) => {
    setIdPedidoSeleccionado(pedido.id);
    setPantallaRegreso(pantalla);
    cambiarPantalla('detalle');
  };

  const avanzarPedido = async () => {
    if (!pedidoSeleccionado) return;

    const siguienteEtapa = etapa === 'pendiente' ? 'preparando' : 'listo';
    const siguienteEstado = siguienteEtapa.toUpperCase();

    try {
      await alCambiarEstado(pedidoSeleccionado.id, siguienteEstado);
      setPantallaRegreso(siguienteEtapa === 'preparando' ? 'preparacion' : 'listos');
    } catch (error) {
      Alert.alert('No se pudo actualizar el pedido', error.message);
    }
  };

  return (
    <MarcoTelefono elementosNavegacion={navegacionPorRol.cocina} activo={pantalla} alNavegar={cambiarPantalla}>
      <BarraSuperior alCerrarSesion={alCerrarSesion} />

      {listaActiva && (
        <Contenido>
          <TituloConRegreso titulo={listaActiva.titulo} alRegresar={() => cambiarPantalla('inicio')} />
          <CajaBusqueda
            placeholder="Buscar por pedido, mesa o estado..."
            value={busqueda}
            onChangeText={setBusqueda}
          />
          {pedidosVisibles.map((pedido) => (
            <TouchableOpacity
              key={pedido.id}
              style={styles.kitchenRow}
              onPress={() => abrirPedido(pedido)}
              activeOpacity={0.85}>
              <View>
                <Text style={styles.orderTitle}>Pedido #{pedido.id} <Text style={styles.statusText}>{pedido.estado}</Text></Text>
                <Text style={styles.meta}>Mesa {pedido.mesa} · {cantidadArticulos(pedido)} productos</Text>
              </View>
              <View>
                <Text style={styles.meta}>{pedido.hora}</Text>
                <Icono icono="›" tamaño={26} />
              </View>
            </TouchableOpacity>
          ))}
          {pedidosVisibles.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyTitle}>Sin pedidos</Text>
              <Text style={styles.emptyMeta}>No hay pedidos en esta seccion.</Text>
            </View>
          )}
        </Contenido>
      )}

      {pantalla === 'detalle' && pedidoSeleccionado && (
        <Contenido>
          <View style={styles.detailTop}>
            <Text style={styles.bigTitle}>Pedido #{pedidoSeleccionado.id}</Text>
            <EtiquetaEstado
              etiqueta={etapa === 'listo' ? 'LISTO' : etapa === 'preparando' ? 'PREPARANDO' : 'PENDIENTE'}
              tono={etapa === 'listo' ? 'ready' : etapa === 'preparando' ? 'pay' : 'neutral'}
            />
          </View>
          <View style={styles.orderMetaRow}>
            <Text>Mesa {pedidoSeleccionado.mesa}{'\n'}{pedidoSeleccionado.hora}</Text>
            <Text>{cantidadArticulos(pedidoSeleccionado)} productos</Text>
          </View>

          <View style={styles.progressCard}>
            <Text style={styles.progressTitle}>Progreso del pedido</Text>
            <View style={styles.steps}>
              <PasoProgreso etiqueta="Recibido" activo />
              <PasoProgreso etiqueta="Preparando" activo={etapa === 'preparando' || etapa === 'listo'} />
              <PasoProgreso etiqueta="Listo" activo={etapa === 'listo'} />
            </View>
          </View>

          <View style={styles.productsCard}>
            <View style={styles.tableHeader}>
              <Text>Productos</Text>
              <Text>Cantidad:</Text>
            </View>
            <Divisor />
            {pedidoSeleccionado.items.map((producto, indice) => (
              <View key={`${producto.id}-${indice}`} style={styles.productLine}>
                <View>
                  <Text style={styles.productName}>{producto.nombre}</Text>
                  <Text style={styles.meta}>OBSERVACIÓN: {producto.observacion || 'Sin observaciones'}</Text>
                </View>
                <Text>X{producto.cantidad}</Text>
              </View>
            ))}
          </View>

          {etapa !== 'listo' ? (
            <View style={styles.actionRow}>
              <TouchableOpacity style={styles.backButton} onPress={() => cambiarPantalla(pantallaRegreso)}>
                <Text style={styles.backButtonText}>REGRESAR</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.prepButton}
                onPress={avanzarPedido}>
                <Text style={styles.prepButtonText}>{etapa === 'pendiente' ? 'INICIAR PREP.' : 'PREPARADO'}</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <Text style={styles.notice}>Pedido notificado al mesero</Text>
              <TouchableOpacity style={styles.backButtonCenter} onPress={() => cambiarPantalla('listos')}>
                <Text style={styles.backButtonText}>REGRESAR</Text>
              </TouchableOpacity>
            </>
          )}
        </Contenido>
      )}
    </MarcoTelefono>
  );
}

function cantidadArticulos(pedido) {
  return pedido.items.reduce((total, item) => total + item.cantidad, 0);
}

function PasoProgreso({ etiqueta, activo }) {
  return (
    <View style={styles.stepWrap}>
      <View style={[styles.stepCircle, activo && styles.stepActive]}>
        <Icono
          icono={etiqueta === 'Recibido' ? 'recibido' : etiqueta === 'Preparando' ? 'preparando' : 'listo'}
          tono="light"
          tamaño={etiqueta === 'Preparando' ? 18 : 20}
        />
      </View>
      <Text style={styles.stepLabel}>{etiqueta}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  kitchenRow: { backgroundColor: '#FFFDF8', padding: 16, marginBottom: 12, borderRadius: 4, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', shadowColor: colores.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  emptyState: { backgroundColor: '#FFFDF8', borderRadius: 8, padding: 24, alignItems: 'center', marginTop: 18 },
  emptyTitle: { color: colores.ink, fontSize: 18, fontWeight: '900', marginBottom: 6 },
  emptyMeta: { color: colores.muted, fontSize: 12, fontWeight: '700' },
  orderTitle: { color: colores.terracotta, fontSize: 16, fontWeight: '900' },
  statusText: { color: colores.ink, fontSize: 10 },
  meta: { color: colores.muted, fontSize: 10, marginTop: 4 },
  detailTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  bigTitle: { color: colores.terracottaDark, fontSize: 31, fontWeight: '900' },
  orderMetaRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 22 },
  progressCard: { backgroundColor: '#FFFDF8', borderRadius: 8, padding: 18, marginBottom: 20, shadowColor: colores.shadow, shadowOpacity: 0.08, shadowRadius: 7, shadowOffset: { width: 0, height: 3 }, elevation: 1 },
  progressTitle: { textAlign: 'center', color: colores.ink, fontWeight: '900', marginBottom: 18 },
  steps: { flexDirection: 'row', justifyContent: 'space-around' },
  stepWrap: { alignItems: 'center' },
  stepCircle: { width: 42, height: 42, borderRadius: 21, backgroundColor: '#DDB892', alignItems: 'center', justifyContent: 'center', borderWidth: 2, borderColor: '#DDB892' },
  stepActive: { borderColor: '#21D44C' },
  stepLabel: { color: colores.ink, fontSize: 10, marginTop: 8, fontWeight: '900' },
  productsCard: { backgroundColor: '#FFFDF8', borderRadius: 8, padding: 22, marginBottom: 70 },
  tableHeader: { flexDirection: 'row', justifyContent: 'space-between' },
  productLine: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 18 },
  productName: { color: colores.ink, fontSize: 10, fontWeight: '900' },
  actionRow: { flexDirection: 'row', gap: 28, alignItems: 'center' },
  backButton: { flex: 1, borderWidth: 1, borderColor: colores.ink, borderRadius: 16, height: 30, alignItems: 'center', justifyContent: 'center' },
  prepButton: { flex: 1, backgroundColor: '#8F6651', borderRadius: 16, height: 30, alignItems: 'center', justifyContent: 'center' },
  backButtonText: { color: colores.ink, fontSize: 10, fontWeight: '900' },
  prepButtonText: { color: colores.surface, fontSize: 10, fontWeight: '900' },
  notice: { color: colores.terracottaDark, fontSize: 20, fontWeight: '900', textAlign: 'center', marginBottom: 36 },
  backButtonCenter: { alignSelf: 'center', width: 150, borderWidth: 1, borderColor: colores.ink, borderRadius: 16, height: 30, alignItems: 'center', justifyContent: 'center' },
});
