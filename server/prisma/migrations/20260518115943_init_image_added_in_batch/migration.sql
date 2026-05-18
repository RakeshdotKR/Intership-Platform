-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_batchId_fkey";

-- DropForeignKey
ALTER TABLE "Enrollment" DROP CONSTRAINT "Enrollment_studentId_fkey";

-- AlterTable
ALTER TABLE "Batch" ADD COLUMN     "QrImage" TEXT NOT NULL DEFAULT 'https://static.vecteezy.com/system/resources/previews/027/052/565/non_2x/computer-futuristic-high-tech-circuit-board-with-microcircuits-and-electronic-chips-with-transistors-and-resistors-ai-generated-free-photo.jpg';

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Enrollment" ADD CONSTRAINT "Enrollment_batchId_fkey" FOREIGN KEY ("batchId") REFERENCES "Batch"("id") ON DELETE CASCADE ON UPDATE CASCADE;
