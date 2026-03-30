-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "activation_token" TEXT,
ADD COLUMN     "token_expires_at" TIMESTAMP(6),
ALTER COLUMN "user_id" DROP NOT NULL;
