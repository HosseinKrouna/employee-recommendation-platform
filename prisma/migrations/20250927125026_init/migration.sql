CREATE TYPE "public"."UserRole" AS ENUM ('EMPLOYEE', 'HR', 'ADMIN');

CREATE TYPE "public"."RecommendationStatus" AS ENUM ('SUBMITTED', 'IN_REVIEW', 'APPROVED', 'REJECTED', 'WITHDRAWN');

CREATE TABLE "public"."users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" "public"."UserRole" NOT NULL DEFAULT 'EMPLOYEE',
    "department" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "public"."recommendations" (
    "id" TEXT NOT NULL,
    "candidateName" TEXT NOT NULL,
    "candidateEmail" TEXT NOT NULL,
    "candidatePhone" TEXT,
    "position" TEXT NOT NULL,
    "department" TEXT NOT NULL,
    "skills" TEXT[],
    "experience" TEXT NOT NULL,
    "notes" TEXT,
    "cvFileName" TEXT,
    "cvFilePath" TEXT,
    "status" "public"."RecommendationStatus" NOT NULL DEFAULT 'SUBMITTED',
    "recommendedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "recommendations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "users_email_key" ON "public"."users"("email");

ALTER TABLE "public"."recommendations" ADD CONSTRAINT "recommendations_recommendedById_fkey" FOREIGN KEY ("recommendedById") REFERENCES "public"."users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
