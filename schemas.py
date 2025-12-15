# Add Pydantic schemas here that you'll use in your routes / endpoints
# Pydantic schemas are used to validate data that you receive, or to make sure that whatever data
# you send back to the client follows a certain structure

from pydantic import BaseModel
from typing import Optional
from datetime import date


# This is the "Form" a user fills out to create a listing
class ListingCreate(BaseModel):
    title: str
    description: str
    price: float  # Must be a number
    living_area: float
    lot_size: float
    room_count: int  # Must be a whole number
    year_built: int
    floor_number: int
    energy_class: str
    renovation_year: Optional[int] = None  # This one is optional

    # These contain the ID numbers for connections
    address_id: int
    property_type_id: int
    realtor_id: int
    status_id: int


class UserCreate(BaseModel):
    first_name: str
    surname: str
    mail: str
    password: str
    phone_number: str
    birthdate: date  # Format: YYYY-MM-DD

    # Connections
    role_id: int
    address_id: int
    company_id: Optional[int] = (
        None  # Company is optional (regular buyers don't have one)
    )


class CompanyCreate(BaseModel):
    name: str
    address_id: int


class AddressCreate(BaseModel):
    street: str
    city: str
    postcode: str
    country: str
