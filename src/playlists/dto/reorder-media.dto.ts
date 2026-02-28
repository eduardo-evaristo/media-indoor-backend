import { IsNumber, IsUUID } from 'class-validator';

export class ReorderMediaDTO {
  @IsUUID()
  mediaId: string;

  @IsNumber()
  oldPosition: number;

  @IsNumber()
  newPosition: number;
}
