-- Migration script to add new fields to Pharmacy table
-- Run this manually in your database if needed

-- Add new columns to Pharmacy table (if they don't exist)
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "city" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "state" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "pincode" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "email" TEXT;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "operatingHours" JSONB;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "services" JSONB;
ALTER TABLE "Pharmacy" ADD COLUMN IF NOT EXISTS "isActive" BOOLEAN DEFAULT true;

-- Update existing records to have default values
UPDATE "Pharmacy" SET "isActive" = true WHERE "isActive" IS NULL;

-- Create index on location for better performance
CREATE INDEX IF NOT EXISTS "Pharmacy_location_idx" ON "Pharmacy" ("latitude", "longitude");
CREATE INDEX IF NOT EXISTS "Pharmacy_isActive_idx" ON "Pharmacy" ("isActive");

-- Verify the changes
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'Pharmacy' 
ORDER BY ordinal_position;
