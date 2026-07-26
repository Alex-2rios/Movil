import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BarraSuperior,
  BotonRol,
  Contenido,
  Icono,
  MarcoTelefono,
  colores,
} from '../components/TerracotaUI';
import { inicioPorRol, navegacionPorRol } from '../components/terracotaData';

export default function PantallaInicioRol({ rol, nombre, pedidos, alNavegar, alCerrarSesion }) {
  const inicio = inicioPorRol[rol];
  const estadisticas = rol === 'cocina'
    ? inicio.estadisticas.map((estadistica) => ({
      ...estadistica,
      valor: estadistica.etiqueta === 'Pedidos pendientes'
        ? pedidos.filter((pedido) => pedido.estado === 'PENDIENTE').length
        : pedidos.filter((pedido) => pedido.estado === 'PREPARANDO').length,
    }))
    : inicio.estadisticas;

  return (
    <MarcoTelefono
      elementosNavegacion={navegacionPorRol[rol]}
      activo="inicio"
      alNavegar={alNavegar}>
      <BarraSuperior alCerrarSesion={alCerrarSesion} />
      <Contenido>
        <View style={styles.hero}>
          <Text style={styles.title}>Bienvenido, {nombre}</Text>
          <Text style={styles.rolTexto}>{inicio.etiqueta}</Text>
        </View>

        {estadisticas && (
          <View style={styles.statsRow}>
            {estadisticas.map((estadistica) => (
              <View key={estadistica.etiqueta} style={styles.statBox}>
                <Icono icono={estadistica.icono} tamaño={18} />
                <Text style={styles.statValue}>{estadistica.valor}</Text>
                <Text style={styles.statLabel}>{estadistica.etiqueta}</Text>
              </View>
            ))}
          </View>
        )}

        <View style={styles.actions}>
          {inicio.acciones.map((accion) => (
            <BotonRol
              key={accion.clave}
              icono={accion.icono}
              titulo={accion.titulo}
              variante={accion.contorno ? 'outline' : 'filled'}
              onPress={() => alNavegar(accion.clave)}
            />
          ))}
        </View>
      </Contenido>
    </MarcoTelefono>
  );
}

const styles = StyleSheet.create({
  hero: {
    marginBottom: 66,
  },
  title: {
    color: colores.ink,
    fontSize: 28,
    fontWeight: '900',
    marginBottom: 14,
  },
  rolTexto: {
    color: colores.muted,
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 20,
    marginBottom: 48,
  },
  statBox: {
    flex: 1,
    minHeight: 93,
    backgroundColor: '#FFFDF8',
    borderRadius: 12,
    padding: 16,
    shadowColor: colores.shadow,
    shadowOpacity: 0.08,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 3 },
    elevation: 1,
  },
  statValue: {
    color: colores.terracottaDark,
    fontSize: 42,
    fontWeight: '900',
    position: 'absolute',
    right: 20,
    top: 12,
  },
  statLabel: {
    color: colores.ink,
    fontSize: 13,
    marginTop: 22,
  },
  actions: {
    marginTop: 4,
  },
});
