import os
import psycopg2
from dotenv import load_dotenv

load_dotenv(override=True)

DATABASE_NAME = os.getenv("DATABASE_NAME")
PASSWORD = os.getenv("PASSWORD")


def get_connection():
    return psycopg2.connect(
        dbname=DATABASE_NAME,
        user="postgres",
        password=PASSWORD,
        host="localhost",
        port="5432",
    )


def seed_database():
    print("Starting to seed database...")

    con = get_connection()
    cur = con.cursor()

    try:
        # 1. CLEANUP (Optional but helpful)
        # This deletes old data so we don't get duplicates if we run this script twice.
        # CASCADE means "delete everything connected to it too".
        print("Clearing old data...")
        tables = [
            "roles",
            "addresses",
            "realtor_companies",
            "users",
            "property_types",
            "status",
            "features",
            "listings",
            "listing_features",
            "favorite",
            "messages",
            "listing_images",
            "user_images",
            "realtor_agent",
        ]
        for table in tables:
            cur.execute(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;")

        # 2. INSERT ROLES
        print("   Inserting Roles...")
        roles = [
            ("Admin", "Super user"),
            ("Realtor", "Can sell houses"),
            ("User", "Looking to buy"),
        ]
        for role in roles:
            cur.execute("INSERT INTO roles (name, description) VALUES (%s, %s)", role)

        # 3. INSERT STATUS
        print("   Inserting Statuses...")
        statuses = ["For Sale", "Sold", "Bidding in progress"]
        for s in statuses:
            cur.execute("INSERT INTO status (status) VALUES (%s)", (s,))

        # 4. INSERT PROPERTY TYPES
        print("   Inserting Property Types...")
        types = ["Villa", "Apartment", "Cottage", "Row House"]
        for t in types:
            cur.execute("INSERT INTO property_types (name) VALUES (%s)", (t,))

        # 5. INSERT FEATURES
        print("   Inserting Features...")
        features = ["Balcony", "Fireplace", "Pool", "Garage", "Elevator"]
        for f in features:
            cur.execute("INSERT INTO features (name) VALUES (%s)", (f,))

        # 6. INSERT ADDRESSES (We need these for users and listings)
        print("   Inserting Addresses...")
        # We will assume ID 1, 2, 3, 4 are created in order
        addresses = [
            ("Storgatan 1", "Stockholm", "11122", "Sweden"),  # ID 1
            ("Kungsgatan 5", "Gothenburg", "41100", "Sweden"),  # ID 2 (For a company)
            ("Långvägen 10", "Malmö", "21100", "Sweden"),  # ID 3 (For a house listing)
            ("Strandvägen 99", "Stockholm", "11400", "Sweden"),  # ID 4 (For a user)
        ]
        for addr in addresses:
            cur.execute(
                "INSERT INTO addresses (street, city, postcode, country) VALUES (%s, %s, %s, %s)",
                addr,
            )

        # 7. INSERT REALTOR COMPANIES
        print("   Inserting Realtor Companies...")
        # Uses address_id 2
        cur.execute("""
            INSERT INTO realtor_companies (name, address_id) 
            VALUES ('Best Hem Agency', 2)
        """)

        # 8. INSERT USERS
        print("   Inserting Users...")
        # User 1: The Realtor (Role ID 2, Address ID 1, Company ID 1)
        cur.execute("""
            INSERT INTO users (first_name, surname, mail, password, phone_number, role_id, address_id, company_id, birthdate)
            VALUES ('Erik', 'Mäklare', 'erik@besthem.se', 'secret123', '0701234567', 2, 1, 1, '1985-05-20')
        """)

        # User 2: The Buyer (Role ID 3, Address ID 4, No Company)
        cur.execute("""
            INSERT INTO users (first_name, surname, mail, password, phone_number, role_id, address_id, company_id, birthdate)
            VALUES ('Anna', 'Andersson', 'anna@gmail.com', 'buyer123', '0709876543', 3, 4, NULL, '1992-11-10')
        """)

        # 9. INSERT LISTINGS (The Houses)
        print("   Inserting Listings...")
        # A Villa (Type 1), Sold by Erik (User 1), At Address 3, Status 'For Sale' (Status 1)
        cur.execute("""
            INSERT INTO listings (
                title, description, price, living_area, lot_size, room_count, 
                year_built, floor_number, energy_class, renovation_year,
                address_id, property_type_id, realtor_id, status_id
            )
            VALUES (
                'Beautiful Villa in Malmö', 'A lovely house close to the sea.', 
                5000000.00, 150.5, 800.0, 5, 2010, 0, 'B', 2022,
                3, 1, 1, 1
            )
        """)

        # Commit the changes (Save effectively)
        con.commit()
        print("Database seeded successfully!")

    except Exception as e:
        print(f"Error seeding database: {e}")
        con.rollback()  # Undo changes if something went wrong
    finally:
        con.close()


if __name__ == "__main__":
    seed_database()
