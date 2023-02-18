/*
  Warnings:

  - A unique constraint covering the columns `[time]` on the table `TimeSample` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX `TimeSample_time_key` ON `TimeSample`(`time`);
