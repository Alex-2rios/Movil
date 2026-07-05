from fastapi import APIRouter, Depends, HTTPException, status
from psycopg import Connection
from psycopg.types.json import Jsonb

from ..database import get_connection
from ..dependencies import CurrentUser, require_roles
from ..queries import get_order
from ..schemas import CambioEstado, PedidoCreate


router = APIRouter(prefix="/mesero", tags=["Mesero"])
mesero_required = require_roles("mesero")


@router.get("/pedidos")
def list_my_orders(
    user: CurrentUser = Depends(mesero_required),
    connection: Connection = Depends(get_connection),
) -> list[dict]:
    if "administrador" in user.roles:
        return connection.execute(
            "SELECT * FROM terracota.vista_pedidos_operativos ORDER BY creado_en DESC"
        ).fetchall()
    return connection.execute(
        """
        SELECT v.* FROM terracota.vista_pedidos_operativos v
        JOIN terracota.pedidos p ON p.id = v.id
        WHERE p.mesero_id = %s
        ORDER BY v.creado_en DESC
        """,
        (user.id,),
    ).fetchall()


@router.post("/pedidos", status_code=status.HTTP_201_CREATED)
def create_order(
    payload: PedidoCreate,
    user: CurrentUser = Depends(mesero_required),
    connection: Connection = Depends(get_connection),
) -> dict:
    items = [item.model_dump(exclude_none=True) for item in payload.items]
    created = connection.execute(
        "SELECT id FROM terracota.crear_pedido(%s, %s, %s, %s)",
        (payload.mesa, user.id, Jsonb(items), payload.notas),
    ).fetchone()
    return get_order(connection, created["id"])


@router.patch("/pedidos/{order_id}/entregar")
def deliver_order(
    order_id: int,
    payload: CambioEstado,
    user: CurrentUser = Depends(mesero_required),
    connection: Connection = Depends(get_connection),
) -> dict:
    if payload.estado != "ENTREGADO":
        raise HTTPException(status_code=422, detail="Mesero únicamente puede marcar ENTREGADO.")
    owner = connection.execute(
        "SELECT mesero_id FROM terracota.pedidos WHERE id = %s",
        (order_id,),
    ).fetchone()
    if owner is None:
        raise HTTPException(status_code=404, detail="Pedido no encontrado.")
    if owner["mesero_id"] != user.id and "administrador" not in user.roles:
        raise HTTPException(status_code=403, detail="El pedido pertenece a otro mesero.")
    connection.execute(
        "SELECT id FROM terracota.cambiar_estado_pedido(%s, 'ENTREGADO', %s, %s)",
        (order_id, user.id, payload.comentario),
    ).fetchone()
    order = get_order(connection, order_id)
    return order
