/*
  Warnings:

  - You are about to drop the column `courseId` on the `Batch` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[name]` on the table `Batch` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `name` to the `Batch` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "Batch" DROP CONSTRAINT "Batch_courseId_fkey";

-- AlterTable
ALTER TABLE "Batch" DROP COLUMN "courseId",
ADD COLUMN     "description" TEXT,
ADD COLUMN     "fee" DOUBLE PRECISION NOT NULL DEFAULT 0,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "_BatchToCourse" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_BatchToCourse_AB_unique" ON "_BatchToCourse"("A", "B");

-- CreateIndex
CREATE INDEX "_BatchToCourse_B_index" ON "_BatchToCourse"("B");

-- CreateIndex
CREATE UNIQUE INDEX "Batch_name_key" ON "Batch"("name");

-- AddForeignKey
ALTER TABLE "_BatchToCourse" ADD CONSTRAINT "_BatchToCourse_A_fkey" FOREIGN KEY ("A") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_BatchToCourse" ADD CONSTRAINT "_BatchToCourse_B_fkey" FOREIGN KEY ("B") REFERENCES "Course"("id") ON DELETE CASCADE ON UPDATE CASCADE;
