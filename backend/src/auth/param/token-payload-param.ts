import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import { Request } from 'express';
import { REQUETS_TOKEN_PAYLOAD_NAME } from '../common/auth.constants';

export const TokenPayloadParam = createParamDecorator(
  (data: unknown, ctx: ExecutionContext) => {
    const context = ctx.switchToHttp();
    const request: Request = context.getRequest();

    return request[REQUETS_TOKEN_PAYLOAD_NAME];
  }
)