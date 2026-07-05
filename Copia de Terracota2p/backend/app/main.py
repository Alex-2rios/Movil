from contextlib import asynccontextmanager

import psycopg
from fastapi import FastAPI, Request, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse, RedirectResponse

from .config import get_settings
from .database import create_pool
from .routers import administracion, auth, caja, catalogos, cocina, mesero


settings = get_settings()


@asynccontextmanager
async def lifespan(app: FastAPI):
    pool = create_pool(settings)
    pool.open(wait=True)
    app.state.pool = pool
    yield
    pool.close()


app = FastAPI(
    title=settings.app_name,
    description="API REST para los módulos móviles Mesero, Cocina y Caja.",
    version="1.0.0",
    lifespan=lifespan,
)
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["GET", "POST", "PATCH"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.exception_handler(psycopg.Error)
async def database_error_handler(_: Request, error: psycopg.Error) -> JSONResponse:
    detail = error.diag.message_primary or "La operación no pudo completarse."
    return JSONResponse(status_code=status.HTTP_400_BAD_REQUEST, content={"detail": detail})


@app.get("/health", tags=["Sistema"])
def health() -> dict[str, str]:
    return {"status": "ok"}


@app.get("/", include_in_schema=False)
@app.get("/forms", include_in_schema=False)
def documentation() -> RedirectResponse:
    return RedirectResponse(url="/docs")


for api_router in (
    auth.router,
    catalogos.router,
    mesero.router,
    cocina.router,
    caja.router,
    administracion.router,
):
    app.include_router(api_router, prefix="/api/v1")
