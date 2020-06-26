import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';
import { Message } from 'node-nats-streaming';

export type NatsStreamingContextArgs = [Message];

export class NatsStreamingContext extends BaseRpcContext<
  NatsStreamingContextArgs
> {
  constructor(args: NatsStreamingContextArgs) {
    super(args);
  }

  get message(): Message {
    return this.args[0];
  }
}
