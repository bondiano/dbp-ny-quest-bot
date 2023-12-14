/*
  Warnings:

  - You are about to drop the `AdminSession` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the column `media_id` on the `questions` table. All the data in the column will be lost.
  - You are about to drop the column `type` on the `media` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "AdminSession_sid_key";

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "AdminSession";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "_MediaToQuestion" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL,
    CONSTRAINT "_MediaToQuestion_A_fkey" FOREIGN KEY ("A") REFERENCES "media" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "_MediaToQuestion_B_fkey" FOREIGN KEY ("B") REFERENCES "questions" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_questions" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL DEFAULT '',
    "text" TEXT NOT NULL DEFAULT '',
    "answer" TEXT NOT NULL DEFAULT '',
    "status" TEXT NOT NULL DEFAULT 'draft',
    "type" TEXT NOT NULL DEFAULT 'single',
    "updated_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_questions" ("answer", "created_at", "id", "slug", "status", "text", "type", "updated_at") SELECT "answer", "created_at", "id", "slug", "status", "text", "type", "updated_at" FROM "questions";
DROP TABLE "questions";
ALTER TABLE "new_questions" RENAME TO "questions";
CREATE TABLE "new_media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "telegramMediaId" TEXT NOT NULL,
    "telegramMediaType" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_media" ("createdAt", "id", "slug", "telegramMediaId", "telegramMediaType", "updatedAt") SELECT "createdAt", "id", "slug", "telegramMediaId", "telegramMediaType", "updatedAt" FROM "media";
DROP TABLE "media";
ALTER TABLE "new_media" RENAME TO "media";
CREATE UNIQUE INDEX "media_slug_key" ON "media"("slug");
CREATE INDEX "media_telegramMediaId_idx" ON "media"("telegramMediaId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;

-- CreateIndex
CREATE UNIQUE INDEX "_MediaToQuestion_AB_unique" ON "_MediaToQuestion"("A", "B");

-- CreateIndex
CREATE INDEX "_MediaToQuestion_B_index" ON "_MediaToQuestion"("B");
