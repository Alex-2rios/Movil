from __future__ import annotations

from psycopg import Connection


def get_order(connection: Connection, order_id: int) -> dict | None:
    return connection.execute(
        """
        SELECT *
        FROM terracota.vista_pedidos_operativos
        WHERE id = %s
        """,
        (order_id,),
    ).fetchone()
