from typing import Annotated

from fastapi import APIRouter, Depends, HTTPException, status

from app.api.deps import Admin, CurrentUser, DbSession, GroupById, ManagedGroup
from app.models.group import Child, Group
from app.schemas.group import ChildRead, ChildWrite, GroupRead, GroupWrite, MemberAdd
from app.services import groups as groups_service

router = APIRouter(prefix="/groups", tags=["groups"])
me_router = APIRouter(prefix="/me", tags=["groups"])

NAME_TAKEN = HTTPException(
    status_code=status.HTTP_409_CONFLICT, detail="Ya existe un grupo con ese nombre"
)


@router.get("", response_model=list[GroupRead])
def list_groups(db: DbSession, _: CurrentUser) -> list[Group]:
    return groups_service.list_groups(db)


@router.get("/{group_id}", response_model=GroupRead)
def get_group(group: GroupById, _: CurrentUser) -> Group:
    return group


@router.post("", response_model=GroupRead, status_code=status.HTTP_201_CREATED)
def create_group(body: GroupWrite, db: DbSession, _: Admin) -> Group:
    try:
        return groups_service.create_group(db, body.name)
    except groups_service.GroupNameTakenError:
        raise NAME_TAKEN from None


@router.patch("/{group_id}", response_model=GroupRead)
def rename_group(group: GroupById, body: GroupWrite, db: DbSession, _: Admin) -> Group:
    try:
        return groups_service.rename_group(db, group, body.name)
    except groups_service.GroupNameTakenError:
        raise NAME_TAKEN from None


@router.delete("/{group_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_group(group: GroupById, db: DbSession, _: Admin) -> None:
    groups_service.delete_group(db, group)


@router.post("/{group_id}/members", response_model=GroupRead, status_code=status.HTTP_201_CREATED)
def add_member(group: GroupById, body: MemberAdd, db: DbSession, _: Admin) -> Group:
    try:
        return groups_service.add_member(db, group, body.user_id)
    except groups_service.UserNotFoundError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado"
        ) from None
    except groups_service.InvalidMemberRoleError:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Solo monitores y coordinadores pueden ser responsables de un grupo",
        ) from None
    except groups_service.AlreadyMemberError:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT, detail="Ya es responsable de este grupo"
        ) from None


@router.delete("/{group_id}/members/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def remove_member(group: GroupById, user_id: int, db: DbSession, _: Admin) -> None:
    try:
        groups_service.remove_member(db, group, user_id)
    except groups_service.NotMemberError:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="No es responsable de este grupo"
        ) from None


# Niños: solo el admin y los responsables del grupo (datos de menores)


def get_child_or_404(child_id: int, group: ManagedGroup, db: DbSession) -> Child:
    child = db.get(Child, child_id)
    if child is None or child.group_id != group.id:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Niño no encontrado")
    return child


ChildById = Annotated[Child, Depends(get_child_or_404)]


@router.get("/{group_id}/children", response_model=list[ChildRead])
def list_children(group: ManagedGroup) -> list[Child]:
    return group.children


@router.post("/{group_id}/children", response_model=ChildRead, status_code=status.HTTP_201_CREATED)
def create_child(group: ManagedGroup, body: ChildWrite, db: DbSession) -> Child:
    return groups_service.create_child(db, group, body.full_name)


@router.patch("/{group_id}/children/{child_id}", response_model=ChildRead)
def rename_child(child: ChildById, body: ChildWrite, db: DbSession) -> Child:
    return groups_service.rename_child(db, child, body.full_name)


@router.delete("/{group_id}/children/{child_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_child(child: ChildById, db: DbSession) -> None:
    groups_service.delete_child(db, child)


@me_router.get("/groups", response_model=list[GroupRead])
def my_groups(db: DbSession, user: CurrentUser) -> list[Group]:
    return groups_service.list_user_groups(db, user)
