"""Comandos de administración.

Uso (dentro del contenedor):
    python -m app.cli create-admin --email ana@ejemplo.com --name "Ana López"
    python -m app.cli dev-token --email ana@ejemplo.com
"""

import argparse
import sys

from app.core.config import get_settings
from app.core.security import create_access_token
from app.db.session import SessionLocal
from app.models.user import Role
from app.schemas.user import UserCreate, UserUpdate
from app.services import users as users_service


def create_admin(email: str, name: str) -> int:
    """Crea un admin o asciende a admin una cuenta que ya existe (p. ej. un usuario)."""
    data = UserCreate(email=email, full_name=name, role=Role.ADMIN)
    with SessionLocal() as db:
        user = users_service.get_by_email(db, data.email)
        if user is None:
            user = users_service.create_user(db, data)
            print(f"Admin creado: {user.email} (id {user.id})")
        else:
            users_service.update_user(db, user, UserUpdate(role=Role.ADMIN, is_active=True))
            print(f"{user.email} ahora es admin (id {user.id})")
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

    create = sub.add_parser("create-admin", help="Da de alta un administrador")
    create.add_argument("--email", required=True)
    create.add_argument("--name", required=True)

    token = sub.add_parser("dev-token", help="Genera un token para probar en /docs")
    token.add_argument("--email", required=True)

    args = parser.parse_args(argv)
    if args.command == "create-admin":
        return create_admin(args.email, args.name)
    return dev_token(args.email)


if __name__ == "__main__":
    sys.exit(main())
