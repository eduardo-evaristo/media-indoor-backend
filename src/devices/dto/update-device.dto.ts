import { IsString, IsOptional, IsUUID } from 'class-validator';

export class UpdateDeviceDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsUUID()
  @IsOptional()
  playlistId?: string;
}
