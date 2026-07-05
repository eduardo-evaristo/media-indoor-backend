import { IsUUID } from "class-validator";

export class AttachMediaDto {
    @IsUUID("all", {each: true})
    mediaIds: string[]
}