import {
  CustomTransportStrategy,
  Server,
  Transport,
} from '@nestjs/microservices';
import { Stan, Message } from 'node-nats-streaming';
import {
  TransportConnectOptions,
  TransportSubscriptionOptions,
} from './interfaces';
import { NatsStreamingContext } from './nats-streaming.context';
import { createConnection } from './utils/create-stan-connection';
import { buildSubscriptionOptions } from './utils/build-subscription-options';
import { parseMessage } from './utils/parse-message';

export class Listener extends Server implements CustomTransportStrategy {
  transportId?: Transport;
  private connection: Stan;

  // TODO - create own logger or set logname to This class.
  constructor(
    private clusterId: string,
    private clientId: string,
    private queueGroup: string,
    private connectOptions: TransportConnectOptions,
    private subscriptionOptions: TransportSubscriptionOptions
  ) {
    super();
  }

  // setup listerners - this method is called by nestjs framwork.
  async listen(callback: () => void) {
    this.logger.log('Setting up event listeners...');
    this.connection = await createConnection(
    this.clusterId,
    this.clientId,
    this.connectOptions
    );
    this.bindEventHandlers();
    callback();
  }

  close() {
    this.connection.close();
  }

  // search controllers for @EventPattern decorated handler functions and bind them to a subscription.
  // reistered i a map as 'subject' => handler function
  private async bindEventHandlers() {
    const registerdPatterns = Array.from(this.messageHandlers.keys());
    if (!registerdPatterns) {
      this.logger.log('No message handlers registered');
    }
    registerdPatterns.forEach((subject) => {
      const options = buildSubscriptionOptions(
        this.subscriptionOptions,
        this.connection
      );
      const subscription = this.connection.subscribe(
        subject,
        this.queueGroup,
        options
      );
      subscription.on('message', async (msg: Message) => {
        const handler = this.getHandlerByPattern(subject);
        const data = parseMessage(msg);
        const context = new NatsStreamingContext([msg]);
        const stream = this.transformToObservable(await handler(data, context))
        this.send(stream, () => null)
      });
      this.logger.log(`Subscribed to ${subject}`);
    });
  }
}
