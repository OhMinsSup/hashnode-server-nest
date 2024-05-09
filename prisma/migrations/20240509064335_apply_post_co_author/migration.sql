-- CreateTable
CREATE TABLE "post_co_authors" (
    "id" TEXT NOT NULL,
    "fk_post_id" TEXT NOT NULL,
    "fk_user_id" TEXT NOT NULL,

    CONSTRAINT "post_co_authors_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "post_co_authors_fk_post_id" ON "post_co_authors"("fk_post_id");

-- CreateIndex
CREATE INDEX "post_co_authors_fk_user_id" ON "post_co_authors"("fk_user_id");

-- AddForeignKey
ALTER TABLE "post_co_authors" ADD CONSTRAINT "post_co_authors_fk_post_id_fkey" FOREIGN KEY ("fk_post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "post_co_authors" ADD CONSTRAINT "post_co_authors_fk_user_id_fkey" FOREIGN KEY ("fk_user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
