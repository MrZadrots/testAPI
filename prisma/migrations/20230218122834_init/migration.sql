/*
  Warnings:

  - You are about to drop the column `time_from` on the `Schedule` table. All the data in the column will be lost.
  - Added the required column `time_from_id` to the `Schedule` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Schedule` DROP COLUMN `time_from`,
    ADD COLUMN `time_from_id` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Schedule` ADD CONSTRAINT `Schedule_time_from_id_fkey` FOREIGN KEY (`time_from_id`) REFERENCES `TimeSample`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
