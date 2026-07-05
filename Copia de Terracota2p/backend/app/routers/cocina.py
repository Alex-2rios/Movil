from __future__ import annotations

from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from psycopg import Connection

from ..database import get_connection
from ..dependencies import CurrentUser, require_roles
from ..queries import get_order
from ..schemas import CambioEstado


router = APIRouter(prefix="/cocina", tags=["Cocina"])
cocina_required = require_roles("cocina")


@router.get("/pedidos")
def list_kitchen_orders(
    estado: Optional[str] = None,
    _: CurrentUser = Depends(cocina_required),
    connection: Connection = Depends(get_connection),
) -> list[dict]:
    allowed = {"PENDIENTE", "PREPARANDO", "LISTO"}
    normalized = estado.upper() if estado else None
    if normalized and normalized not in allowed:
        raise HTTPException(status_code=422, detail="Estado de cocina inválido.")
    return connection.execute(
        """
        SELECT * FROM terracota.vista_pedidos_operativos
        WHERE estado = ANY(%s) AND (%s::text IS NULL OR estado = %s)
        ORDER BY creado_en
        """,
        (list(allowed), normalized, normalized),
    ).fetchall()


@router.patch("/pedidos/{order_id}/estado")
def update_order_status(
    order_id: int,
    payload: CambioEstado,
    user: CurrentUser = Depends(cocina_required),
    connection: Connection = Depends(get_connection),
) -> dict:
    if payload.estado not in {"PREPARANDO", "LISTO"}:
        raise HTTPException(status_code=422, detail="Cocina solo puede usar PREPARANDO o LISTO.")
    connection.execute(
        "SELECT id FROM terracota.cambiar_estado_pedido(%s, %s, %s, %s)",
        (order_id, payload.estado, user.id, payload.comentario),
    ).fetchone()
    return get_order(connection, order_id)
