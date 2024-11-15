-- CreateTable
CREATE TABLE "Activity" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "timeInZone" INTEGER NOT NULL DEFAULT 0,
    "timeOutZone" INTEGER NOT NULL DEFAULT 0,
    "isInZone" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "attendanceId" INTEGER,
    "locationPinId" INTEGER NOT NULL,

    CONSTRAINT "Activity_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Activity_attendanceId_key" ON "Activity"("attendanceId");

-- CreateIndex
CREATE INDEX "Activity_userId_idx" ON "Activity"("userId");

-- CreateIndex
CREATE INDEX "Activity_createdAt_idx" ON "Activity"("createdAt");

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_attendanceId_fkey" FOREIGN KEY ("attendanceId") REFERENCES "Attendance"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Activity" ADD CONSTRAINT "Activity_locationPinId_fkey" FOREIGN KEY ("locationPinId") REFERENCES "LocationPin"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
