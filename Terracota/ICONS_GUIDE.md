# Iconos Terracota

Puedes pasar los iconos de Bootstrap Icons de cualquiera de estas formas:

## Opcion 1: nombres

Lista el nombre del icono para cada accion.

Ejemplo:

- Login / iniciar sesion: `box-arrow-in-right`
- Header / salir: `box-arrow-right`
- Mesero / seleccionar mesa: `clipboard-plus`
- Mesero / crear pedido: `fork-knife`
- Caja / registrar pago: `cash-coin`
- Cocina / pedido pendiente: `receipt`

## Opcion 2: archivos SVG

Exporta los SVG y colocalos en:

`Terracota/assets/icons/`

Usa nombres claros:

- `login.svg`
- `logout.svg`
- `mesa.svg`
- `pedido.svg`
- `pago.svg`
- `cocina.svg`

## Donde se conectan

Los placeholders actuales estan centralizados en:

- `Terracota/components/terracotaData.js`
- `Terracota/components/TerracotaUI.js`

La app se corre y verifica con `npx`, por ejemplo:

`npx expo start`

o para export web:

`npx expo export --platform web --output-dir /tmp/terracota-web --clear`
