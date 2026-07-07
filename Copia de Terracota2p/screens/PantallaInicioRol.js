import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import {
  BarraSuperior,
  BotonRol,
  Contenido,
  MarcoTelefono,
  colores,
} from '../components/TerracotaUI';
import { inicioPorRol, navegacionPorRol } from '../components/terracotaData';

export default function PantallaInicioRol({ rol, nombre, alNavegar, alCerrarSesion }) {
  const inicio = inicioPorRol[rol];

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
    marginBottom: 42,
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
  },
  helper: {
    color: colores.terracotta,
    fontSize: 12,
    fontWeight: '700',
    lineHeight: 18,
    marginTop: 14,
  },
  actions: {
    marginTop: 4,
  },
});
