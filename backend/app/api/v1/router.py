from fastapi import APIRouter

from app.api.v1.endpoints import attendance, auth, calendar, events, groups, health, users

api_router = APIRouter()
api_router.include_router(health.router)
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(events.router)
api_router.include_router(calendar.router)
api_router.include_router(groups.router)
api_router.include_router(groups.me_router)
api_router.include_router(attendance.router)
