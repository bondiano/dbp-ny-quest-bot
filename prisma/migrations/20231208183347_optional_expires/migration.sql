-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_AdminSession" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "sid" TEXT NOT NULL,
    "data" TEXT NOT NULL,
    "expiresAt" DATETIME
);
INSERT INTO "new_AdminSession" ("data", "expiresAt", "id", "sid") SELECT "data", "expiresAt", "id", "sid" FROM "AdminSession";
DROP TABLE "AdminSession";
ALTER TABLE "new_AdminSession" RENAME TO "AdminSession";
CREATE UNIQUE INDEX "AdminSession_sid_key" ON "AdminSession"("sid");
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
