from __future__ import annotations

from decimal import Decimal
from typing import Literal, Optional

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
    observacion: Optional[str] = Field(default=None, max_length=250)


class PedidoCreate(BaseModel):
    mesa: int = Field(gt=0)
    items: list[PedidoItemCreate] = Field(min_length=1)
    notas: Optional[str] = Field(default=None, max_length=500)


class CambioEstado(BaseModel):
    estado: Literal["PREPARANDO", "LISTO", "ENTREGADO"]
    comentario: Optional[str] = Field(default=None, max_length=250)


class PagoCreate(BaseModel):
    pedido_id: int = Field(gt=0)
    metodo: Literal["EFECTIVO", "TARJETA", "TRANSFERENCIA"]
    monto_recibido: Optional[Decimal] = Field(default=None, ge=0)
    referencia: Optional[str] = Field(default=None, max_length=100)

    @field_validator("metodo", mode="before")
    @classmethod
    def normalize_method(cls, value: str) -> str:
        return value.strip().upper()


class UsuarioCreate(BaseModel):
    nombre: str = Field(min_length=2, max_length=120)
    usuario: str = Field(min_length=3, max_length=60, pattern=r"^[A-Za-z0-9._-]+$")
    password: str = Field(min_length=8, max_length=128)
    roles: list[str] = Field(min_length=1)

    @field_validator("nombre", "usuario")
    @classmethod
    def trim_text(cls, value: str) -> str:
        return value.strip()

    @field_validator("roles")
    @classmethod
    def normalize_roles(cls, values: list[str]) -> list[str]:
        roles = sorted({value.strip().lower() for value in values if value.strip()})
        if not roles:
            raise ValueError("Debe asignarse al menos un rol.")
        return roles


class UsuarioUpdate(BaseModel):
    nombre: Optional[str] = Field(default=None, min_length=2, max_length=120)
    password: Optional[str] = Field(default=None, min_length=8, max_length=128)
    activo: Optional[bool] = None
    roles: Optional[list[str]] = None

    @field_validator("nombre")
    @classmethod
    def trim_optional_text(cls, value: Optional[str]) -> Optional[str]:
        return value.strip() if value is not None else None

    @field_validator("roles")
    @classmethod
    def normalize_optional_roles(cls, values: Optional[list[str]]) -> Optional[list[str]]:
        if values is None:
            return None
        roles = sorted({value.strip().lower() for value in values if value.strip()})
        if not roles:
            raise ValueError("Debe asignarse al menos un rol.")
        return roles
