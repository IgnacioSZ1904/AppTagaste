"""Logging en texto, una línea por mensaje, con el id de la petición."""

import logging
from contextvars import ContextVar

# Id de la petición en curso (lo pone el middleware)
request_id_var: ContextVar[str] = ContextVar("request_id", default="-")

FORMAT = "%(asctime)s %(levelname)s [%(request_id)s] %(name)s: %(message)s"

_default_factory = logging.getLogRecordFactory()


def _record_with_request_id(*args: object, **kwargs: object) -> logging.LogRecord:
    """Todas las líneas llevan el id de la petición, también las de librerías."""
    record = _default_factory(*args, **kwargs)
    record.request_id = request_id_var.get()
    return record


def setup_logging(level: str = "INFO") -> None:
    logging.setLogRecordFactory(_record_with_request_id)
    handler = logging.StreamHandler()
    handler.setFormatter(logging.Formatter(FORMAT, datefmt="%Y-%m-%d %H:%M:%S"))
    root = logging.getLogger()
    root.handlers = [handler]
    root.setLevel(level.upper())
    # Cada petición ya deja su línea (middleware): sobra la de uvicorn
    logging.getLogger("uvicorn.access").setLevel(logging.WARNING)
