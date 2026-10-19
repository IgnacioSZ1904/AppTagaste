from sqlalchemy import select
from sqlalchemy.orm import Session

from app.models.group import GROUP_MEMBER_ROLES, Child, Group, group_members
from app.models.user import User


class GroupNameTakenError(Exception):
    pass


class UserNotFoundError(Exception):
    pass


class InvalidMemberRoleError(Exception):
    """Solo monitores y coordinadores pueden ser responsables de un grupo."""


class AlreadyMemberError(Exception):
    pass


class NotMemberError(Exception):
    pass


def list_groups(db: Session) -> list[Group]:
    return list(db.scalars(select(Group).order_by(Group.name)))


def list_user_groups(db: Session, user: User) -> list[Group]:
    query = (
        select(Group)
        .join(group_members, group_members.c.group_id == Group.id)
        .where(group_members.c.user_id == user.id)
        .order_by(Group.name)
    )
    return list(db.scalars(query))


def _check_name_free(db: Session, name: str, exclude_id: int | None = None) -> None:
    query = select(Group.id).where(Group.name == name)
    if exclude_id is not None:
        query = query.where(Group.id != exclude_id)
    if db.scalar(query) is not None:
        raise GroupNameTakenError(name)


def create_group(db: Session, name: str) -> Group:
    _check_name_free(db, name)
    group = Group(name=name)
    db.add(group)
    db.commit()
    db.refresh(group)
    return group


def rename_group(db: Session, group: Group, name: str) -> Group:
    _check_name_free(db, name, exclude_id=group.id)
    group.name = name
    db.commit()
    db.refresh(group)
    return group


def delete_group(db: Session, group: Group) -> None:
    db.delete(group)
    db.commit()


def add_member(db: Session, group: Group, user_id: int) -> Group:
    user = db.get(User, user_id)
    if user is None:
        raise UserNotFoundError(user_id)
    if user.role not in GROUP_MEMBER_ROLES:
        raise InvalidMemberRoleError(user.role)
    if user in group.members:
        raise AlreadyMemberError(user_id)
    group.members.append(user)
    db.commit()
    db.refresh(group)
    return group


def remove_member(db: Session, group: Group, user_id: int) -> None:
    user = next((m for m in group.members if m.id == user_id), None)
    if user is None:
        raise NotMemberError(user_id)
    group.members.remove(user)
    db.commit()


def create_child(db: Session, group: Group, full_name: str) -> Child:
    child = Child(group_id=group.id, full_name=full_name)
    db.add(child)
    db.commit()
    db.refresh(child)
    return child


def rename_child(db: Session, child: Child, full_name: str) -> Child:
    child.full_name = full_name
    db.commit()
    db.refresh(child)
    return child


def delete_child(db: Session, child: Child) -> None:
    db.delete(child)
    db.commit()
