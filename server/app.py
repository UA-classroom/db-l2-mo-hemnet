import os
import psycopg2
from server.db_setup import get_connection
from fastapi import FastAPI, HTTPException
from server.schemas import (
    ListingCreate,
    UserCreate,
    CompanyCreate,
    AddressCreate,
    FeatureCreate,
    ListingPriceUpdate,
    ListingStatusUpdate,
    MessageCreate,
)

from fastapi import Depends
from fastapi.security import HTTPBasic, HTTPBasicCredentials
from psycopg2.extras import RealDictCursor
from fastapi.middleware.cors import CORSMiddleware

from server.db import (
    get_all_listings,
    get_one_listing,
    create_listing,
    delete_listing,
    update_listing,
    get_all_listings_full,
    get_one_listing_full,
    get_all_users,
    create_user,
    get_one_user,
    delete_user,
    update_user,
    get_all_companies,
    get_one_company,
    create_company,
    delete_company,
    update_company,
    get_all_addresses,
    get_one_address,
    create_address,
    delete_address,
    update_address,
    get_all_features,
    get_one_feature,
    create_feature,
    delete_feature,
    update_feature,
    update_listing_price,
    update_listing_status,
    create_message,
    get_messages_for_listing,
    get_messages_for_user,
)

app = FastAPI()


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


security = HTTPBasic()


def get_user_by_email(con, email: str):
    with con.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute("SELECT * FROM users WHERE mail = %s", (email,))
        return cur.fetchone()


@app.post("/login")
def login(credentials: HTTPBasicCredentials = Depends(security)):
    con = get_connection()
    try:
        user = get_user_by_email(con, credentials.username)
        if not user or user["password"] != credentials.password:
            raise HTTPException(status_code=401, detail="Invalid credentials")
        # Don’t expose password to the client
        user.pop("password", None)
        return {"user": user}
    finally:
        con.close()


# This code is for the website.

"""
ADD ENDPOINTS FOR FASTAPI HERE
Make sure to do the following:
- Use the correct HTTP method (e.g get, post, put, delete)
- Use correct STATUS CODES, e.g 200, 400, 401 etc. when returning a result to the user
- Use pydantic models whenever you receive user data and need to validate the structure and data types (VG)
This means you need some error handling that determine what should be returned to the user
Read more: https://www.geeksforgeeks.org/10-most-common-http-status-codes/
- Use correct URL paths the resource, e.g some endpoints should be located at the exact same URL, 
but will have different HTTP-verbs.
"""


# This is our first "Endpoint" (Menu Item)
# @app.get("/listings")
# def read_listings():
#     # 1. Open the connection to the database
#     con = get_connection()

#     # 2. Ask the 'db.py' function to get the listings
#     listings = get_all_listings(con)

#     # 3. Close the connection (Clean up)
#     con.close()

#     # 4. Give the result to the user
#     return {"listings": listings}


# @app.get("/listings/{id}")
# def read_one_listing(id: int):
# con = get_connection()
# listing = get_one_listing(con, id)
# con.close()

# # If the house doesn't exist (like ID 999), we should tell the user.
# if listing is None:
#     raise HTTPException(status_code=404, detail="Listing not found")

# return listing

# WEBSITE ADDING


@app.get("/listings")
def read_listings():
    con = get_connection()
    listings = get_all_listings_full(con)
    con.close()
    return {"listings": listings}


@app.get("/listings/{id}")
def read_one_listing(id: int):
    con = get_connection()
    listing = get_one_listing_full(con, id)
    con.close()
    if listing is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return listing


@app.post("/listings")
def add_listing(listing: ListingCreate):
    con = get_connection()

    # We take the data from the "listing" variable (the Schema)
    new_id = create_listing(
        con,
        listing.title,
        listing.description,
        listing.price,
        listing.living_area,
        listing.lot_size,
        listing.room_count,
        listing.year_built,
        listing.floor_number,
        listing.energy_class,
        listing.renovation_year,
        listing.address_id,
        listing.property_type_id,
        listing.realtor_id,
        listing.status_id,
    )

    con.commit()  # IMPORTANT: Save the changes!
    con.close()

    return {"message": "Listing created successfully", "id": new_id}


@app.delete("/listings/{id}")
def remove_listing(id: int):
    con = get_connection()
    deleted_id = delete_listing(con, id)
    con.commit()
    con.close()

    if deleted_id is None:
        raise HTTPException(status_code=404, detail="Listing not found")
    return {"message": "Listing deleted successfully"}


@app.put("/listings/{id}")
def change_listing(id: int, listing: ListingCreate):
    con = get_connection()

    updated_row = update_listing(
        con,
        id,
        listing.title,
        listing.description,
        listing.price,
        listing.living_area,
        listing.lot_size,
        listing.room_count,
        listing.year_built,
        listing.floor_number,
        listing.energy_class,
        listing.renovation_year,
        listing.address_id,
        listing.property_type_id,
        listing.realtor_id,
        listing.status_id,
    )

    con.commit()
    con.close()

    if updated_row is None:
        raise HTTPException(status_code=404, detail="Listing not found.")
    return {"message": "Listing updated successfully!"}


# USER


@app.get("/users")
def read_users():
    con = get_connection()
    users = get_all_users(con)
    con.close()
    return {"users": users}


@app.post("/users")
def add_user(user: UserCreate):
    con = get_connection()
    new_id = create_user(
        con,
        user.first_name,
        user.surname,
        user.mail,
        user.password,
        user.phone_number,
        user.birthdate,
        user.role_id,
        user.address_id,
        user.company_id,
    )
    con.commit()
    con.close()
    return {"message": "User created successfully", "id": new_id}


@app.get("/users/{id}")
def read_one_user(id: int):
    con = get_connection()
    user = get_one_user(con, id)
    con.close()
    if user is None:
        raise HTTPException(status_code=404, detail="User not found")
    return user


@app.delete("/users/{id}")
def remove_user(id: int):
    con = get_connection()
    deleted_id = delete_user(con, id)
    con.commit()
    con.close()
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User deleted successfully"}


@app.put("/users/{id}")
def change_user(id: int, user: UserCreate):
    con = get_connection()
    updated_row = update_user(
        con,
        id,
        user.first_name,
        user.surname,
        user.mail,
        user.password,
        user.phone_number,
        user.birthdate,
        user.role_id,
        user.address_id,
        user.company_id,
    )
    con.commit()
    con.close()
    if updated_row is None:
        raise HTTPException(status_code=404, detail="User not found")
    return {"message": "User updated successfully"}


# COMPANIES ENDPOINTS


@app.get("/companies")
def read_companies():
    con = get_connection()
    companies = get_all_companies(con)
    con.close()
    return {"companies": companies}


@app.get("/companies/{id}")
def read_one_company(id: int):
    con = get_connection()
    company = get_one_company(con, id)
    con.close()
    if company is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return company


@app.post("/companies")
def add_company(company: CompanyCreate):
    con = get_connection()
    new_id = create_company(con, company.name, company.address_id)
    con.commit()
    con.close()
    return {"message": "Company created successfully", "id": new_id}


@app.delete("/companies/{id}")
def remove_company(id: int):
    con = get_connection()
    deleted_id = delete_company(con, id)
    con.commit()
    con.close()
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"message": "Company deleted successfully"}


@app.put("/companies/{id}")
def change_company(id: int, company: CompanyCreate):
    con = get_connection()
    updated_id = update_company(con, id, company.name, company.address_id)
    con.commit()
    con.close()
    if updated_id is None:
        raise HTTPException(status_code=404, detail="Company not found")
    return {"message": "Company updated successfully"}


# ADDRESSES ENDPOINTS


@app.get("/addresses")
def read_addresses():
    con = get_connection()
    addresses = get_all_addresses(con)
    con.close()
    return {"addresses": addresses}


@app.get("/addresses/{id}")
def read_one_address(id: int):
    con = get_connection()
    address = get_one_address(con, id)
    con.close()
    if address is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return address


@app.post("/addresses")
def add_address(address: AddressCreate):
    con = get_connection()
    new_id = create_address(
        con, address.street, address.city, address.postcode, address.country
    )
    con.commit()
    con.close()
    return {"message": "Address created successfully", "id": new_id}


@app.delete("/addresses/{id}")
def remove_address(id: int):
    con = get_connection()
    deleted_id = delete_address(con, id)
    con.commit()
    con.close()
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address deleted successfully"}


@app.put("/addresses/{id}")
def change_address(id: int, address: AddressCreate):
    con = get_connection()
    updated_id = update_address(
        con, id, address.street, address.city, address.postcode, address.country
    )
    con.commit()
    con.close()
    if updated_id is None:
        raise HTTPException(status_code=404, detail="Address not found")
    return {"message": "Address updated successfully"}


# FEATURE ENDPOINTS


@app.get("/features")
def read_features():
    con = get_connection()
    features = get_all_features(con)
    con.close()
    return {"features": features}


@app.get("/features/{id}")
def read_one_feature(id: int):
    con = get_connection()
    feature = get_one_feature(con, id)
    con.close()
    if feature is None:
        raise HTTPException(status_code=404, detail="Feature not found")
    return feature


@app.post("/features")
def add_feature(feature: FeatureCreate):
    con = get_connection()
    new_id = create_feature(con, feature.name)
    con.commit()
    con.close()
    return {"message": "Feature created successfully", "id": new_id}


@app.delete("/features/{id}")
def remove_feature(id: int):
    con = get_connection()
    deleted_id = delete_feature(con, id)
    con.commit()
    con.close()
    if deleted_id is None:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature deleted successfully"}


@app.put("/features/{id}")
def change_feature(id: int, feature: FeatureCreate):
    con = get_connection()
    updated_id = update_feature(con, id, feature.name)
    con.commit()
    con.close()
    if updated_id is None:
        raise HTTPException(status_code=404, detail="Feature not found")
    return {"message": "Feature updated successfully"}


# PATCH LISTINGS


@app.patch("/listings/{id}/price")
def update_price(id: int, update: ListingPriceUpdate):
    con = get_connection()
    # Adding the new price
    updated_id = update_listing_price(con, id, update.price)
    con.commit()
    con.close()

    if updated_id is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    return {"message": "Price updated successfully"}


@app.patch("/listings/{id}/status")
def update_status(id: int, update: ListingStatusUpdate):
    con = get_connection()
    # Adding the new status
    updated_id = update_listing_status(con, id, update.status_id)
    con.commit()
    con.close()

    if updated_id is None:
        raise HTTPException(status_code=404, detail="Listing not found")

    return {"message": "Status updated successfully"}


# MESSAGE LISTINGS


@app.post("/messages")
def add_message(payload: MessageCreate):
    con = get_connection()
    try:
        msg = create_message(
            con,
            payload.sender_id,
            payload.receiver_id,
            payload.listing_id,
            payload.content,
        )
        con.commit()
        return msg
    finally:
        con.close()


@app.get("/messages/listing/{listing_id}")
def list_messages_for_listing(listing_id: int):
    con = get_connection()
    try:
        return get_messages_for_listing(con, listing_id)
    finally:
        con.close()


@app.get("/messages/user/{user_id}")
def list_messages_for_user(user_id: int):
    con = get_connection()
    try:
        return get_messages_for_user(con, user_id)
    finally:
        con.close()
