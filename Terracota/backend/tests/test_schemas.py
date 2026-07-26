import pytest
from pydantic import ValidationError

from app.schemas import PagoCreate, PedidoCreate


def test_order_requires_at_least_one_item():
    with pytest.raises(ValidationError):
        PedidoCreate(mesa=1, items=[])


def test_payment_method_is_normalized():
    payment = PagoCreate(pedido_id=1, metodo="efectivo", monto_recibido=200)
    assert payment.metodo == "EFECTIVO"
