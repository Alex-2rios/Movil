import React, { useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BotonPrincipal, CampoTexto, ContenedorPantalla, Logo, colores } from '../components/TerracotaUI';
import { roles } from '../components/terracotaData';

export default function PantallaAutenticacion({ rol, alCambiarRol, alEntrar }) {
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');

  return (
    <ContenedorPantalla scroll={false}>
      <View style={styles.page}>
        <View style={styles.brandBlock}>
          <Logo />
          <View style={styles.logoLine} />
        </View>

        <View style={styles.card}>
          <Text style={styles.instructions}>Ingresa tu usuario y contraseña</Text>

          <CampoTexto
            etiqueta="Usuario"
            placeholder="Usuario"
            value={usuario}
            onChangeText={setUsuario}
            icono="usuario"
          />
          <CampoTexto
            etiqueta="Contraseña"
            placeholder="Contraseña"
            secureTextEntry={!mostrarContraseña}
            icono="candado"
            iconoDerecho="ojo"
            value={contraseña}
            onChangeText={setContraseña}
            alPresionarDerecha={() => setMostrarContraseña(!mostrarContraseña)}
          />

          <View style={styles.roleSelector}>
            {roles.map((item) => (
              <TouchableOpacity
                key={item.clave}
                style={[styles.roleChip, rol === item.clave && styles.roleChipActive]}
                onPress={() => {
                  alCambiarRol(item.clave);
                }}
                activeOpacity={0.8}>
                <Text style={[styles.roleChipText, rol === item.clave && styles.roleChipTextActive]}>
                  {item.etiqueta}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.roleHint}>Apartado seleccionado: {roles.find((item) => item.clave === rol)?.etiqueta}</Text>

          <BotonPrincipal
            titulo="Entrar al apartado"
            onPress={() => alEntrar(rol)}
            style={styles.submit}
            icono="ingresar"
          />

          <Text style={styles.helper}>Selecciona el apartado al que deseas entrar.</Text>
        </View>
      </View>
    </ContenedorPantalla>
  );
}

const styles = StyleSheet.create({
  page: {
    flex: 1,
    justifyContent: 'flex-start',
    paddingHorizontal: 34,
    paddingTop: 118,
    backgroundColor: colores.background,
  },
  brandBlock: {
    marginBottom: 42,
  },
  logoLine: {
    height: 1,
    backgroundColor: colores.ink,
    opacity: 0.72,
    marginTop: 18,
    marginHorizontal: 4,
  },
  card: {
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
  },
  instructions: {
    color: colores.muted,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 28,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 8,
  },
  roleChip: {
    flex: 1,
    height: 30,
    borderWidth: 1,
    borderColor: '#D8C7BB',
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFDF8',
  },
  roleHint: {
    color: colores.muted,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 18,
  },
  roleChipActive: {
    backgroundColor: colores.terracottaDark,
    borderColor: colores.terracottaDark,
  },
  roleChipText: {
    color: colores.muted,
    fontSize: 10,
    fontWeight: '900',
  },
  roleChipTextActive: {
    color: colores.surface,
  },
  submit: {
    marginTop: 4,
  },
  helper: {
    color: colores.terracotta,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 36,
    lineHeight: 18,
  },
});
