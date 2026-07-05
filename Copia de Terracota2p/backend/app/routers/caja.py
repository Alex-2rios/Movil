from fastapi import APIRouter, Depends, status
from psycopg import Connection

from ..database import get_connection
from ..dependencies import CurrentUser, require_roles
from ..schemas import PagoCreate


router = APIRouter(prefix="/caja", tags=["Caja"])
caja_required = require_roles("caja")


@router.get("/pedidos-pendientes")
def list_pending_payments(
    _: CurrentUser = Depends(caja_required),
    connection: Connection = Depends(get_connection),
) -> list[dict]:
    return connection.execute(
        """
        SELECT * FROM terracota.vista_pedidos_operativos
        WHERE estado = 'ENTREGADO'
        ORDER BY creado_en
        """
    ).fetchall()


@router.post("/pagos", status_code=status.HTTP_201_CREATED)
def register_payment(
    payload: PagoCreate,
    user: CurrentUser = Depends(caja_required),
    connection: Connection = Depends(get_connection),
) -> dict:
    result = connection.execute(
        """
        SELECT * FROM terracota.registrar_pago(%s, %s, %s, %s, %s)
        """,
        (payload.pedido_id, user.id, payload.metodo, payload.monto_recibido, payload.referencia),
    ).fetchone()
    return connection.execute(
        "SELECT * FROM terracota.vista_tickets WHERE id = %s",
        (result["ticket_id"],),
    ).fetchone()


@router.get("/tickets")
def list_tickets(
    _: CurrentUser = Depends(caja_required),
    connection: Connection = Depends(get_connection),
) -> list[dict]:
    return connection.execute(
        "SELECT * FROM terracota.vista_tickets ORDER BY emitido_en DESC"
    ).fetchall()


@router.get("/ventas/hoy")
def today_sales(
    _: CurrentUser = Depends(caja_required),
    connection: Connection = Depends(get_connection),
) -> dict:
    return connection.execute(
        """
        WITH hoy AS (
          SELECT (now() AT TIME ZONE 'America/Mexico_City')::date AS fecha
        )
        SELECT h.fecha,
               COALESCE(v.pagos, 0)::integer AS pagos,
               COALESCE(v.total, 0)::numeric(14,2) AS total,
               COALESCE(v.efectivo, 0)::numeric(14,2) AS efectivo,
               COALESCE(v.tarjeta, 0)::numeric(14,2) AS tarjeta,
               COALESCE(v.transferencia, 0)::numeric(14,2) AS transferencia
        FROM hoy h
        LEFT JOIN terracota.vista_ventas_diarias v ON v.fecha = h.fecha
        """
    ).fetchone()
