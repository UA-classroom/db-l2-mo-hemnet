import psycopg2
from psycopg2.extras import RealDictCursor
from db_setup import get_connection
from typing import Optional, Dict, Any

"""
This file is responsible for making database queries, which your fastapi endpoints/routes can use.
The reason we split them up is to avoid clutter in the endpoints, so that the endpoints might focus on other tasks 

- Try to return results with cursor.fetchall() or cursor.fetchone() when possible
- Make sure you always give the user response if something went right or wrong, sometimes 
you might need to use the RETURNING keyword to garantuee that something went right / wrong
e.g when making DELETE or UPDATE queries
- No need to use a class here
- Try to raise exceptions to make them more reusable and work a lot with returns
- You will need to decide which parameters each function should receive. All functions 
start with a connection parameter.
- Below, a few inspirational functions exist - feel free to completely ignore how they are structured
- E.g, if you decide to use psycopg3, you'd be able to directly use pydantic models with the cursor, these examples are however using psycopg2 and RealDictCursor
"""


def get_all_users():
    """
    Returns a list of all users as dictionaries.
    """
    connection = get_connection()

    with connection:
        with connection.cursor(
            cursor_factory=RealDictCursor
        ) as cursor:  # RealDictCursor sort them as dic in better format.
            cursor.execute("""
                SELECT
                    id,first_name, surname, mail, phone_number, created_at, birthdate, role, address_id, company_id
                    from users;
            """)

            users = cursor.fetchall()  # List all user as a dict rows.
            return users


def get_user_by_id(user_id: int):
    """
    Returns a single user as a dict, or None if the user donsn't exist
    """


def create_user(
    first_name: str,
    surname: str,
    mail: str,
    password: str,
    phone_number: Optional[str] = None,
    birthdate: Optional[str] = None,
    role: str = "customer",
    address_id: Optional[int] = None,
    company_id: Optional[int] = None,
) -> Dict[str, any]:
    connection = get_connection()
    cursor = connection.cursor()

    # Inserts a new user row into the database and returns the created user as a dict.
    insert_query = """
        INSERT INTO users (
            first_name,
            surname,
            mail,
            password,
            phone_number,
            birthdate,
            role,
            address_id,
            company_id
        )
        VALUES (%s,%s,%s,%s,%s,%s,%s,%s,%s) 
        RETURNING id, first_name, surname, mail, phone_number, created_id, birthdate, role, address_id, company_id;
    """

    cursor.execute(
        insert_query,
        (
            first_name,
            surname,
            mail,
            password,
            phone_number,
            birthdate,
            role,
            address_id,
            company_id,
        ),
    )

    row = cursor.fetchone()  # Getting the return Row
    connection.commit()
    cursor.close()
    connection.close()

    return {
        "id": row[0],
        "first_name": row[1],
        "surname": row[2],
        "mail": row[3],
        "phone_number": row[4],
        "created_at": row[5],
        "birthdate": row[6],
        "role": row[7],
        "address_id": row[8],
        "company_id": row[9],
    }


### THIS IS JUST AN EXAMPLE OF A FUNCTION FOR INSPIRATION FOR A LIST-OPERATION (FETCHING MANY ENTRIES)
# def get_items(con):
#     with con:
#         with con.cursor(cursor_factory=RealDictCursor) as cursor:
#             cursor.execute("SELECT * FROM items;")
#             items = cursor.fetchall()
#     return items


### THIS IS JUST INSPIRATION FOR A DETAIL OPERATION (FETCHING ONE ENTRY)
# def get_item(con, item_id):
#     with con:
#         with con.cursor(cursor_factory=RealDictCursor) as cursor:
#             cursor.execute("""SELECT * FROM items WHERE id = %s""", (item_id,))
#             item = cursor.fetchone()
#             return item


### THIS IS JUST INSPIRATION FOR A CREATE-OPERATION
# def add_item(con, title, description):
#     with con:
#         with con.cursor(cursor_factory=RealDictCursor) as cursor:
#             cursor.execute(
#                 "INSERT INTO items (title, description) VALUES (%s, %s) RETURNING id;",
#                 (title, description),
#             )
#             item_id = cursor.fetchone()["id"]
#     return item_id
