-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('LIKE', 'COMMENT', 'ARTICLE', 'WELCOME');

-- CreateEnum
CREATE TYPE "UploadType" AS ENUM ('IMAGE', 'POST_THUMBNAIL', 'SEO');

-- CreateEnum
CREATE TYPE "MediaType" AS ENUM ('IMAGE', 'VIDEO', 'AUDIO');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" VARCHAR(255) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "lastActiveAt" TIMESTAMPTZ(6),
    "lastActiveIpHash" VARCHAR(255),
    "lastSignInAt" TIMESTAMPTZ(6),
    "lastSignInIpHash" VARCHAR(255),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_profiles" (
    "id" TEXT NOT NULL,
    "username" VARCHAR(50) NOT NULL,
    "image" VARCHAR(255),
    "nickname" VARCHAR(50),
    "tagline" VARCHAR(255),
    "location" VARCHAR(255),
    "bio" VARCHAR(255),
    "availableText" VARCHAR(140),
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "user_profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_socials" (
    "id" TEXT NOT NULL,
    "github" VARCHAR(255) NOT NULL DEFAULT '',
    "twitter" VARCHAR(255) NOT NULL DEFAULT '',
    "facebook" VARCHAR(255) NOT NULL DEFAULT '',
    "instagram" VARCHAR(255) NOT NULL DEFAULT '',
    "website" VARCHAR(255) NOT NULL DEFAULT '',
    "fk_user_id" TEXT,

    CONSTRAINT "user_socials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_passwords" (
    "id" TEXT NOT NULL,
    "hash" VARCHAR(255) NOT NULL,
    "salt" VARCHAR(255) NOT NULL,
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "user_passwords_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_authentications" (
    "id" TEXT NOT NULL,
    "lastValidatedAt" TIMESTAMPTZ(6) NOT NULL,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "fk_user_id" TEXT,

    CONSTRAINT "user_authentications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_tags" (
    "id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "fk_tag_id" TEXT NOT NULL,

    CONSTRAINT "user_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_notifications" (
    "id" TEXT NOT NULL,
    "readAt" TIMESTAMPTZ(6),
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "fk_user_id" TEXT NOT NULL,
    "fk_notification_id" TEXT NOT NULL,

    CONSTRAINT "user_notifications_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "posts" (
    "id" TEXT NOT NULL,
    "urlSlug" VARCHAR(255) NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "subTitle" VARCHAR(120),
    "content" TEXT NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "image" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "deletedAt" TIMESTAMPTZ(6),
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_seos" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(70),
    "description" VARCHAR(156),
    "image" VARCHAR(255),
    "fk_post_id" TEXT NOT NULL,

    CONSTRAINT "post_seos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_reads" (
    "id" TEXT NOT NULL,
    "ipHash" VARCHAR(255),
    "fk_post_id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "post_reads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_configs" (
    "id" TEXT NOT NULL,
    "disabledComment" BOOLEAN NOT NULL DEFAULT false,
    "hiddenArticle" BOOLEAN NOT NULL DEFAULT false,
    "hasTableOfContents" BOOLEAN NOT NULL DEFAULT false,
    "isDraft" BOOLEAN NOT NULL DEFAULT true,
    "isMarkdown" BOOLEAN NOT NULL DEFAULT false,
    "publishedAt" TIMESTAMPTZ(6),
    "fk_post_id" TEXT NOT NULL,

    CONSTRAINT "post_configs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_tags" (
    "id" TEXT NOT NULL,
    "fk_post_id" TEXT NOT NULL,
    "fk_tag_id" TEXT NOT NULL,

    CONSTRAINT "post_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_stats" (
    "id" TEXT NOT NULL,
    "likes" INTEGER NOT NULL DEFAULT 0,
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "comments" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fk_post_id" TEXT NOT NULL,

    CONSTRAINT "post_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "post_histories" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "meta" JSONB,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "fk_post_id" TEXT NOT NULL,

    CONSTRAINT "post_histories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "files" (
    "id" TEXT NOT NULL,
    "cfId" VARCHAR(50) NOT NULL,
    "publicUrl" VARCHAR(255) NOT NULL,
    "filename" VARCHAR(255) NOT NULL,
    "mimeType" VARCHAR(50) NOT NULL,
    "uploadType" "UploadType" NOT NULL DEFAULT 'IMAGE',
    "mediaType" "MediaType" NOT NULL DEFAULT 'IMAGE',
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "files_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tags" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(255) NOT NULL,
    "description" VARCHAR(255),
    "image" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tag_stats" (
    "id" TEXT NOT NULL,
    "follow" INTEGER NOT NULL DEFAULT 0,
    "inUse" INTEGER NOT NULL DEFAULT 0,
    "score" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "fk_tag_id" TEXT NOT NULL,

    CONSTRAINT "tag_stats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notifications" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "title" VARCHAR(255) NOT NULL,
    "body" VARCHAR(255) NOT NULL,
    "meta" JSONB NOT NULL DEFAULT '{}',
    "image" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "notifications_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_username_key" ON "user_profiles"("username");

-- CreateIndex
CREATE UNIQUE INDEX "user_profiles_fk_user_id_key" ON "user_profiles"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_socials_fk_user_id_key" ON "user_socials"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_passwords_fk_user_id_key" ON "user_passwords"("fk_user_id");

-- CreateIndex
CREATE INDEX "user_passwords_fk_user_id" ON "user_passwords"("fk_user_id");

-- CreateIndex
CREATE INDEX "user_tags_fk_user_id" ON "user_tags"("fk_user_id");

-- CreateIndex
CREATE INDEX "user_tags_fk_tag_id" ON "user_tags"("fk_tag_id");

-- CreateIndex
CREATE INDEX "user_notifications_fk_user_id" ON "user_notifications"("fk_user_id");

-- CreateIndex
CREATE INDEX "user_notifications_fk_notification_id" ON "user_notifications"("fk_notification_id");

-- CreateIndex
CREATE INDEX "posts_urlSlug" ON "posts"("urlSlug");

-- CreateIndex
CREATE UNIQUE INDEX "post_seos_fk_post_id_key" ON "post_seos"("fk_post_id");

-- CreateIndex
CREATE INDEX "post_reads_fk_post_id" ON "post_reads"("fk_post_id");

-- CreateIndex
CREATE INDEX "post_reads_ipHash_fk_post_id" ON "post_reads"("ipHash", "fk_post_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_configs_fk_post_id_key" ON "post_configs"("fk_post_id");

-- CreateIndex
CREATE INDEX "post_tags_fk_post_id" ON "post_tags"("fk_post_id");

-- CreateIndex
CREATE INDEX "post_tags_fk_tag_id" ON "post_tags"("fk_tag_id");

-- CreateIndex
CREATE UNIQUE INDEX "post_stats_fk_post_id_key" ON "post_stats"("fk_post_id");

-- CreateIndex
CREATE INDEX "post_stats_score_fk_post_id_idx" ON "post_stats"("score" DESC, "fk_post_id" DESC);

-- CreateIndex
CREATE INDEX "post_stats_likes_fk_post_id_idx" ON "post_stats"("likes" DESC, "fk_post_id" DESC);

-- CreateIndex
CREATE INDEX "post_stats_comments_fk_post_id_idx" ON "post_stats"("comments" DESC, "fk_post_id" DESC);

-- CreateIndex
CREATE INDEX "files_uploadType_mediaType" ON "files"("uploadType", "mediaType");

-- CreateIndex
CREATE UNIQUE INDEX "tags_name_key" ON "tags"("name");

-- CreateIndex
CREATE INDEX "tags_name" ON "tags"("name");

-- CreateIndex
CREATE UNIQUE INDEX "tag_stats_fk_tag_id_key" ON "tag_stats"("fk_tag_id");

-- CreateIndex
CREATE INDEX "tag_stats_score_fk_tag_id_idx" ON "tag_stats"("score" DESC, "fk_tag_id" DESC);

-- CreateIndex
CREATE INDEX "tag_stats_follow_fk_tag_id_idx" ON "tag_stats"("follow" DESC, "fk_tag_id" DESC);

-- CreateIndex
CREATE INDEX "tag_stats_inUse_fk_tag_id_idx" ON "tag_stats"("inUse" DESC, "fk_tag_id" DESC);

-- CreateIndex
CREATE INDEX "notifications_type" ON "notifications"("type");

-- AddForeignKey
ALTER TABLE "user_profiles" ADD CONSTRAINT "user_profiles_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_socials" ADD CONSTRAINT "user_socials_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_passwords" ADD CONSTRAINT "user_passwords_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION;

-- AddForeignKey
ALTER TABLE "user_authentications" ADD CONSTRAINT "user_authentications_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_tags" ADD CONSTRAINT "user_tags_fk_tag_id_fkey" FOREIGN KEY ("fk_tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_notifications" ADD CONSTRAINT "user_notifications_fk_notification_id_fkey" FOREIGN KEY ("fk_notification_id") REFERENCES "notifications"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "posts" ADD CONSTRAINT "posts_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_seos" ADD CONSTRAINT "post_seos_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reads" ADD CONSTRAINT "post_reads_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_reads" ADD CONSTRAINT "post_reads_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_configs" ADD CONSTRAINT "post_configs_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_tags" ADD CONSTRAINT "post_tags_fk_tag_id_fkey" FOREIGN KEY ("fk_tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_stats" ADD CONSTRAINT "post_stats_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_histories" ADD CONSTRAINT "post_histories_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "files" ADD CONSTRAINT "files_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tag_stats" ADD CONSTRAINT "tag_stats_fk_tag_id_fkey" FOREIGN KEY ("fk_tag_id") REFERENCES "tags"("id") ON DELETE CASCADE ON UPDATE CASCADE;
