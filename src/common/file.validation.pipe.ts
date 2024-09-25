import {
  PipeTransform,
  Injectable,
  ArgumentMetadata,
  BadRequestException,
} from '@nestjs/common';

@Injectable()
export class FileValidationPipe implements PipeTransform {
  transform(files: Array<any>, metadata: ArgumentMetadata): Array<any> {
    const allowedImageTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    const maxSizeInBytes = 1000 * 1000; // 1MB

    const validatedFiles: Array<any> = [];

    files.forEach((file) => {
      if (!allowedImageTypes.includes(file.mimetype)) {
        throw new BadRequestException(
          `Invalid file type. Only JPG/JPEG and PNG are allowed for the file "${file.originalname}".`,
        );
      }

      if (file.size > maxSizeInBytes) {
        throw new BadRequestException(
          `Maximum allowed file size (${maxSizeInBytes / 1024} KB) exceeded for the file "${file.originalname}".`,
        );
      }

      validatedFiles.push(file);
    });

    return validatedFiles;
  }
}
