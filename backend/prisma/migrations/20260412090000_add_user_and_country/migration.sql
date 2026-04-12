-- Add country column to City (default empty string for existing rows)
ALTER TABLE "City" ADD COLUMN "country" TEXT NOT NULL DEFAULT '';

-- Drop old unique constraint and add new one with country
DROP INDEX IF EXISTS "City_name_state_key";
CREATE UNIQUE INDEX "City_name_state_country_key" ON "City"("name", "state", "country");

-- Create User table
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
