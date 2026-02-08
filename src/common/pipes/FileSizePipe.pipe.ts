import {
  ArgumentMetadata,
  BadRequestException,
  Injectable,
  PipeTransform,
} from '@nestjs/common';

@Injectable()
export class FileSizePipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    const maximumSize = 1000000;

    const isFileLargerThanMaximumSize = value.size > maximumSize;

    if (isFileLargerThanMaximumSize)
      throw new BadRequestException(
        `File too large. Maximum file size is ${maximumSize}`,
      );

    return value;
  }
}
