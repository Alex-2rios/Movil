import pytest
from pydantic import ValidationError

from app.schemas import PagoCreate, PedidoCreate, UsuarioCreate, UsuarioUpdate


def test_order_requires_at_least_one_item():
    with pytest.raises(ValidationError):
        PedidoCreate(mesa=1, items=[])


def test_payment_method_is_normalized():
    payment = PagoCreate(pedido_id=1, metodo="efectivo", monto_recibido=200)
    assert payment.metodo == "EFECTIVO"


def test_user_roles_are_normalized_and_deduplicated():
    user = UsuarioCreate(
        nombre=" Usuario ", usuario="usuario.demo", password="Cambiar123!",
        roles=["MESERO", "mesero"],
    )
    assert user.nombre == "Usuario"
    assert user.roles == ["mesero"]


def test_user_update_rejects_empty_role_list():
    with pytest.raises(ValidationError):
        UsuarioUpdate(roles=[])
