-- AlterTable
ALTER TABLE "devices" ADD COLUMN     "playlist_id" UUID;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE SET NULL ON UPDATE CASCADE;
