/*
  Warnings:

  - The `visibility` column on the `blog_members` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- CreateEnum
CREATE TYPE "BlogMemberVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- AlterTable
ALTER TABLE "blog_members" DROP COLUMN "visibility",
ADD COLUMN     "visibility" "BlogMemberVisibility" NOT NULL DEFAULT 'PUBLIC';
