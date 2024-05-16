-- CreateEnum
CREATE TYPE "BlogType" AS ENUM ('TEAM');

-- CreateEnum
CREATE TYPE "BlogLayoutType" AS ENUM ('MAGAZINE', 'STACKED', 'GRID');

-- CreateEnum
CREATE TYPE "BlogMemberRole" AS ENUM ('OWNER', 'EDITOR');

-- CreateTable
CREATE TABLE "series" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100),
    "urlSlug" VARCHAR(255),
    "description" VARCHAR(255),
    "image" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "fk_user_id" TEXT,

    CONSTRAINT "series_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "series_posts" (
    "id" TEXT NOT NULL,
    "fk_series_id" TEXT NOT NULL,
    "fk_post_id" TEXT NOT NULL,
    "index" INTEGER,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "series_posts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blogs" (
    "id" TEXT NOT NULL,
    "type" "BlogType" NOT NULL DEFAULT 'TEAM',
    "title" VARCHAR(200) NOT NULL,
    "about" VARCHAR(255),
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "blogs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_seos" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(70),
    "description" VARCHAR(156),
    "image" VARCHAR(255),
    "fk_blog_id" TEXT NOT NULL,

    CONSTRAINT "blog_seos_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_members" (
    "id" TEXT NOT NULL,
    "fk_blog_id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,
    "role" "BlogMemberRole" NOT NULL DEFAULT 'EDITOR',
    "visibility" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL,

    CONSTRAINT "blog_members_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_appearances" (
    "id" TEXT NOT NULL,
    "layoutType" "BlogLayoutType" NOT NULL DEFAULT 'MAGAZINE',
    "logo" VARCHAR(255),
    "logoDark" VARCHAR(255),
    "favicon" VARCHAR(255),
    "headerColor" VARCHAR(7),
    "displayReadTime" BOOLEAN NOT NULL DEFAULT false,
    "displayPostViews" BOOLEAN NOT NULL DEFAULT false,
    "subscribeNewsletter" BOOLEAN NOT NULL DEFAULT false,
    "fk_blog_id" TEXT NOT NULL,

    CONSTRAINT "blog_appearances_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "blog_socials" (
    "id" TEXT NOT NULL,
    "github" VARCHAR(255),
    "twitter" VARCHAR(255),
    "instagram" VARCHAR(255),
    "mastodon" VARCHAR(255),
    "website" VARCHAR(255),
    "youtube" VARCHAR(255),
    "linkedin" VARCHAR(255),
    "dailydev" VARCHAR(255),
    "fk_blog_id" TEXT NOT NULL,

    CONSTRAINT "blog_socials_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "series_created_at" ON "series"("createdAt");

-- CreateIndex
CREATE INDEX "series_fk_user_id" ON "series"("fk_user_id");

-- CreateIndex
CREATE INDEX "series_fk_user_id_url_slug" ON "series"("fk_user_id", "urlSlug");

-- CreateIndex
CREATE INDEX "series_updated_at" ON "series"("updatedAt");

-- CreateIndex
CREATE INDEX "series_posts_fk_post_id" ON "series_posts"("fk_post_id");

-- CreateIndex
CREATE INDEX "series_posts_fk_series_id" ON "series_posts"("fk_series_id");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_title_key" ON "blogs"("title");

-- CreateIndex
CREATE UNIQUE INDEX "blogs_fk_user_id_key" ON "blogs"("fk_user_id");

-- CreateIndex
CREATE INDEX "blogs_created_at" ON "blogs"("createdAt");

-- CreateIndex
CREATE INDEX "blogs_fk_user_id" ON "blogs"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_seos_fk_blog_id_key" ON "blog_seos"("fk_blog_id");

-- CreateIndex
CREATE INDEX "blog_members_fk_blog_id" ON "blog_members"("fk_blog_id");

-- CreateIndex
CREATE INDEX "blog_members_fk_user_id" ON "blog_members"("fk_user_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_appearances_fk_blog_id_key" ON "blog_appearances"("fk_blog_id");

-- CreateIndex
CREATE UNIQUE INDEX "blog_socials_fk_blog_id_key" ON "blog_socials"("fk_blog_id");

-- AddForeignKey
ALTER TABLE "series" ADD CONSTRAINT "series_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "series_posts" ADD CONSTRAINT "series_posts_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "series_posts" ADD CONSTRAINT "series_posts_fk_series_id_fkey" FOREIGN KEY ("fk_series_id") REFERENCES "series"("id") ON DELETE CASCADE ON UPDATE RESTRICT;

-- AddForeignKey
ALTER TABLE "blogs" ADD CONSTRAINT "blogs_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_seos" ADD CONSTRAINT "blog_seos_fk_blog_id_fkey" FOREIGN KEY ("fk_blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_members" ADD CONSTRAINT "blog_members_fk_blog_id_fkey" FOREIGN KEY ("fk_blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_members" ADD CONSTRAINT "blog_members_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_appearances" ADD CONSTRAINT "blog_appearances_fk_blog_id_fkey" FOREIGN KEY ("fk_blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "blog_socials" ADD CONSTRAINT "blog_socials_fk_blog_id_fkey" FOREIGN KEY ("fk_blog_id") REFERENCES "blogs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
