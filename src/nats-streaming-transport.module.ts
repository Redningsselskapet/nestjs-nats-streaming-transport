import { DynamicModule, Module } from "@nestjs/common";
import { TransportConnectOptions } from "./interfaces";
import { Publisher } from "./publisher";

@Module({})
export class NatsStreamingTransport {
  static forRoot(
    clusterID: string,
    clientID: string,
    connectOptions: TransportConnectOptions
  ): DynamicModule {
    const providers = [
      {
        provide: Publisher,
        useValue: new Publisher(clusterID, clientID, connectOptions),
      },
    ];

    return {
      providers,
      exports: providers,
      module: NatsStreamingTransport,
    };
  }
}
