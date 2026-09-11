import sqlite3

def inspect():
    conn = sqlite3.connect('sih_backend.db')
    cursor = conn.cursor()
    tables = cursor.execute("SELECT name FROM sqlite_master WHERE type='table';").fetchall()
    print('Tables in SQLite:', tables)
    for (table_name,) in tables:
        count = cursor.execute(f'SELECT count(*) FROM {table_name}').fetchone()[0]
        schema = cursor.execute(f'PRAGMA table_info({table_name})').fetchall()
        print(f'\n--- Table: {table_name} ({count} rows) ---')
        for col in schema:
            print(f'  {col[1]} ({col[2]})')
        sample = cursor.execute(f'SELECT * FROM {table_name} LIMIT 2').fetchall()
        print('  Sample rows:', sample)

if __name__ == '__main__':
    inspect()
