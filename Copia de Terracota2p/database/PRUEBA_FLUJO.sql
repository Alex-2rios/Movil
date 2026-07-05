BEGIN;
SET search_path TO terracota, public;

DO $$
DECLARE
  mesero_id bigint;
  cocina_id bigint;
  cajero_id bigint;
  pedido_id bigint;
BEGIN
  SELECT id INTO mesero_id FROM usuarios WHERE lower(usuario) = 'mesero';
  SELECT id INTO cocina_id FROM usuarios WHERE lower(usuario) = 'cocina';
  SELECT id INTO cajero_id FROM usuarios WHERE lower(usuario) = 'caja';

  SELECT id INTO pedido_id
  FROM crear_pedido(
    1,
    mesero_id,
    '[
      {"producto_clave":"moka-frappe","cantidad":2,"observacion":"Leche deslactosada"},
      {"producto_clave":"brownie","cantidad":1,"observacion":"Caliente"}
    ]'::jsonb,
    'Pedido de prueba desde la extensión'
  );

  PERFORM cambiar_estado_pedido(pedido_id, 'PREPARANDO', cocina_id, 'Cocina inició el pedido');
  PERFORM cambiar_estado_pedido(pedido_id, 'LISTO', cocina_id, 'Pedido terminado');
  PERFORM cambiar_estado_pedido(pedido_id, 'ENTREGADO', mesero_id, 'Entregado en mesa');
  PERFORM registrar_pago(pedido_id, cajero_id, 'EFECTIVO', 300.00, NULL);
END;
$$;

SELECT * FROM vista_pedidos_operativos ORDER BY id DESC LIMIT 1;
SELECT * FROM vista_tickets ORDER BY id DESC LIMIT 1;
SELECT * FROM vista_ventas_diarias ORDER BY fecha DESC LIMIT 1;

ROLLBACK;
