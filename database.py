import sqlite3
from pathlib import Path

DB_PATH = Path(__file__).resolve().parent / "biblioteca_comunitaria.db"


def get_connection():
    connection = sqlite3.connect(DB_PATH, check_same_thread=False)
    connection.row_factory = sqlite3.Row
    connection.execute("PRAGMA foreign_keys = ON")
    return connection

def get_db():
    connection =get_connection()
    try:
        yield connection
    finally:
        connection.close()