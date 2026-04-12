import { BadRequestException, PipeTransform } from '@nestjs/common';
import { ZodSchema, ZodError } from 'zod';

export class ZodValidationPipe<T> implements PipeTransform {
  constructor(private readonly schema: ZodSchema<T>) {}

  transform(value: unknown): T {
    const result = this.schema.safeParse(value);

    if (!result.success) {
      const err = result.error as ZodError;
      throw new BadRequestException({
        message: 'Validation failed',
        errors: err.issues.map((e) => ({
          path: e.path.join('.'),
          message: e.message,
        })),
      });
    }

    return result.data;
  }
}
