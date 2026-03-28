/*
  Warnings:

  - Added the required column `name` to the `Invite` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Invite" ADD COLUMN     "gender" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;
