from typing import Annotated

from fastapi import APIRouter, Depends, status

from app.api.deps import Admin, CurrentUser, DbSession, GroupById, ManagedGroup
from app.core.errors import NotFoundError
from app.core.openapi import errors
from app.models.group import Child, Group
from app.schemas.group import ChildRead, ChildWrite, GroupRead, GroupWrite, MemberAdd
from app.services import groups as groups_service

router = APIRouter(prefix="/groups", tags=["groups"], responses=errors(401, 422))
me_router = APIRouter(prefix="/me", tags=["groups"], responses=errors(401))


@router.get("", response_model=list[GroupRead], summary="Listar grupos")
def list_groups(db: DbSession, _: CurrentUser) -> list[Group]:
    return groups_service.list_groups(db)


@router.get("/{group_id}", response_model=GroupRead, summary="Ver un grupo", responses=errors(404))
def get_group(group: GroupById, _: CurrentUser) -> Group:
    return group


@router.post(
    "",
    response_model=GroupRead,
    status_code=status.HTTP_201_CREATED,
    summary="Crear un grupo",
    responses=errors(403, 409),
)
def create_group(body: GroupWrite, db: DbSession, _: Admin) -> Group:
    return groups_service.create_group(db, body.name)


@router.patch(
    "/{group_id}",
    response_model=GroupRead,
    summary="Renombrar un grupo",
    responses=errors(403, 404, 409),
)
def rename_group(group: GroupById, body: GroupWrite, db: DbSession, _: Admin) -> Group:
    return groups_service.rename_group(db, group, body.name)


@router.delete(
    "/{group_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Borrar un grupo y sus niños",
    responses=errors(403, 404),
)
def delete_group(group: GroupById, db: DbSession, _: Admin) -> None:
    groups_service.delete_group(db, group)


@router.post(
    "/{group_id}/members",
    response_model=GroupRead,
    status_code=status.HTTP_201_CREATED,
    summary="Añadir un responsable",
    responses=errors(403, 404, 409),
)
def add_member(group: GroupById, body: MemberAdd, db: DbSession, _: Admin) -> Group:
    return groups_service.add_member(db, group, body.user_id)


@router.delete(
    "/{group_id}/members/{user_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Quitar un responsable",
    responses=errors(403, 404),
)
def remove_member(group: GroupById, user_id: int, db: DbSession, _: Admin) -> None:
    groups_service.remove_member(db, group, user_id)


# Niños: solo el admin y los responsables del grupo (datos de menores)


def get_child_or_404(child_id: int, group: ManagedGroup, db: DbSession) -> Child:
    child = db.get(Child, child_id)
    if child is None or child.group_id != group.id:
        raise NotFoundError("Niño no encontrado")
    return child


ChildById = Annotated[Child, Depends(get_child_or_404)]


@router.get(
    "/{group_id}/children",
    response_model=list[ChildRead],
    summary="Listar los niños del grupo",
    responses=errors(403, 404),
)
def list_children(group: ManagedGroup) -> list[Child]:
    return group.children


@router.post(
    "/{group_id}/children",
    response_model=ChildRead,
    status_code=status.HTTP_201_CREATED,
    summary="Añadir un niño",
    responses=errors(403, 404),
)
def create_child(group: ManagedGroup, body: ChildWrite, db: DbSession) -> Child:
    return groups_service.create_child(db, group, body.full_name)


@router.patch(
    "/{group_id}/children/{child_id}",
    response_model=ChildRead,
    summary="Renombrar un niño",
    responses=errors(403, 404),
)
def rename_child(child: ChildById, body: ChildWrite, db: DbSession) -> Child:
    return groups_service.rename_child(db, child, body.full_name)


@router.delete(
    "/{group_id}/children/{child_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    summary="Quitar un niño",
    responses=errors(403, 404),
)
def delete_child(child: ChildById, db: DbSession) -> None:
    groups_service.delete_child(db, child)


@me_router.get("/groups", response_model=list[GroupRead], summary="Mis grupos")
def my_groups(db: DbSession, user: CurrentUser) -> list[Group]:
    """Los grupos de los que el usuario es responsable."""
    return groups_service.list_user_groups(db, user)
