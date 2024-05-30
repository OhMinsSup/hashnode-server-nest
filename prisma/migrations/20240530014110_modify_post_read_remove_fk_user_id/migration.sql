/*
  Warnings:

  - You are about to drop the column `fk_user_id` on the `post_reads` table. All the data in the column will be lost.
  - You are about to drop the `post_co_authors` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "post_co_authors" DROP CONSTRAINT "post_co_authors_fk_post_id_fkey";

-- DropForeignKey
ALTER TABLE "post_co_authors" DROP CONSTRAINT "post_co_authors_fk_user_id_fkey";

-- DropForeignKey
ALTER TABLE "post_reads" DROP CONSTRAINT "post_reads_fk_user_id_fkey";

-- DropIndex
DROP INDEX "post_reads_ipHash_fk_post_id";

-- AlterTable
ALTER TABLE "post_reads" DROP COLUMN "fk_user_id";

-- DropTable
DROP TABLE "post_co_authors";
