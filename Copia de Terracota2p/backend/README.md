# Terracota API

API REST construida con FastAPI, JWT, Pydantic y PostgreSQL. La documentación
interactiva queda disponible en `http://localhost:8080/docs`; las rutas `/` y
`/forms` redirigen a la misma interfaz.

## Inicio rápido con Docker

Desde la carpeta `Terracota2p`:

```bash
docker compose up --build
```

Esto inicia PostgreSQL en el puerto `5433` y el API en `8080`. El volumen de
PostgreSQL conserva los datos. Si cambias los scripts de inicialización y deseas
crear la base nuevamente, ejecuta `docker compose down -v` únicamente cuando no
necesites conservar esos datos.

Usuarios de demostración:

| Usuario | Contraseña | Rol |
|---|---|---|
| `mesero` | `Cambiar123!` | Mesero |
| `cocina` | `Cambiar123!` | Cocina |
| `caja` | `Cambiar123!` | Caja |
| `admin` | `Cambiar123!` | Administrador |

## Aplicación Expo

Copia `.env.example` como `.env.local` y coloca una dirección accesible desde
el dispositivo. En un teléfono físico no uses `127.0.0.1`; usa la IP LAN de la
computadora, por ejemplo:

```env
EXPO_PUBLIC_API_URL=http://192.168.1.20:8080/api/v1
```

Después inicia Expo con `npm start`. El teléfono y la computadora deben estar
en la misma red. Para producción se debe usar HTTPS y secretos diferentes a los
valores locales de `docker-compose.yml`.

## Pruebas

```bash
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements-dev.txt
pytest
ruff check app tests
```

La colección `postman/Terracota.postman_collection.json` cubre autenticación y
el flujo Mesero -> Cocina -> Mesero -> Caja, además de usuarios, roles y
estadísticas. Ejecuta las solicitudes en el orden en que aparecen; la colección
guarda automáticamente el identificador del pedido.
