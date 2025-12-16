import psycopg2
from psycopg2.extras import RealDictCursor


# LISTINGS FUNCTIONS


def create_listing(
    con,
    title,
    description,
    price,
    living_area,
    lot_size,
    room_count,
    year_built,
    floor_number,
    energy_class,
    renovation_year,
    address_id,
    property_type_id,
    realtor_id,
    status_id,
):
    with con:
        with con.cursor() as cur:
            cur.execute(
                """
                INSERT INTO listings (
                    title, description, price, living_area, lot_size, room_count, 
                    year_built, floor_number, energy_class, renovation_year,
                    address_id, property_type_id, realtor_id, status_id
                )
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)
                RETURNING id;
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
                    energy_class,
                    renovation_year,
                    address_id,
                    property_type_id,
                    realtor_id,
                    status_id,
                ),
            )

            # We want to know the ID of the new house we just created
            new_id = cur.fetchone()[0]
            return new_id


def delete_listing(con, listing_id):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "DELETE FROM listings WHERE id = %s RETURNING id;", (listing_id,)
            )
            deleted_id = cur.fetchone()
            return deleted_id  # This will be None if nothing was deleted


def update_listing(
    con,
    listing_id,
    title,
    description,
    price,
    living_area,
    lot_size,
    room_count,
    year_built,
    floor_number,
    energy_class,
    renovation_year,
    address_id,
    property_type_id,
    realtor_id,
    status_id,
):
    """
    Update all fields for specific listing.
    """
    with con:
        with con.cursor() as cur:
            cur.execute(
                """
                UPDATE listings
                SET title = %s,
                    description = %s,
                    price = %s,
                    living_area = %s,
                    lot_size = %s,
                    room_count = %s,
                    year_built = %s,
                    floor_number = %s,
                    energy_class = %s,
                    renovation_year = %s,
                    address_id = %s,
                    property_type_id = %s,
                    realtor_id = %s,
                    status_id = %s
                WHERE id = %s
                RETURNING id;
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
                    energy_class,
                    renovation_year,
                    address_id,
                    property_type_id,
                    realtor_id,
                    status_id,
                    listing_id,
                ),
            )
            update_id = cur.fetchone()
            return update_id


def get_all_listings_full(con):
    with con, con.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
                l.*,
                a.street AS address,
                a.city,
                a.postcode,
                a.country,
                pt.name AS property_type
            FROM listings l
            LEFT JOIN addresses a ON l.address_id = a.id
            LEFT JOIN property_types pt ON l.property_type_id = pt.id;
            """
        )
        return cur.fetchall()


def get_one_listing_full(con, listing_id):
    with con, con.cursor(cursor_factory=RealDictCursor) as cur:
        cur.execute(
            """
            SELECT
                l.*,
                a.street AS address,
                a.city,
                a.postcode,
                a.country,
                pt.name AS property_type
            FROM listings l
            LEFT JOIN addresses a ON l.address_id = a.id
            LEFT JOIN property_types pt ON l.property_type_id = pt.id
            WHERE l.id = %s;
            """,
            (listing_id,),
        )
        return cur.fetchone()


# USERS FUNCTIONS


def get_all_users(con):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users;")
            return cur.fetchall()


def create_user(
    con,
    first_name,
    surname,
    mail,
    password,
    phone_number,
    birthdate,
    role_id,
    address_id,
    company_id,
):
    with con:
        with con.cursor() as cur:
            cur.execute(
                """
                INSERT INTO users (first_name, surname, mail, password, phone_number, birthdate, role_id, address_id, company_id)
                VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s)                     
                        RETURNING id;
                """,
                (
                    first_name,
                    surname,
                    mail,
                    password,
                    phone_number,
                    birthdate,
                    role_id,
                    address_id,
                    company_id,
                ),
            )
            return cur.fetchone()[0]


def get_one_user(con, user_id):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM users WHERE id = %s", (user_id,))
            return cur.fetchone()


def delete_user(con, user_id):
    with con:
        with con.cursor() as cur:
            cur.execute("DELETE FROM users WHERE id = %s RETURNING id;", (user_id,))
            return cur.fetchone()


def update_user(
    con,
    user_id,
    first_name,
    surname,
    mail,
    password,
    phone_number,
    birthdate,
    role_id,
    address_id,
    company_id,
):
    with con:
        with con.cursor() as cur:
            cur.execute(
                """
                UPDATE users 
                SET first_name = %s,
                    surname = %s,
                    mail = %s,
                    password = %s,
                    phone_number = %s,
                    birthdate = %s,
                    role_id = %s,
                    address_id = %s,
                    company_id = %s
                WHERE id = %s
                RETURNING id;
            """,
                (
                    first_name,
                    surname,
                    mail,
                    password,
                    phone_number,
                    birthdate,
                    role_id,
                    address_id,
                    company_id,
                    user_id,
                ),
            )
            return cur.fetchone()


# COMPANIES FUNCTIONS


def get_all_companies(con):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM realtor_companies;")
            return cur.fetchall()


def get_one_company(con, company_id):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM realtor_companies WHERE id = %s", (company_id,))
            return cur.fetchone()


def create_company(con, name, address_id):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "INSERT INTO realtor_companies (name, address_id) VALUES (%s, %s) RETURNING id;",
                (name, address_id),
            )
            return cur.fetchone()[0]


def delete_company(con, company_id):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "DELETE FROM realtor_companies WHERE id = %s RETURNING id;",
                (company_id,),
            )
            return cur.fetchone()


def update_company(con, company_id, name, address_id):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "UPDATE realtor_companies SET name = %s, address_id = %s WHERE id = %s RETURNING id;",
                (name, address_id, company_id),
            )
            return cur.fetchone()


# ADDRESSES FUNCTIONS


def get_all_addresses(con):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM addresses;")
            return cur.fetchall()


def get_one_address(con, address_id):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM addresses WHERE id = %s", (address_id,))
            return cur.fetchone()


def create_address(con, street, city, postcode, country):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "INSERT INTO addresses (street, city, postcode, country) VALUES (%s, %s, %s, %s) RETURNING id;",
                (street, city, postcode, country),
            )
            return cur.fetchone()[0]


def delete_address(con, address_id):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "DELETE FROM addresses WHERE id = %s RETURNING id;", (address_id,)
            )
            return cur.fetchone()


def update_address(con, address_id, street, city, postcode, country):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "UPDATE addresses SET street = %s, city = %s, postcode = %s, country = %s WHERE id = %s RETURNING id;",
                (street, city, postcode, country, address_id),
            )
            return cur.fetchone()


# FEATURE FUNCTIONS


def get_all_features(con):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM features;")
            return cur.fetchall()


def get_one_feature(con, feature_id):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute("SELECT * FROM features WHERE id = %s", (feature_id,))
            return cur.fetchone()


def create_feature(con, name):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "INSERT INTO features (name) VALUES (%s) RETURNING id;", (name,)
            )
            return cur.fetchone()[0]


def delete_feature(con, feature_id):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "DELETE FROM features WHERE id = %s RETURNING id;", (feature_id,)
            )
            return cur.fetchone()


def update_feature(con, feature_id, name):
    with con:
        with con.cursor() as cur:
            cur.execute(
                "UPDATE features SET name = %s WHERE id = %s RETURNING id;",
                (name, feature_id),
            )
            return cur.fetchone()


# PATCH LISTINGS FUNCTIONS


def update_listing_price(con, listing_id, new_price):
    with con:
        with con.cursor() as cur:
            # Updating the price.
            cur.execute(
                "UPDATE listings SET price = %s WHERE id = %s RETURNING id;",
                (new_price, listing_id),
            )
            return cur.fetchone()


def update_listing_status(con, listing_id, new_status_id):
    with con:
        with con.cursor() as cur:
            # Updating the status_id.
            cur.execute(
                "UPDATE listings SET status_id = %s WHERE id = %s RETURNING id;",
                (new_status_id, listing_id),
            )
            return cur.fetchone()


# MESSAGE FUNCTIONS


def create_message(con, sender_id, receiver_id, listing_id, content):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                INSERT INTO messages (sender_id, receiver_id, listing_id, content)
                VALUES (%s, %s, %s, %s)
                RETURNING id, sender_id, receiver_id, listing_id, content, created_at;
                """,
                (sender_id, receiver_id, listing_id, content),
            )
            return cur.fetchone()


def get_messages_for_listing(con, listing_id):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT * FROM messages
                WHERE listing_id = %s
                ORDER BY created_at DESC;
                """,
                (listing_id,),
            )
            return cur.fetchall()


def get_messages_for_user(con, user_id):
    with con:
        with con.cursor(cursor_factory=RealDictCursor) as cur:
            cur.execute(
                """
                SELECT * FROM messages
                WHERE sender_id = %s OR receiver_id = %s
                ORDER BY created_at DESC;
                """,
                (user_id, user_id),
            )
            return cur.fetchall()
