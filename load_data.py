import sqlite3
import csv
import os
import logging

logging.basicConfig(
    filename='logger.log',
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

DB_FILE = "cell_counts.db"
CSV_FILE = "cell-count.csv"


def init_db():
    logging.info("Part 1: Loading data into database")

    conn = sqlite3.connect(DB_FILE)
    cursor = conn.cursor()

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS projects (
            project_id TEXT PRIMARY KEY
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS subjects (
            subject_id TEXT PRIMARY KEY,
            project_id TEXT,
            condition TEXT,
            age INTEGER,
            sex TEXT,
            treatment TEXT,
            response TEXT,
            FOREIGN KEY (project_id) REFERENCES projects(project_id)
        )
    """)

    cursor.execute("""
        CREATE TABLE IF NOT EXISTS samples (
            sample_id TEXT PRIMARY KEY,
            subject_id TEXT,
            sample_type TEXT,
            time_from_treatment_start INTEGER,
            b_cell INTEGER,
            cd8_t_cell INTEGER,
            cd4_t_cell INTEGER,
            nk_cell INTEGER,
            monocyte INTEGER,
            FOREIGN KEY (subject_id) REFERENCES subjects(subject_id)
        )
    """)

    conn.commit()
    return conn


def load_data(conn):
    cursor = conn.cursor()

    projects_seen = set()
    subjects_seen = set()

    with open(CSV_FILE, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)

        for row in reader:
            if row["project"] not in projects_seen:
                projects_seen.add(row["project"])
                cursor.execute(
                    "INSERT OR IGNORE INTO projects (project_id) VALUES (?)",
                    (row["project"],)
                )

            if row["subject"] not in subjects_seen:
                subjects_seen.add(row["subject"])

                age = int(row["age"]) if row["age"].isdigit() else None

                cursor.execute(
                    """INSERT OR IGNORE INTO subjects 
                       (subject_id, project_id, condition, age, sex, treatment, response) 
                       VALUES (?, ?, ?, ?, ?, ?, ?)""",
                    (row["subject"], row["project"], row["condition"], age,
                     row["sex"], row["treatment"], row["response"])
                )

            cursor.execute(
                """INSERT OR IGNORE INTO samples 
                   (sample_id, subject_id, sample_type, time_from_treatment_start, 
                    b_cell, cd8_t_cell, cd4_t_cell, nk_cell, monocyte) 
                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
                (row["sample"], row["subject"], row["sample_type"],
                 int(row["time_from_treatment_start"]), int(row["b_cell"]),
                 int(row["cd8_t_cell"]), int(row["cd4_t_cell"]),
                 int(row["nk_cell"]), int(row["monocyte"]))
            )

    conn.commit()
    logging.info(f"Schema initialized and data successfully loaded into {DB_FILE}")


if __name__ == "__main__":
    if not os.path.exists(CSV_FILE):
        logging.error(f"Error: Could not find {CSV_FILE} in the current directory.")
    else:
        conn = init_db()
        load_data(conn)
        conn.close()