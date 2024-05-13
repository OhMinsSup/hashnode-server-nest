-- AlterTable
ALTER TABLE "user_socials" ADD COLUMN     "linkedin" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "stackoverflow" VARCHAR(255) NOT NULL DEFAULT '',
ADD COLUMN     "youtube" VARCHAR(255) NOT NULL DEFAULT '';

-- CreateTable
CREATE TABLE "user_emails" (
    "id" TEXT NOT NULL,
    "hashnodeWeekly" BOOLEAN NOT NULL DEFAULT false,
    "activityNotifications" BOOLEAN NOT NULL DEFAULT false,
    "generalAnnouncements" BOOLEAN NOT NULL DEFAULT false,
    "monthlyBlogStats" BOOLEAN NOT NULL DEFAULT false,
    "referralNotifications" BOOLEAN NOT NULL DEFAULT false,
    "newFollowersWeekly" BOOLEAN NOT NULL DEFAULT false,
    "fk_user_id" TEXT,

    CONSTRAINT "user_emails_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_emails_fk_user_id_key" ON "user_emails"("fk_user_id");

-- AddForeignKey
ALTER TABLE "user_emails" ADD CONSTRAINT "user_emails_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
