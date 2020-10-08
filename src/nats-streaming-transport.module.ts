import { DynamicModule, Module, Scope } from '@nestjs/common';
import { NATS_STREAMING_OPTIONS } from './constants';
import {
  NatsStreamingPublishAsyncOptions,
  NatsStreamingPublishOptions,
  TransportConnectOptions,
} from './interfaces';
import { Publisher } from './publisher';

@Module({})
export class NatsStreamingTransport {
  static forRoot(
    clusterId: string,
    clientId: string,
    connectOptions: TransportConnectOptions
  ) {
    console.log(
      'WARNING: forRoot is depreciated! Use register or registerAsync instead! This will be removed in next version'
    );
    return this.register({ clusterId, clientId, connectOptions });
  }

  static register(options: NatsStreamingPublishOptions): DynamicModule {
    const providers = [
      {
        provide: NATS_STREAMING_OPTIONS,
        useValue: options,
      },
      Publisher,
    ];

    return {
      providers,
      exports: providers,
      module: NatsStreamingTransport,
    };
  }
  static registerAsync(options: NatsStreamingPublishAsyncOptions): DynamicModule {
    return {
      module: NatsStreamingTransport,
      imports: options.imports,
      providers: [
        {
          provide: NATS_STREAMING_OPTIONS,
          // scope: Scope.TRANSIENT,
          useFactory: options.useFactory,
          inject: options.inject || [],
        },
        Publisher,
      ],
      exports: [Publisher]
    };
  }
}
