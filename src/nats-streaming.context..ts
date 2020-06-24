import { BaseRpcContext } from '@nestjs/microservices/ctx-host/base-rpc.context';
import { Message } from 'node-nats-streaming';

type NatsStreamingContextArgs = [Message];

export class NatsStreamingContext extends BaseRpcContext<
  NatsStreamingContextArgs
> {
  constructor(args: NatsStreamingContextArgs) {
    super(args);
  }

  get message() {
    return this.args[0];
  }
}
