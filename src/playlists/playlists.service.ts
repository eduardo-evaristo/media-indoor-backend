import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma.service';
import { CreatePlaylistDto } from './dto/create-playlist.dto';

@Injectable()
export class PlaylistsService {
    constructor(private prisma: PrismaService) { }

    async create(userId: string, createPlaylistDto: CreatePlaylistDto) {
        return await this.prisma.playlist.create({
            omit: { isActive: true },
            data: {
                ...createPlaylistDto,
                userId,
            },
        });
    }

    async getAll(userId: string) {
        return await this.prisma.playlist.findMany({
            omit: { isActive: true },
            where: { userId, isActive: true },
        })
    }

    // TODO: Take a look at this later
    // TODO: Type this accordingly later
    async getOne(id: string, userId: string) {
        return this.prisma.playlist.findUnique({
            omit: {
                isActive: true,
            },
            where: { id, userId }, // Ensure user owns the playlist
            include: {
                medias: {
                    include: {
                        media: true,
                    },
                },
            },
        });
    }
}
