/*
  Warnings:

  - You are about to drop the column `telegramMediaId` on the `media` table. All the data in the column will be lost.
  - Added the required column `telegram_media_id` to the `media` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "alt" TEXT,
    "telegram_media_id" TEXT NOT NULL,
    "telegramMediaType" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_media" ("alt", "createdAt", "id", "telegramMediaType", "updatedAt") SELECT "alt", "createdAt", "id", "telegramMediaType", "updatedAt" FROM "media";
DROP TABLE "media";
ALTER TABLE "new_media" RENAME TO "media";
CREATE UNIQUE INDEX "media_telegram_media_id_key" ON "media"("telegram_media_id");
CREATE INDEX "media_telegram_media_id_idx" ON "media"("telegram_media_id");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
