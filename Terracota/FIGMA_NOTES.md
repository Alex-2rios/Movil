# Terracota - Figma

Diseño recibido:

https://www.figma.com/design/pZgBYK7NewPtLl2SLtT7Jq/Untitled?node-id=1-400&m=dev

Nota: el archivo ya aparece como publico por oEmbed. Figma no entrego medidas exactas ni arbol de capas sin sesion/API token, pero si permitio descargar thumbnails publicos:

- `figma-thumbnail.png`
- `figma-thumbnail-large.png`

La app se implemento tomando como referencia las pantallas compartidas:

- Login comun.
- Rol mesero: seleccionar mesa, crear pedido, resumen, estado y detalle.
- Rol caja: pedidos pendientes, registrar pago, confirmacion, ventas y tickets.
- Rol cocina: pedidos pendientes, detalle y avance de estado.

La lógica se mantiene como en `practica5`: se usa `useState` y `switch` dentro de `PantallaMenu`, sin librería de navegación.
