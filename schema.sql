DROP TABLE IF EXISTS UserTaxes;
CREATE TABLE IF NOT EXISTS UserTaxes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_email TEXT UNIQUE,
    language_pref TEXT DEFAULT 'en',
    raw_story TEXT,
    extracted_income REAL,
    extracted_deductions REAL,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
