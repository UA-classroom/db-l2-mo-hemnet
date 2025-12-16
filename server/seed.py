import os
import random
import psycopg2
from datetime import date
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


CITIES = [
    ("Stockholm", "11122"),
    ("Gothenburg", "41100"),
    ("Malmö", "21100"),
    ("Uppsala", "75310"),
    ("Västerås", "72210"),
    ("Linköping", "58220"),
]

STREETS = [
    "Storgatan",
    "Kungsgatan",
    "Drottninggatan",
    "Parkvägen",
    "Skogsvägen",
    "Strandvägen",
    "Stationsgatan",
    "Ängsvägen",
]

FIRST_NAMES = [
    "Erik",
    "Anna",
    "Noah",
    "Liam",
    "William",
    "Alice",
    "Maja",
    "Olivia",
    "Ebba",
    "Hugo",
]
SURNAMES = [
    "Andersson",
    "Johansson",
    "Karlsson",
    "Nilsson",
    "Eriksson",
    "Larsson",
    "Persson",
    "Svensson",
]

ENERGY_CLASSES = ["A", "B", "C", "D", "E", "F", "G"]

LISTING_IMAGE_URLS = [
    "https://images.unsplash.com/photo-1568605114967-8130f3a36994?auto=format&fit=crop&w=1600&q=70",
    "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=1600&q=70",
    "https://images.unsplash.com/photo-1572120360610-d971b9d7767c?auto=format&fit=crop&w=1600&q=70",
    "https://images.unsplash.com/photo-1502005229762-cf1b2da7c5d6?auto=format&fit=crop&w=1600&q=70",
    "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=70",
]


def rand_phone():
    return "07" + "".join(str(random.randint(0, 9)) for _ in range(8))


def rand_birthdate():
    y = random.randint(1960, 2006)
    return date(y, random.randint(1, 12), random.randint(1, 28))


def rand_name():
    return random.choice(FIRST_NAMES), random.choice(SURNAMES)


def rand_email(first, last, i):
    return f"{first.lower()}.{last.lower()}{i}@moonhem.example"


def insert_address(cur):
    city, postcode = random.choice(CITIES)
    street = random.choice(STREETS)
    street_full = f"{street} {random.randint(1, 99)}"
    cur.execute(
        "INSERT INTO addresses (street, city, postcode, country) VALUES (%s,%s,%s,%s) RETURNING id",
        (street_full, city, postcode, "Sweden"),
    )
    return cur.fetchone()[0]


def seed_database(
    n_companies=6,
    n_realtors=10,
    n_buyers=20,
    n_listings=80,
):
    print("Starting to seed database...")

    con = get_connection()
    cur = con.cursor()

    try:
        # 1) CLEANUP (order doesn't matter if CASCADE is used)
        print("Clearing old data...")
        tables = [
            "messages",
            "favorite",
            "listing_features",
            "listing_images",
            "realtor_agent",
            "listings",
            "features",
            "status",
            "property_types",
            "users",
            "realtor_companies",
            "addresses",
            "roles",
            "user_images",
        ]
        for table in tables:
            cur.execute(f"TRUNCATE TABLE {table} RESTART IDENTITY CASCADE;")

        # 2) ROLES
        print("Inserting roles...")
        roles = [
            ("Admin", "Super user"),
            ("Realtor", "Can sell houses"),
            ("User", "Looking to buy"),
        ]
        role_ids = {}
        for name, desc in roles:
            cur.execute(
                "INSERT INTO roles (name, description) VALUES (%s,%s) RETURNING id",
                (name, desc),
            )
            role_ids[name] = cur.fetchone()[0]

        # 3) STATUS
        print("Inserting statuses...")
        statuses = ["For Sale", "Sold", "Bidding in progress"]
        status_ids = {}
        for s in statuses:
            cur.execute("INSERT INTO status (status) VALUES (%s) RETURNING id", (s,))
            status_ids[s] = cur.fetchone()[0]

        # 4) PROPERTY TYPES
        print("Inserting property types...")
        types = ["Villa", "Apartment", "Cottage", "Row House"]
        type_ids = {}
        for t in types:
            cur.execute(
                "INSERT INTO property_types (name) VALUES (%s) RETURNING id", (t,)
            )
            type_ids[t] = cur.fetchone()[0]

        # 5) FEATURES
        print("Inserting features...")
        features = [
            "Balcony",
            "Fireplace",
            "Pool",
            "Garage",
            "Elevator",
            "Garden",
            "Sauna",
        ]
        feature_ids = []
        for f in features:
            cur.execute("INSERT INTO features (name) VALUES (%s) RETURNING id", (f,))
            feature_ids.append(cur.fetchone()[0])

        # 6) REALTOR COMPANIES
        print("Inserting realtor companies...")
        company_ids = []
        for i in range(n_companies):
            addr_id = insert_address(cur)
            company_name = f"MoonHem Agency {i + 1}"
            cur.execute(
                "INSERT INTO realtor_companies (name, address_id) VALUES (%s,%s) RETURNING id",
                (company_name, addr_id),
            )
            company_ids.append(cur.fetchone()[0])

        # 7) USERS (realtors + buyers)
        print("Inserting users...")
        realtor_user_ids = []
        buyer_user_ids = []

        # Realtors
        for i in range(n_realtors):
            first, last = rand_name()
            mail = rand_email(first, last, 1000 + i)
            addr_id = insert_address(cur)
            company_id = random.choice(company_ids)

            cur.execute(
                """
                INSERT INTO users (first_name, surname, mail, password, phone_number, role_id, address_id, company_id, birthdate)
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING id
                """,
                (
                    first,
                    last,
                    mail,
                    "secret123",
                    rand_phone(),
                    role_ids["Realtor"],
                    addr_id,
                    company_id,
                    rand_birthdate(),
                ),
            )
            user_id = cur.fetchone()[0]
            realtor_user_ids.append(user_id)

            # realtor_agent extra info
            cur.execute(
                "INSERT INTO realtor_agent (user_id, license_number) VALUES (%s,%s)",
                (user_id, f"LIC-{random.randint(100000, 999999)}"),
            )

        # Buyers
        for i in range(n_buyers):
            first, last = rand_name()
            mail = rand_email(first, last, 2000 + i)
            addr_id = insert_address(cur)

            cur.execute(
                """
                INSERT INTO users (first_name, surname, mail, password, phone_number, role_id, address_id, company_id, birthdate)
                VALUES (%s,%s,%s,%s,%s,%s,%s,NULL,%s)
                RETURNING id
                """,
                (
                    first,
                    last,
                    mail,
                    "buyer123",
                    rand_phone(),
                    role_ids["User"],
                    addr_id,
                    rand_birthdate(),
                ),
            )
            buyer_user_ids.append(cur.fetchone()[0])

        # 8) LISTINGS
        print("Inserting listings...")
        listing_ids = []
        for i in range(n_listings):
            addr_id = insert_address(cur)
            realtor_id = random.choice(realtor_user_ids)
            status_id = random.choice(list(status_ids.values()))
            property_type_id = random.choice(list(type_ids.values()))

            # Generate numbers
            living_area = round(random.uniform(25, 240), 2)
            room_count = random.randint(1, 8)
            lot_size = round(random.uniform(0, 2500), 2)
            year_built = random.randint(1930, 2024)
            floor_number = random.randint(0, 12)
            price = round(living_area * random.randint(25000, 65000), 2)

            title = f"Modern home #{i + 1}"
            description = "Bright and well-planned home with great location, close to transport and services."

            cur.execute(
                """
                INSERT INTO listings (
                    title, description, price, living_area, lot_size, room_count,
                    year_built, floor_number, energy_class, renovation_year,
                    address_id, property_type_id, realtor_id, status_id
                )
                VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s,%s)
                RETURNING id
                """,
                (
                    title,
                    description,
                    price,
                    living_area,
                    lot_size,
                    room_count,
                    year_built,
                    floor_number,
                    random.choice(ENERGY_CLASSES),
                    random.choice([None, None, random.randint(1995, 2024)]),
                    addr_id,
                    property_type_id,
                    realtor_id,
                    status_id,
                ),
            )
            listing_id = cur.fetchone()[0]
            listing_ids.append(listing_id)

            # listing_images (1-5)
            for j in range(random.randint(1, 5)):
                cur.execute(
                    "INSERT INTO listing_images (listing_id, caption, url) VALUES (%s,%s,%s)",
                    (listing_id, f"Photo {j + 1}", random.choice(LISTING_IMAGE_URLS)),
                )

            # listing_features (0-5)
            for fid in random.sample(
                feature_ids, k=random.randint(0, min(5, len(feature_ids)))
            ):
                cur.execute(
                    """
                    INSERT INTO listing_features (listing_id, feature_id)
                    VALUES (%s,%s)
                    ON CONFLICT (listing_id, feature_id) DO NOTHING
                    """,
                    (listing_id, fid),
                )

        con.commit()
        print("✅ Database seeded successfully!")
        print(
            f"Inserted: {len(company_ids)} companies, {len(realtor_user_ids)} realtors, {len(buyer_user_ids)} buyers, {len(listing_ids)} listings"
        )

    except Exception as e:
        print(f"❌ Error seeding database: {e}")
        con.rollback()
    finally:
        con.close()


if __name__ == "__main__":
    seed_database()
