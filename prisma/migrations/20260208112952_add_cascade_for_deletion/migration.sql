-- DropForeignKey
ALTER TABLE "devices" DROP CONSTRAINT "devices_user_id_fkey";

-- DropForeignKey
ALTER TABLE "media" DROP CONSTRAINT "media_user_id_fkey";

-- DropForeignKey
ALTER TABLE "playlist_media" DROP CONSTRAINT "playlist_media_media_id_fkey";

-- DropForeignKey
ALTER TABLE "playlist_media" DROP CONSTRAINT "playlist_media_playlist_id_fkey";

-- DropForeignKey
ALTER TABLE "playlists" DROP CONSTRAINT "playlists_user_id_fkey";

-- AddForeignKey
ALTER TABLE "playlists" ADD CONSTRAINT "playlists_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "media" ADD CONSTRAINT "media_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_media" ADD CONSTRAINT "playlist_media_playlist_id_fkey" FOREIGN KEY ("playlist_id") REFERENCES "playlists"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "playlist_media" ADD CONSTRAINT "playlist_media_media_id_fkey" FOREIGN KEY ("media_id") REFERENCES "media"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "devices" ADD CONSTRAINT "devices_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
