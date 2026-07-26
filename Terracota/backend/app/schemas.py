from decimal import Decimal
from typing import Literal

from pydantic import BaseModel, Field, field_validator


class UserIdentity(BaseModel):
    id: int
    nombre: str
    usuario: str
    roles: list[str]


class TokenResponse(BaseModel):
    access_token: str
    token_type: Literal["bearer"] = "bearer"
    usuario: UserIdentity


class PedidoItemCreate(BaseModel):
    producto_clave: str = Field(min_length=1, max_length=60)
    cantidad: int = Field(ge=1, le=99)
    observacion: str | None = Field(default=None, max_length=250)


class PedidoCreate(BaseModel):
    mesa: int = Field(gt=0)
    items: list[PedidoItemCreate] = Field(min_length=1)
    notas: str | None = Field(default=None, max_length=500)


class CambioEstado(BaseModel):
    estado: Literal["PREPARANDO", "LISTO", "ENTREGADO"]
    comentario: str | None = Field(default=None, max_length=250)


class PagoCreate(BaseModel):
    pedido_id: int = Field(gt=0)
    metodo: Literal["EFECTIVO", "TARJETA", "TRANSFERENCIA"]
    monto_recibido: Decimal | None = Field(default=None, ge=0)
    referencia: str | None = Field(default=None, max_length=100)

    @field_validator("metodo", mode="before")
    @classmethod
    def normalize_method(cls, value: str) -> str:
        return value.strip().upper()
