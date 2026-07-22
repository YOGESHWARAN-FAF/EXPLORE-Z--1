from typing import Optional, List
from pydantic import BaseModel, Field
from datetime import datetime, timezone

class MemberLocation(BaseModel):
    member_id: str
    member_name: str
    latitude: float
    longitude: float
    battery_level: Optional[int] = 85
    last_updated: str = Field(default_factory=lambda: datetime.now(timezone.utc).isoformat())
    distance_from_center: Optional[float] = 0.0 # meters
    is_missing: bool = False # true if > 300m
    is_outside_geofence: bool = False
    is_sos_active: bool = False

class LocationUpdateRequest(BaseModel):
    trip_id: str
    member_id: str
    member_name: str
    latitude: float
    longitude: float
    battery_level: Optional[int] = 85

class GeofenceConfig(BaseModel):
    center_lat: float
    center_lng: float
    radius_km: float # 3, 5, 7, 10
    boundary_type: str = "circle" # circle or polygon

class SOSAlert(BaseModel):
    id: Optional[str] = None
    trip_id: str
    member_id: str
    member_name: str
    latitude: float
    longitude: float
    timestamp: str = Field(default_factory=lambda: datetime.utcnow().isoformat())
    message: str = "EMERGENCY SOS ALERT ACTIVATED"
    resolved: bool = False
