# Terracota 2P

Entrega del segundo parcial: backend REST funcional y frontend móvil Expo para
los módulos **Mesero, Cocina y Caja**. La interfaz web queda fuera del alcance;
el API sí conserva administración de usuarios, roles y estadísticas para una
integración futura.

## Contenido entregado

- API FastAPI con JWT, autorización por roles y PostgreSQL.
- Flujo completo: pedido, preparación, entrega, cobro y ticket PDF.
- Interfaces móviles para Mesero, Cocina y Caja.
- Administración API de usuarios/roles y resumen de estadísticas.
- Base de datos con reglas de negocio, auditoría, vistas y datos de demostración.
- Colección Postman con pruebas ordenadas de los endpoints principales.
- Docker Compose para levantar API y base de datos en un comando.

## Ejecutar backend

Requiere Docker Desktop. Desde esta carpeta:

```bash
docker compose up -d
curl http://localhost:8080/health
```

Si Docker Hub no está disponible pero las imágenes ya existen localmente:

```bash
docker compose up -d --no-build --pull never
```

Usa `docker compose up --build -d` solamente cuando necesites reconstruir el
API y tengas conexión con Docker Hub.

Swagger queda en `http://localhost:8080/docs`; `/forms` y la raíz `/` también
redirigen a esa interfaz. PostgreSQL se publica en el puerto `5433` para no
interferir con otra instalación local.

Usuarios de demostración (contraseña `Cambiar123!`):

| Usuario | Rol |
|---|---|
| `mesero` | Mesero |
| `cocina` | Cocina |
| `caja` | Caja |
| `admin` | Administrador |

## Ejecutar en el teléfono

1. Instala dependencias con `npm install`.
2. Copia `.env.example` a `.env.local`.
3. Sustituye la IP por la IP LAN de la computadora; no uses `127.0.0.1` en un
   teléfono físico.
4. Ejecuta `npm start` y abre el QR con Expo Go.

Ejemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:8080/api/v1
```

## Pruebas Postman

Importa estos dos archivos:

- `postman/Terracota.postman_collection.json`
- `postman/Terracota.postman_environment.json`

Selecciona el entorno **Terracota local** y ejecuta la colección en orden. Las
pruebas guardan automáticamente tokens e identificadores para recorrer Mesero →
Cocina → entrega → Caja. La documentación detallada del backend está en
`backend/README.md`.

## Arquitectura

```text
Expo móvil -> API FastAPI/JWT -> PostgreSQL
```

La aplicación móvil nunca se conecta directamente a PostgreSQL. En producción
se deben cambiar las credenciales de demostración, el secreto JWT y publicar el
API mediante HTTPS.
