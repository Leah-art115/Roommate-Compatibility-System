/*
  Warnings:

  - The values [MATCHED] on the enum `BookingStatus` will be removed. If these variants are still used in the database, this will fail.
  - You are about to drop the `RoommateMatch` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "SwitchRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- AlterEnum
BEGIN;
CREATE TYPE "BookingStatus_new" AS ENUM ('NOT_STARTED', 'QUIZ_DONE', 'ALLOCATED');
ALTER TABLE "User" ALTER COLUMN "bookingStatus" DROP DEFAULT;
ALTER TABLE "User" ALTER COLUMN "bookingStatus" TYPE "BookingStatus_new" USING ("bookingStatus"::text::"BookingStatus_new");
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
ALTER TYPE "BookingStatus_new" RENAME TO "BookingStatus";
DROP TYPE "BookingStatus_old";
ALTER TABLE "User" ALTER COLUMN "bookingStatus" SET DEFAULT 'NOT_STARTED';
COMMIT;

-- DropForeignKey
ALTER TABLE "RoommateMatch" DROP CONSTRAINT "RoommateMatch_user1Id_fkey";

-- DropForeignKey
ALTER TABLE "RoommateMatch" DROP CONSTRAINT "RoommateMatch_user2Id_fkey";

-- AlterTable
ALTER TABLE "Room" ADD COLUMN     "gender" TEXT,
ALTER COLUMN "capacity" SET DEFAULT 4;

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "switchCount" INTEGER NOT NULL DEFAULT 0;

-- DropTable
DROP TABLE "RoommateMatch";

-- CreateTable
CREATE TABLE "RoomSwitchRequest" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "fromRoomId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "status" "SwitchRequestStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "RoomSwitchRequest_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "RoomSwitchRequest" ADD CONSTRAINT "RoomSwitchRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RoomSwitchRequest" ADD CONSTRAINT "RoomSwitchRequest_fromRoomId_fkey" FOREIGN KEY ("fromRoomId") REFERENCES "Room"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
