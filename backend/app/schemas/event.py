from typing import Self

from pydantic import BaseModel, ConfigDict, Field, model_validator

from app.models.event import EventType
from app.schemas.types import LocalDateTime


class EventCreate(BaseModel):
    title: str = Field(min_length=1, max_length=150)
    description: str | None = None
    type: EventType
    starts_at: LocalDateTime
    ends_at: LocalDateTime
    location: str | None = Field(default=None, max_length=150)

    @model_validator(mode="after")
    def check_range(self) -> Self:
        if self.ends_at <= self.starts_at:
            raise ValueError("La fecha de fin debe ser posterior a la de inicio")
        return self


class EventUpdate(BaseModel):
    """Edición parcial: solo se cambian los campos enviados."""

    title: str | None = Field(default=None, min_length=1, max_length=150)
    description: str | None = None
    type: EventType | None = None
    starts_at: LocalDateTime | None = None
    ends_at: LocalDateTime | None = None
    location: str | None = Field(default=None, max_length=150)

    @model_validator(mode="after")
    def check_required_not_null(self) -> Self:
        for field in ("title", "type", "starts_at", "ends_at"):
            if field in self.model_fields_set and getattr(self, field) is None:
                raise ValueError(f"El campo {field} no puede ser nulo")
        return self


class EventRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    title: str
    description: str | None
    type: EventType
    starts_at: LocalDateTime
    ends_at: LocalDateTime
    location: str | None
    created_by_id: int | None
    created_at: LocalDateTime
    updated_at: LocalDateTime
