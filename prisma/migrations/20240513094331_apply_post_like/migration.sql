-- CreateTable
CREATE TABLE "post_likes" (
    "id" TEXT NOT NULL,
    "fk_post_id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "post_likes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_likes_fk_post_id" ON "post_likes"("fk_post_id");

-- CreateIndex
CREATE INDEX "post_likes_fk_user_id" ON "post_likes"("fk_user_id");

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_likes" ADD CONSTRAINT "post_likes_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
