/*
  Warnings:

  - You are about to drop the column `secret_msg` on the `quizzes` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "users" ADD COLUMN "lastAnswerAt" DATETIME;

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_quizzes" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "slug" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'draft',
    "language" TEXT NOT NULL DEFAULT 'ru',
    "secret" TEXT,
    "secretMsg" TEXT,
    "is_secret_solved" BOOLEAN NOT NULL DEFAULT false,
    "updated_at" DATETIME NOT NULL,
    "created_at" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);
INSERT INTO "new_quizzes" ("created_at", "description", "id", "is_secret_solved", "language", "secret", "slug", "status", "title", "updated_at") SELECT "created_at", "description", "id", "is_secret_solved", "language", "secret", "slug", "status", "title", "updated_at" FROM "quizzes";
DROP TABLE "quizzes";
ALTER TABLE "new_quizzes" RENAME TO "quizzes";
CREATE UNIQUE INDEX "quizzes_slug_key" ON "quizzes"("slug");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
