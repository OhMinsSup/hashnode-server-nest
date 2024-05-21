-- CreateTable
CREATE TABLE "post_bookmarks" (
    "id" TEXT NOT NULL,
    "fk_post_id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "post_bookmarks_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_bookmarks_fk_post_id" ON "post_bookmarks"("fk_post_id");

-- CreateIndex
CREATE INDEX "post_bookmarks_fk_user_id" ON "post_bookmarks"("fk_user_id");

-- AddForeignKey
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_bookmarks" ADD CONSTRAINT "post_bookmarks_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
