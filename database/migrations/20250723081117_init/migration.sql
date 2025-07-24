-- CreateEnum
CREATE TYPE "OrganisationRole" AS ENUM ('Owner', 'Admin', 'Member');

-- CreateTable
CREATE TABLE "warranties" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "categories" TEXT[],
    "price" MONEY NOT NULL,
    "purchase_date" TIMESTAMP(3) NOT NULL,
    "expiration_date" TIMESTAMP(3) NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "warranties_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
    "id" UUID NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT DEFAULT 'Default organisation',
    "is_custom" BOOLEAN NOT NULL DEFAULT false,
    "owner_user_id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "organisations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "organisations_on_users" (
    "user_id" UUID NOT NULL,
    "organisation_id" INTEGER NOT NULL,
    "role" "OrganisationRole" NOT NULL DEFAULT 'Member',

    CONSTRAINT "organisations_on_users_pkey" PRIMARY KEY ("user_id","organisation_id")
);

-- AddForeignKey
ALTER TABLE "warranties" ADD CONSTRAINT "warranties_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisations" ADD CONSTRAINT "organisations_owner_user_id_fkey" FOREIGN KEY ("owner_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisations_on_users" ADD CONSTRAINT "organisations_on_users_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "organisations_on_users" ADD CONSTRAINT "organisations_on_users_organisation_id_fkey" FOREIGN KEY ("organisation_id") REFERENCES "organisations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
