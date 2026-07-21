-- CreateTable
CREATE TABLE "HocrWord" (
    "id" TEXT NOT NULL,
    "hocrFileId" TEXT NOT NULL,
    "offset" INTEGER NOT NULL,
    "endOffset" INTEGER NOT NULL,
    "word" TEXT NOT NULL,
    "nlpWord" TEXT NOT NULL,
    "x1" INTEGER NOT NULL,
    "y1" INTEGER NOT NULL,
    "x2" INTEGER NOT NULL,
    "y2" INTEGER NOT NULL,
    "orientation" TEXT NOT NULL DEFAULT 'H',
    "lineNo" INTEGER NOT NULL,
    "confidence" INTEGER,

    CONSTRAINT "HocrWord_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "HocrWord_hocrFileId_idx" ON "HocrWord"("hocrFileId");

-- AddForeignKey
ALTER TABLE "HocrWord" ADD CONSTRAINT "HocrWord_hocrFileId_fkey" FOREIGN KEY ("hocrFileId") REFERENCES "HocrFile"("id") ON DELETE CASCADE ON UPDATE CASCADE;
