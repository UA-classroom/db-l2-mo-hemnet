import os

import psycopg2
from dotenv import load_dotenv

load_dotenv(override=True)

DATABASE_NAME = os.getenv("DATABASE_NAME")  # MoonHem
PASSWORD = os.getenv("PASSWORD")  # MoonHem2020


def get_connection():
    """
    Function that returns a single connection
    In reality, we might use a connection pool, since
    this way we'll start a new connection each time
    someone hits one of our endpoints, which isn't great for performance
    """
    return psycopg2.connect(
        dbname=DATABASE_NAME,
        user="postgres",  # change if needed
        password=PASSWORD,
        host="localhost",  # change if needed
        port="5432",  # change if needed
    )


def create_tables():
    """
    A function to create the necessary tables for the project.
    """
    commands = [
        # ADDRESSES
        """
        CREATE TABLE IF NOT EXISTS addresses (
            id SERIAL PRIMARY KEY,
            street VARCHAR(255) NOT NULL,
            city VARCHAR(255) NOT NULL,
            postcode VARCHAR(20) NOT NULL,
            country VARCHAR(100) NOT NULL
        );
        """,
        # REALTOR COMPANIES
        """
        CREATE TABLE IF NOT EXISTS realtor_companies (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            address_id INT REFERENCES addresses(id) ON DELETE SET NULL,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            phone VARCHAR(50)
        );
        """,
        # USERS
        """
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            first_name VARCHAR(255) NOT NULL,
            surname VARCHAR(255) NOT NULL,
            mail VARCHAR(255) UNIQUE NOT NULL,
            password VARCHAR(255) NOT NULL,
            phone_number VARCHAR(50),
            created_at TIMESTAMPTZ DEFAULT NOW(),
            birthdate DATE,
            role VARCHAR(50) NOT NULL,
            address_id INT REFERENCES addresses(id) ON DELETE SET NULL,
            company_id INT REFERENCES realtor_companies(id) ON DELETE SET NULL
        );
        """,
        # PROPERTY TYPES
        """
        CREATE TABLE IF NOT EXISTS property_types (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255) NOT NULL
        );
        """,
        # ENUM TYPE (SAFE CREATION)
        """
        DO $$ BEGIN
            CREATE TYPE listing_status AS ENUM ('active', 'sold', 'deleted');
        EXCEPTION
            WHEN duplicate_object THEN null;
        END $$;
        """,
        # LISTINGS
        """
        CREATE TABLE IF NOT EXISTS listings (
            id SERIAL PRIMARY KEY,
            title VARCHAR(255) NOT NULL,
            description TEXT NOT NULL,
            price NUMERIC(12,2) NOT NULL,
            living_area NUMERIC(8,2),
            secondary_area NUMERIC(8,2),
            lot_size NUMERIC(8,2),
            status listing_status DEFAULT 'active',
            room_count INT,
            year_built INT,
            balcony BOOLEAN,
            floor_number INT,
            energy_class VARCHAR(10),
            address_id INT REFERENCES addresses(id) ON DELETE CASCADE,
            property_type_id INT REFERENCES property_types(id) ON DELETE SET NULL,
            realtor_id INT REFERENCES users(id) ON DELETE SET NULL
        );
        """,
        # IMAGES
        """
        CREATE TABLE IF NOT EXISTS images (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            caption VARCHAR(255),
            url TEXT NOT NULL,
            listing_id INT REFERENCES listings(id) ON DELETE CASCADE
        );
        """,
        # FAVORITES
        """
        CREATE TABLE IF NOT EXISTS favorites (
            id SERIAL PRIMARY KEY,
            created_at TIMESTAMPTZ DEFAULT NOW(),
            listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
            user_id INT REFERENCES users(id) ON DELETE CASCADE,
            UNIQUE (user_id, listing_id)
        );
        """,
        # MESSAGES
        """
        CREATE TABLE IF NOT EXISTS messages (
            id SERIAL PRIMARY KEY,
            sender_id INT REFERENCES users(id) ON DELETE CASCADE,
            receiver_id INT REFERENCES users(id) ON DELETE CASCADE,
            content TEXT NOT NULL,
            listing_id INT REFERENCES listings(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ DEFAULT NOW()
        );
        """,
    ]

    connection = get_connection()
    # Implement
    cursor = connection.cursor()

    for command in commands:
        cursor.execute(command)

    connection.commit()
    cursor.close()
    connection.close()


if __name__ == "__main__":
    # Only reason to execute this file would be to create new tables, meaning it serves a migration file
    create_tables()
    print("Tables created successfully.")
