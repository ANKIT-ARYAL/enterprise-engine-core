CREATE TABLE "ManagedProject" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "repository" TEXT NOT NULL,
    "branch" TEXT NOT NULL DEFAULT 'main',
    "engineVersion" TEXT NOT NULL DEFAULT '0.1.0',
    "lastSyncAt" TIMESTAMP(3),
    "lastSyncStatus" TEXT NOT NULL DEFAULT 'never',
    "lastSyncMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "ManagedProject_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "ManagedProject_repository_key" ON "ManagedProject"("repository");
CREATE INDEX "ManagedProject_lastSyncStatus_idx" ON "ManagedProject"("lastSyncStatus");
