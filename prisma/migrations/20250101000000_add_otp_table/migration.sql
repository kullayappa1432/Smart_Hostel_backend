-- CreateTable OTP
CREATE TABLE "otps" (
    "id" BIGSERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "otp_code" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "otps_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "otps_email_idx" ON "otps"("email");

-- CreateIndex
CREATE INDEX "otps_expires_at_idx" ON "otps"("expires_at");
