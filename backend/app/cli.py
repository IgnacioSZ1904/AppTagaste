"""Comandos de administración.

Uso (dentro del contenedor):
    python -m app.cli create-coordinator --email ana@ejemplo.com --name "Ana López"
    python -m app.cli dev-token --email ana@ejemplo.com
"""

import argparse
import sys

from app.core.config import get_settings
from app.core.security import create_access_token
from app.db.session import SessionLocal
from app.models.user import Role
from app.schemas.user import UserCreate
from app.services import users as users_service


def create_coordinator(email: str, name: str) -> int:
    data = UserCreate(email=email, full_name=name, role=Role.COORDINADOR)
    with SessionLocal() as db:
        try:
            user = users_service.create_user(db, data)
        except users_service.EmailAlreadyExistsError:
            print(f"Ya existe un usuario con el email {email}", file=sys.stderr)
            return 1
    print(f"Coordinador creado: {user.email} (id {user.id})")
    return 0


def dev_token(email: str) -> int:
    if get_settings().environment == "production":
        print("dev-token no está disponible en producción", file=sys.stderr)
        return 1
    with SessionLocal() as db:
        user = users_service.get_by_email(db, email)
    if user is None or not user.is_active:
        print(f"No hay un usuario activo con el email {email}", file=sys.stderr)
        return 1
    print(create_access_token(user.id))
    return 0


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(prog="python -m app.cli")
    sub = parser.add_subparsers(dest="command", required=True)

    create = sub.add_parser("create-coordinator", help="Da de alta un coordinador")
    create.add_argument("--email", required=True)
    create.add_argument("--name", required=True)

    token = sub.add_parser("dev-token", help="Genera un token para probar en /docs")
    token.add_argument("--email", required=True)

    args = parser.parse_args(argv)
    if args.command == "create-coordinator":
        return create_coordinator(args.email, args.name)
    return dev_token(args.email)


if __name__ == "__main__":
    sys.exit(main())
