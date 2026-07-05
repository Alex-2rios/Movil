# Base de datos PostgreSQL de Terracota

El archivo `terracota_postgresql.sql` contiene el esquema completo, catálogos,
datos iniciales, índices, restricciones, triggers, funciones y vistas. Está
preparado para PostgreSQL 14 o posterior.

## Instancia local del proyecto

La instancia local usa el contenedor `terracota-postgres`, el volumen
`terracota_pgdata` y el puerto `5432`. La configuración de desarrollo se
encuentra en `docker-compose.yml`; para otros entornos usa variables de entorno.

```bash
docker start terracota-postgres   # iniciar
docker stop terracota-postgres    # detener
docker logs terracota-postgres    # revisar registros
```

Parámetros para una extensión de PostgreSQL:

- Host: `127.0.0.1`
- Puerto: `5432`
- Base: `terracota`
- Usuario: `terracota_app`
- SSL: desactivado para desarrollo local

## Instalación desde una extensión de VS Code

1. Inicia PostgreSQL y crea una conexión administrativa en tu extensión.
2. Conéctate inicialmente a la base `postgres` y ejecuta
   `database/00_CREAR_BASE.sql` una sola vez.

3. Cambia la conexión de la extensión a la base `terracota`.
4. Abre `database/terracota_postgresql.sql` y selecciona **Run Query** o
   **Execute File**. No ejecutes ese archivo conectado a la base `postgres`.
5. Ejecuta `database/PRUEBA_FLUJO.sql`. Debe devolver un pedido, un ticket y el
   resumen del día. La prueba termina con `ROLLBACK`, por lo que no deja basura.

El usuario de PostgreSQL necesita permisos para crear esquemas y la extensión
`pgcrypto`. Si `CREATE EXTENSION` falla, ejecútalo con un usuario administrador.

## Usuarios iniciales de demostración

| Usuario | Contraseña temporal | Rol |
|---|---|---|
| `mesero` | `Cambiar123!` | Mesero |
| `cocina` | `Cambiar123!` | Cocina |
| `caja` | `Cambiar123!` | Caja |
| `admin` | `Cambiar123!` | Administrador |

Cambia estas contraseñas antes de usar datos reales. Se almacenan mediante
hash bcrypt de `pgcrypto`, nunca como texto plano.

```sql
UPDATE terracota.usuarios
SET password_hash = crypt('NuevaClaveSegura', gen_salt('bf'))
WHERE lower(usuario) = 'admin';
```

## Operaciones que consumirá la API

Autenticación:

```sql
SELECT * FROM terracota.autenticar_usuario('mesero', 'Cambiar123!');
```

Crear un pedido de forma transaccional:

```sql
SELECT *
FROM terracota.crear_pedido(
  1,
  (SELECT id FROM terracota.usuarios WHERE lower(usuario) = 'mesero'),
  '[{"producto_clave":"moka-frappe","cantidad":2,"observacion":"Sin azúcar"}]'::jsonb
);
```

Avanzar el estado desde Cocina o Mesero:

```sql
SELECT * FROM terracota.cambiar_estado_pedido(
  1, 'PREPARANDO',
  (SELECT id FROM terracota.usuarios WHERE lower(usuario) = 'cocina')
);
SELECT * FROM terracota.cambiar_estado_pedido(
  1, 'LISTO',
  (SELECT id FROM terracota.usuarios WHERE lower(usuario) = 'cocina')
);
SELECT * FROM terracota.cambiar_estado_pedido(
  1, 'ENTREGADO',
  (SELECT id FROM terracota.usuarios WHERE lower(usuario) = 'mesero')
);
```

Registrar el pago y generar automáticamente el ticket:

```sql
SELECT * FROM terracota.registrar_pago(
  1,
  (SELECT id FROM terracota.usuarios WHERE lower(usuario) = 'caja'),
  'EFECTIVO',
  200.00
);
```

Consultas útiles:

```sql
SELECT * FROM terracota.vista_pedidos_operativos ORDER BY creado_en DESC;
SELECT * FROM terracota.vista_tickets ORDER BY emitido_en DESC;
SELECT * FROM terracota.vista_ventas_diarias ORDER BY fecha DESC;
SELECT * FROM terracota.auditoria ORDER BY creado_en DESC;
```

## Arquitectura recomendada

Expo no debe conectarse directamente a PostgreSQL ni contener la contraseña de
la base de datos. La ruta correcta es:

```text
App Expo -> API HTTPS -> PostgreSQL
```

La API valida la sesión y el rol, llama las funciones SQL dentro de conexiones
protegidas y devuelve JSON. Usa `backend/.env.example` solamente como plantilla
del backend; no lo importes en React Native.

Para un despliegue real, crea un usuario exclusivo para la API en lugar de usar
`postgres`. Ejecuta lo siguiente como administrador y sustituye la contraseña:

```sql
CREATE ROLE terracota_app LOGIN PASSWORD 'CAMBIA_ESTA_CLAVE';
GRANT CONNECT ON DATABASE terracota TO terracota_app;
GRANT USAGE ON SCHEMA terracota TO terracota_app;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA terracota TO terracota_app;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA terracota TO terracota_app;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA terracota TO terracota_app;

ALTER DEFAULT PRIVILEGES IN SCHEMA terracota
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO terracota_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA terracota
  GRANT USAGE, SELECT ON SEQUENCES TO terracota_app;
ALTER DEFAULT PRIVILEGES IN SCHEMA terracota
  GRANT EXECUTE ON FUNCTIONS TO terracota_app;
```

## Qué protege el esquema

- Una mesa no puede tener dos pedidos activos simultáneamente.
- Sólo se permiten transiciones válidas de estado.
- Los precios del pedido quedan guardados como fotografía histórica.
- Los totales se recalculan automáticamente desde los detalles.
- Un pedido sólo puede pagarse una vez y únicamente después de entregarse.
- El ticket recibe un folio único y consecutivo.
- Productos y pagos relevantes quedan registrados en auditoría.
- Los importes usan `numeric(12,2)` para evitar errores de punto flotante.
