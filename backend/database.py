import sqlite3
import datetime

DB_NAME = "audit.db"

def init_db():
    """Creates the audit table if it doesn't exist."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute('''
        CREATE TABLE IF NOT EXISTS audit_logs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            timestamp TEXT,
            filename TEXT,
            action TEXT,         -- "MASK" or "RESTORE"
            risk_score TEXT,     -- "HIGH", "MEDIUM", "LOW"
            details TEXT
        )
    ''')
    conn.commit()
    conn.close()

def log_event(filename, action, risk_score="N/A", details=""):
    """Saves an event to the database."""
    try:
        conn = sqlite3.connect(DB_NAME)
        c = conn.cursor()
        timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
        c.execute("INSERT INTO audit_logs (timestamp, filename, action, risk_score, details) VALUES (?, ?, ?, ?, ?)",
                  (timestamp, filename, action, risk_score, details))
        conn.commit()
        conn.close()
    except Exception as e:
        print(f"Database Error: {e}")

def get_logs():
    """Fetches all logs for the dashboard."""
    conn = sqlite3.connect(DB_NAME)
    c = conn.cursor()
    c.execute("SELECT * FROM audit_logs ORDER BY id DESC")
    rows = c.fetchall()
    conn.close()
    
    # Convert to list of dicts
    logs = []
    for r in rows:
        logs.append({
            "id": r[0],
            "timestamp": r[1],
            "filename": r[2],
            "action": r[3],
            "risk_score": r[4],
            "details": r[5]
        })
    return logs