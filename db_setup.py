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


def create_tables():
    commands = [
        # ROLES
        """
        CREATE TABLE IF NOT EXISTS roles (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL,
            description TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """,
        # ADDRESSES
        """
        CREATE TABLE IF NOT EXISTS addresses (
            id SERIAL PRIMARY KEY,
            street VARCHAR(255),
            city VARCHAR(100),
            postcode VARCHAR(100),
            country VARCHAR(100)
        );
        """,
        # REALTOR COMPANIES
        """
        CREATE TABLE IF NOT EXISTS realtor_companies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL,
            address_id INT REFERENCES addresses(id),
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """,
        # USERS
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            address_id INT REFERENCES addresses(id),
            role_id INT REFERENCES roles(id),
            company_id INT REFERENCES realtor_companies(id),
            first_name VARCHAR(100),
            surname VARCHAR(100),
            mail VARCHAR(255) UNIQUE NOT NULL,
            password TEXT NOT NULL,
            phone_number VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            birthdate DATE
        );
        """,
        # REALTOR AGENT (EXTRA INFO)
        """
        CREATE TABLE IF NOT EXISTS realtor_agent (
            id SERIAL PRIMARY KEY,
            user_id INT UNIQUE REFERENCES users(id) ON DELETE CASCADE,
            license_number VARCHAR(100)
        );
        """,
        # PROPERTY TYPES
        """
        CREATE TABLE IF NOT EXISTS property_types (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) UNIQUE NOT NULL
        );
        """,
        # STATUS TABLE
        """
        CREATE TABLE IF NOT EXISTS status (
            id SERIAL PRIMARY KEY,
            status VARCHAR(100) UNIQUE NOT NULL
        );
        """,
        # FEATURES TABLE
        """
        CREATE TABLE IF NOT EXISTS features (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) UNIQUE NOT NULL
        );
        """,
        # LISTINGS
        """
        CREATE TABLE IF NOT EXISTS listings (
            id SERIAL PRIMARY KEY,
            address_id INT REFERENCES addresses(id),
            property_type_id INT REFERENCES property_types(id),
            realtor_id INT REFERENCES users(id),
            status_id INT REFERENCES status(id),
            title VARCHAR(255) NOT NULL,
            description TEXT,
            price NUMERIC(12,2),
            living_area NUMERIC(12,2),
            lot_size NUMERIC(12,2),
            room_count INT,
            year_built INT,
            floor_number INT,
            energy_class VARCHAR(100),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            renovation_year INT
        );
        """,
        # Bridge Table
        """
        CREATE TABLE IF NOT EXISTS listing_features (
            listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
            feature_id INT REFERENCES features(id) ON DELETE CASCADE,
            PRIMARY KEY (listing_id, feature_id)
        );
        """,
        # FAVORITES
        """
        CREATE TABLE IF NOT EXISTS favorite (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            UNIQUE (user_id, listing_id)
        );
        """,
        # MESSAGES
        """
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            sender_id INT REFERENCES users(id),
            receiver_id INT REFERENCES users(id),
            listing_id INT REFERENCES listings(id),
            content TEXT,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """,
        # LISTING IMAGES
        """
        CREATE TABLE IF NOT EXISTS listing_images (
            id SERIAL PRIMARY KEY,
            listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
            caption VARCHAR(255),
            url TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """,
        # USER IMAGES
        """
        CREATE TABLE IF NOT EXISTS user_images (
            id SERIAL PRIMARY KEY,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            caption VARCHAR(255),
            url TEXT NOT NULL,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """,
    ]

    try:
        with get_connection() as con:
            with con.cursor() as cur:
                for command in commands:
                    cur.execute(command)
                print("Tables created successfully.")
    except Exception as e:
        print(f"Error creating tables: {e}")


if __name__ == "__main__":
    create_tables()
