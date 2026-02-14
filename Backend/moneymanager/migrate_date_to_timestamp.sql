-- SQL Migration Script: Update date columns from DATE to TIMESTAMP
-- Run this in pgAdmin Query Tool on the MoneyManager database

-- Step 1: Update tbl_incomes date column to TIMESTAMP
ALTER TABLE tbl_incomes
ALTER COLUMN date TYPE TIMESTAMP
USING date::timestamp;

-- Step 2: Update tbl_expenses date column to TIMESTAMP
ALTER TABLE tbl_expenses
ALTER COLUMN date TYPE TIMESTAMP
USING date::timestamp;

-- Verify the changes
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name IN ('tbl_incomes', 'tbl_expenses')
AND column_name = 'date';

