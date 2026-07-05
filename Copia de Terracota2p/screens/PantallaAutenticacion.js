import React, { useState } from 'react';
import { Alert, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BotonPrincipal, CampoTexto, ContenedorPantalla, Logo, colores } from '../components/TerracotaUI';
import { roles } from '../components/terracotaData';

export default function PantallaAutenticacion({ rol, alCambiarRol, alEntrar, alEntrarDemo }) {
  const [mostrarContraseña, setMostrarContraseña] = useState(false);
  const [usuario, setUsuario] = useState('');
  const [contraseña, setContraseña] = useState('');
  const [cargando, setCargando] = useState(false);

  const ingresar = async () => {
    if (!usuario.trim() || !contraseña) {
      Alert.alert('Datos incompletos', 'Ingresa tu usuario y contraseña.');
      return;
    }
    try {
      setCargando(true);
      await alEntrar(usuario, contraseña, rol);
    } catch (error) {
      Alert.alert('No se pudo iniciar sesión', error.message);
    } finally {
      setCargando(false);
    }
  };

  const ingresarDemo = () => {
    if (alEntrarDemo) {
      alEntrarDemo(rol);
    }
  };

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
                onPress={() => alCambiarRol(item.clave)}
                activeOpacity={0.8}>
                <Text style={[styles.roleChipText, rol === item.clave && styles.roleChipTextActive]}>
                  {item.etiqueta}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
          <Text style={styles.roleHint}>Entraras como: {roles.find((item) => item.clave === rol)?.etiqueta}</Text>

          <BotonPrincipal
            titulo={cargando ? 'Ingresando...' : 'Iniciar sesión'}
            onPress={cargando ? undefined : ingresar}
            style={styles.submit}
            icono="ingresar"
          />

          <TouchableOpacity
            style={styles.demoButton}
            onPress={ingresarDemo}
            activeOpacity={0.8}>
            <Text style={styles.demoButtonText}>Entrar (Modo Demo Offline)</Text>
          </TouchableOpacity>

          <Text style={styles.helper}>Roles permitidos: Mesero / Caja / Cocina</Text>
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
    marginBottom: 14,
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
  demoButton: {
    height: 48,
    borderWidth: 1.5,
    borderColor: colores.terracotta,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 12,
  },
  demoButtonText: {
    color: colores.terracotta,
    fontSize: 13,
    fontWeight: 'bold',
  },
  helper: {
    color: colores.terracotta,
    fontSize: 11,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 164,
  },
});
