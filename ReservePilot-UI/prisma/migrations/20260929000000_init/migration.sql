CREATE TABLE "Treasury" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "organizationType" TEXT NOT NULL,
    "reportingCurrency" TEXT NOT NULL DEFAULT 'USD',
    "monthlyExpenses" DOUBLE PRECISION NOT NULL,
    "oneTimeExpenses" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "nextPaymentDate" TIMESTAMP(3),
    "targetReserveMonths" INTEGER NOT NULL,
    "minimumProtectedReservePercent" DOUBLE PRECISION NOT NULL,
    "riskTolerance" TEXT NOT NULL,
    "archived" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Treasury_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Holding" (
    "id" TEXT NOT NULL,
    "treasuryId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "quantity" DOUBLE PRECISION NOT NULL,
    "isStablecoin" BOOLEAN NOT NULL,
    "manuallyClassified" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Holding_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Snapshot" (
    "id" TEXT NOT NULL,
    "treasuryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "dataMode" TEXT NOT NULL,
    "totalTreasuryValue" DOUBLE PRECISION NOT NULL,
    "stableReserve" DOUBLE PRECISION NOT NULL,
    "volatileExposure" DOUBLE PRECISION NOT NULL,
    "volatileExposurePercent" DOUBLE PRECISION NOT NULL,
    "runwayMonths" DOUBLE PRECISION NOT NULL,
    "targetReserve" DOUBLE PRECISION NOT NULL,
    "reserveGap" DOUBLE PRECISION NOT NULL,
    "status" TEXT NOT NULL,
    "analysis" JSONB NOT NULL,
    CONSTRAINT "Snapshot_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "SnapshotQuote" (
    "id" TEXT NOT NULL,
    "snapshotId" TEXT NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT,
    "priceUsd" DOUBLE PRECISION NOT NULL,
    "marketCapUsd" DOUBLE PRECISION,
    "volume24hUsd" DOUBLE PRECISION,
    "percentChange24h" DOUBLE PRECISION,
    "marketRank" INTEGER,
    "lastUpdated" TIMESTAMP(3) NOT NULL,
    "source" TEXT NOT NULL,
    CONSTRAINT "SnapshotQuote_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "Holding_treasuryId_symbol_key" ON "Holding"("treasuryId", "symbol");
CREATE INDEX "Holding_treasuryId_idx" ON "Holding"("treasuryId");
CREATE INDEX "Snapshot_treasuryId_createdAt_idx" ON "Snapshot"("treasuryId", "createdAt");
CREATE INDEX "SnapshotQuote_snapshotId_idx" ON "SnapshotQuote"("snapshotId");
ALTER TABLE "Holding" ADD CONSTRAINT "Holding_treasuryId_fkey" FOREIGN KEY ("treasuryId") REFERENCES "Treasury"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Snapshot" ADD CONSTRAINT "Snapshot_treasuryId_fkey" FOREIGN KEY ("treasuryId") REFERENCES "Treasury"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "SnapshotQuote" ADD CONSTRAINT "SnapshotQuote_snapshotId_fkey" FOREIGN KEY ("snapshotId") REFERENCES "Snapshot"("id") ON DELETE CASCADE ON UPDATE CASCADE;
