import { ClientProxy, ReadPacket, WritePacket } from "@nestjs/microservices";
import { NatsStreamingPublishOptions } from "./interfaces";
import { Logger, Injectable, Inject } from "@nestjs/common";
import { Stan } from "node-nats-streaming";
import { createConnection } from "./utils/create-stan-connection";
import { NATS_STREAMING_OPTIONS } from "./constants";

@Injectable()
export class Publisher extends ClientProxy {
  protected publish(packet: ReadPacket<any>, callback: (packet: WritePacket<any>) => void): () => void {  
    this.connection.publish(
      packet.pattern,
      JSON.stringify(packet.data),
      (err, guid) => {
        if (err) {
          callback({ err });
        } else {
          callback({ response: guid });
        }
      }
    );
    return () => {};
  }

  private logger: Logger;
  private connection: Stan;

  constructor(
    @Inject(NATS_STREAMING_OPTIONS) private options: NatsStreamingPublishOptions
  ) {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  async onApplicationBootstrap() {
    this.connection = await createConnection(
      this.options.clusterId,
      this.options.clientId,
      this.options.connectOptions
    );

    this.logger.log("Publisher - Connected early to nats.");
  }

  async connect(): Promise<Stan> {
    if (this.connection) {
      return Promise.resolve(this.connection);
    }
    this.connection = await createConnection(
      this.options.clusterId,
      this.options.clientId,
      this.options.connectOptions
    );
    this.logger.log("Publisher - Connected to nats.");
  }

  close() {
    this.connection.close();
    this.connection = null;
  }

  protected async dispatchEvent(
    packet: ReadPacket<{ pattern: string; data: any }>
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const guid = this.connection.publish(
        packet.pattern,
        JSON.stringify(packet.data),
        (err) => {
          if (err) {
            reject(err);
          }
          resolve(guid);
        }
      );
    });
  }
}
