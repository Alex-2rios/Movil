from __future__ import annotations

from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import Connection

from ..database import get_connection
from ..dependencies import CurrentUser, require_roles
from ..schemas import UsuarioCreate, UsuarioUpdate


router = APIRouter(prefix="/administracion", tags=["Administración"])
admin_required = require_roles("administrador")


def _get_user(connection: Connection, user_id: int) -> dict | None:
    return connection.execute(
        """
        SELECT u.id, u.nombre, u.usuario, u.activo, u.creado_en, u.actualizado_en,
               COALESCE(array_agg(r.clave ORDER BY r.clave)
                 FILTER (WHERE r.clave IS NOT NULL), ARRAY[]::varchar[]) AS roles
        FROM terracota.usuarios u
        LEFT JOIN terracota.usuario_roles ur ON ur.usuario_id = u.id
        LEFT JOIN terracota.roles r ON r.id = ur.rol_id
        WHERE u.id = %s
        GROUP BY u.id
        """,
        (user_id,),
    ).fetchone()


def _validate_roles(connection: Connection, roles: list[str]) -> None:
    found = connection.execute(
        "SELECT clave FROM terracota.roles WHERE clave = ANY(%s)", (roles,)
    ).fetchall()
    found_keys = {row["clave"] for row in found}
    missing = sorted(set(roles) - found_keys)
    if missing:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Roles inexistentes: {', '.join(missing)}.",
        )


def _assign_roles(connection: Connection, user_id: int, roles: list[str]) -> None:
    _validate_roles(connection, roles)
    connection.execute("DELETE FROM terracota.usuario_roles WHERE usuario_id = %s", (user_id,))
    connection.execute(
        """
        INSERT INTO terracota.usuario_roles(usuario_id, rol_id)
        SELECT %s, id FROM terracota.roles WHERE clave = ANY(%s)
        """,
        (user_id, roles),
    )


@router.get("/roles")
def list_roles(
    _: CurrentUser = Depends(admin_required),
    connection: Connection = Depends(get_connection),
) -> list[dict]:
    return connection.execute(
        "SELECT id, clave, nombre FROM terracota.roles ORDER BY nombre"
    ).fetchall()


@router.get("/usuarios")
def list_users(
    _: CurrentUser = Depends(admin_required),
    connection: Connection = Depends(get_connection),
) -> list[dict]:
    return connection.execute(
        """
        SELECT u.id, u.nombre, u.usuario, u.activo, u.creado_en, u.actualizado_en,
               COALESCE(array_agg(r.clave ORDER BY r.clave)
                 FILTER (WHERE r.clave IS NOT NULL), ARRAY[]::varchar[]) AS roles
        FROM terracota.usuarios u
        LEFT JOIN terracota.usuario_roles ur ON ur.usuario_id = u.id
        LEFT JOIN terracota.roles r ON r.id = ur.rol_id
        GROUP BY u.id
        ORDER BY u.nombre
        """
    ).fetchall()


@router.post("/usuarios", status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UsuarioCreate,
    _: CurrentUser = Depends(admin_required),
    connection: Connection = Depends(get_connection),
) -> dict:
    _validate_roles(connection, payload.roles)
    created = connection.execute(
        """
        INSERT INTO terracota.usuarios(nombre, usuario, password_hash)
        VALUES (%s, %s, crypt(%s, gen_salt('bf')))
        RETURNING id
        """,
        (payload.nombre, payload.usuario, payload.password),
    ).fetchone()
    _assign_roles(connection, created["id"], payload.roles)
    return _get_user(connection, created["id"])


@router.patch("/usuarios/{user_id}")
def update_user(
    user_id: int,
    payload: UsuarioUpdate,
    current: CurrentUser = Depends(admin_required),
    connection: Connection = Depends(get_connection),
) -> dict:
    existing = _get_user(connection, user_id)
    if existing is None:
        raise HTTPException(status_code=404, detail="Usuario no encontrado.")
    if user_id == current.id and payload.activo is False:
        raise HTTPException(status_code=422, detail="No puedes desactivar tu propia cuenta.")
    if user_id == current.id and payload.roles is not None and "administrador" not in payload.roles:
        raise HTTPException(status_code=422, detail="No puedes retirar tu propio rol administrador.")

    connection.execute(
        """
        UPDATE terracota.usuarios
        SET nombre = COALESCE(%s, nombre),
            activo = COALESCE(%s, activo),
            password_hash = CASE WHEN %s::text IS NULL THEN password_hash
                                 ELSE crypt(%s, gen_salt('bf')) END
        WHERE id = %s
        """,
        (payload.nombre, payload.activo, payload.password, payload.password, user_id),
    )
    if payload.roles is not None:
        _assign_roles(connection, user_id, payload.roles)
    return _get_user(connection, user_id)


@router.get("/estadisticas/resumen")
def statistics_summary(
    _: CurrentUser = Depends(admin_required),
    connection: Connection = Depends(get_connection),
) -> dict:
    totals = connection.execute(
        """
        SELECT
          (SELECT count(*) FROM terracota.usuarios WHERE activo)::integer AS usuarios_activos,
          (SELECT count(*) FROM terracota.mesas WHERE activa)::integer AS mesas_activas,
          (SELECT count(*) FROM terracota.productos WHERE disponible)::integer AS productos_disponibles,
          (SELECT count(*) FROM terracota.pedidos
             WHERE (creado_en AT TIME ZONE 'America/Mexico_City')::date =
                   (now() AT TIME ZONE 'America/Mexico_City')::date)::integer AS pedidos_hoy,
          COALESCE((SELECT total FROM terracota.vista_ventas_diarias
             WHERE fecha = (now() AT TIME ZONE 'America/Mexico_City')::date), 0) AS ventas_hoy
        """
    ).fetchone()
    states = connection.execute(
        """
        SELECT estado, count(*)::integer AS cantidad
        FROM terracota.pedidos
        WHERE (creado_en AT TIME ZONE 'America/Mexico_City')::date =
              (now() AT TIME ZONE 'America/Mexico_City')::date
        GROUP BY estado ORDER BY estado
        """
    ).fetchall()
    return {**totals, "pedidos_por_estado": states}
