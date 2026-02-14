-- ============================================
-- Money Manager - Database Initialization Script
-- ============================================
-- Run this script in your production PostgreSQL database BEFORE deploying
-- if you want to use ddl-auto=validate (recommended for production)
-- ============================================

-- Create profiles table
CREATE TABLE IF NOT EXISTS tbl_profiles (
    id BIGSERIAL PRIMARY KEY,
    full_name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    password VARCHAR(255),
    profile_image_url VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT FALSE,
    activation_token VARCHAR(255)
);

-- Create indexes for profiles
CREATE INDEX IF NOT EXISTS idx_email ON tbl_profiles(email);
CREATE INDEX IF NOT EXISTS idx_activation_token ON tbl_profiles(activation_token);

-- Create categories table
CREATE TABLE IF NOT EXISTS tbl_categories (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    type VARCHAR(255),
    icon VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    profile_id BIGINT NOT NULL,
    CONSTRAINT fk_category_profile FOREIGN KEY (profile_id) REFERENCES tbl_profiles(id)
);

-- Create incomes table
CREATE TABLE IF NOT EXISTS tbl_incomes (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    icon VARCHAR(255),
    date TIMESTAMP,
    amount DECIMAL(19,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id BIGINT NOT NULL,
    profile_id BIGINT NOT NULL,
    CONSTRAINT fk_income_category FOREIGN KEY (category_id) REFERENCES tbl_categories(id),
    CONSTRAINT fk_income_profile FOREIGN KEY (profile_id) REFERENCES tbl_profiles(id)
);

-- Create expenses table
CREATE TABLE IF NOT EXISTS tbl_expenses (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(255),
    icon VARCHAR(255),
    date TIMESTAMP,
    amount DECIMAL(19,2),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    category_id BIGINT NOT NULL,
    profile_id BIGINT NOT NULL,
    CONSTRAINT fk_expense_category FOREIGN KEY (category_id) REFERENCES tbl_categories(id),
    CONSTRAINT fk_expense_profile FOREIGN KEY (profile_id) REFERENCES tbl_profiles(id)
);

-- Verify tables were created
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
AND table_name IN ('tbl_profiles', 'tbl_categories', 'tbl_incomes', 'tbl_expenses');

