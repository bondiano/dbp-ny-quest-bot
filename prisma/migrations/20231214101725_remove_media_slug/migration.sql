/*
  Warnings:

  - You are about to drop the column `slug` on the `media` table. All the data in the column will be lost.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_media" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "telegramMediaId" TEXT NOT NULL,
    "telegramMediaType" TEXT NOT NULL,
    "updatedAt" DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_media" ("createdAt", "id", "telegramMediaId", "telegramMediaType", "updatedAt") SELECT "createdAt", "id", "telegramMediaId", "telegramMediaType", "updatedAt" FROM "media";
DROP TABLE "media";
ALTER TABLE "new_media" RENAME TO "media";
CREATE INDEX "media_telegramMediaId_idx" ON "media"("telegramMediaId");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
