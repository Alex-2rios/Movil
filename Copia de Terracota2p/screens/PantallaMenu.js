import React, { useState } from 'react';

import PantallaAutenticacion from './PantallaAutenticacion';
import PantallaCaja from './PantallaCaja';
import PantallaCocina from './PantallaCocina';
import PantallaInicioRol from './PantallaInicioRol';
import PantallaMesero from './PantallaMesero';

const nombresPorRol = {
  mesero: 'Luis Mesero',
  caja: 'Ana Caja',
  cocina: 'Maria Cocina',
};

export default function PantallaMenu() {
  const [sesion, setSesion] = useState(null);
  const [rol, setRol] = useState('mesero');
  const [pantalla, setPantalla] = useState('inicio');

  const irAPantalla = (siguientePantalla) => {
    setPantalla(siguientePantalla);
  };

  const cerrarSesion = () => {
    setSesion(null);
    setPantalla('inicio');
  };

  const entrarAlApartado = (rolSolicitado) => {
    const rolCascaron = nombresPorRol[rolSolicitado] ? rolSolicitado : 'mesero';

    setRol(rolCascaron);
    setSesion({
      usuario: {
        nombre: nombresPorRol[rolCascaron],
      },
    });
    setPantalla('inicio');
  };

  if (!sesion) {
    return (
      <PantallaAutenticacion
        rol={rol}
        alCambiarRol={(siguienteRol) => {
          setRol(siguienteRol);
          setPantalla('inicio');
        }}
        alEntrar={entrarAlApartado}
      />
    );
  }

  if (pantalla === 'inicio') {
    return (
      <PantallaInicioRol
        rol={rol}
        nombre={sesion.usuario.nombre}
        alNavegar={irAPantalla}
        alCerrarSesion={cerrarSesion}
      />
    );
  }

  switch (rol) {
    case 'caja':
      return (
        <PantallaCaja
          pantalla={pantalla}
          cambiarPantalla={irAPantalla}
          alCerrarSesion={cerrarSesion}
        />
      );
    case 'cocina':
      return (
        <PantallaCocina
          pantalla={pantalla}
          cambiarPantalla={irAPantalla}
          alCerrarSesion={cerrarSesion}
        />
      );
    default:
      return (
        <PantallaMesero
          pantalla={pantalla}
          cambiarPantalla={irAPantalla}
          alCerrarSesion={cerrarSesion}
        />
      );
  }
}
