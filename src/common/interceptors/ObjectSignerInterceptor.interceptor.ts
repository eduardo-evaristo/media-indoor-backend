import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { from, map, Observable, switchMap } from 'rxjs';
import StorageService from 'src/storage/storage.service';

@Injectable()
export default class ObjectSignerInterceptor implements NestInterceptor {
  constructor(private readonly storageService: StorageService) { }

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> | Promise<Observable<any>> {
    const handleName = context.getHandler().name;
    console.log(handleName)
    return next.handle().pipe(
      switchMap((data) => {
        // If this comes from getMedia, nothing changes, if it comes from getDevice, it needs to be reattached to the object
        if (handleName === 'findOne') {
          return from(
            this.signAll(data?.playlist?.medias).then((signedMedias) => ({
              ...data,
              playlist: { ...data?.playlist, medias: signedMedias },
            })),
          );
        }

        if (handleName === 'getAll') {
          return from(this.signAll(data, true));
        }

        if (handleName === 'getAvailablePlaylistMedia') {
          return from(this.signAll(data, true))
        }

        return from(this.signAll(data));
      }),
    );
  }

  private async signAll(data: any, mediaOnly?: boolean) {
    // I should make this Promise.all and then reattach them to their final objects
    console.log('This is data', data);

    // Does this belong here?
    if (!data) return

    if (mediaOnly) {
      const signedURLs = await Promise.all(
        data.map((item) => this.storageService.signUrl(item.path)),
      );

      const postData = data.map((item, i) => ({
        ...item,
        path: signedURLs[i],
      }));

      return postData;

    }

    // 1. I need to promisify them all in a Promise.all
    const signedURLs = await Promise.all(
      data.map((item) => this.storageService.signUrl(item.media.path || item.path)),
    );

    //2.  Assign their resolved URLs back to the object
    const postData = data.map((item, i) => ({
      ...item,
      media: { ...item.media, path: signedURLs[i] },
    }));

    return postData;
  }
}
