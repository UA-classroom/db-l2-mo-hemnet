# Add Pydantic schemas here that you'll use in your routes / endpoints
# Pydantic schemas are used to validate data that you receive, or to make sure that whatever data
# you send back to the client follows a certain structure

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date, datetime


class FeatureBase(BaseModel):
    name: str


class FeatureResponse(FeatureBase):
    id: int


class UserCreate(BaseModel):
    # We use EmailStr to ensure it's actually an email
    mail: EmailStr
    password: str
    first_name: str
    surname: str


class UserResponse(BaseModel):
    id: int
    mail: str
    first_name: str
    created_at: datetime


# --- LISTING SCHEMAS ---
class ListingBase(BaseModel):
    title: str
    description: Optional[str] = None
    price: float
    living_area: float
    room_count: int
    address_id: int
    property_type_id: int
    realtor_id: int
    status_id: int
    renovation_year: Optional[int] = None


class ListingCreate(ListingBase):
    # The frontend sends a list of IDs (e.g., [1, 5] for Balcony, Pool)
    feature_ids: List[int] = []


class ListingResponse(ListingBase):
    id: int
    created_at: datetime
    # The backend sends back the full feature names, not just IDs
    features: List[FeatureResponse] = []
