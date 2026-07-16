import { Type } from "class-transformer"
import { IsBoolean, IsOptional, IsUUID } from "class-validator"

export class FindAllDevicesQueryDto {
    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    includePlaylist?: boolean

    @IsOptional()
    @Type(() => Boolean)
    @IsBoolean()
    unassigned?: boolean

    @IsOptional()
    @IsUUID()
    playlistId?: string
}