import logging
import time
import uuid

from fastapi import Request, Response, status
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware, RequestResponseEndpoint

from app.core.logging import request_id_var

logger = logging.getLogger("app.requests")

HEADER = "X-Request-ID"


class RequestLogMiddleware(BaseHTTPMiddleware):
    """Da un id a cada petición, deja una línea de log y convierte los fallos en un 500 JSON."""

    async def dispatch(self, request: Request, call_next: RequestResponseEndpoint) -> Response:
        # Se respeta el id que mande un proxy; si no, uno corto nuevo
        request_id = request.headers.get(HEADER, "")[:64] or uuid.uuid4().hex[:12]
        request_id_var.set(request_id)
        start = time.perf_counter()
        try:
            response = await call_next(request)
        except Exception:
            logger.exception("Error no controlado en %s %s", request.method, request.url.path)
            response = JSONResponse(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                content={"detail": "Error interno del servidor", "request_id": request_id},
            )
        ms = (time.perf_counter() - start) * 1000
        # /health lo consulta Render cada pocos segundos: solo en DEBUG
        level = logging.DEBUG if request.url.path.endswith("/health") else logging.INFO
        logger.log(
            level,
            "%s %s %s %.0f ms usuario=%s",
            request.method,
            request.url.path,
            response.status_code,
            ms,
            getattr(request.state, "user_id", "-"),
        )
        response.headers[HEADER] = request_id
        return response
