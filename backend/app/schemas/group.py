from pydantic import BaseModel, ConfigDict, Field

from app.models.user import Role


class GroupWrite(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    name: str = Field(min_length=1, max_length=80)


class GroupMemberRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    full_name: str
    role: Role


class GroupRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    name: str
    members: list[GroupMemberRead]
    children_count: int


class MemberAdd(BaseModel):
    user_id: int


class ChildWrite(BaseModel):
    model_config = ConfigDict(str_strip_whitespace=True)

    full_name: str = Field(min_length=1, max_length=120)


class ChildRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    group_id: int
    full_name: str
