import { ClientProxy, ReadPacket, WritePacket } from '@nestjs/microservices';
import { TransportConnectOptions } from './interfaces';
import { Logger, Injectable } from '@nestjs/common';
import { Stan } from 'node-nats-streaming';
import { createConnection } from './utils/create-stan-connection';

@Injectable()
export class Publisher extends ClientProxy {
  private logger: Logger;
  private connection: Stan;

  constructor(
    private clusterID: string,
    private clientID: string,
    private connectOptions: TransportConnectOptions,
  ) {
    super();
    this.logger = new Logger(this.constructor.name);
  }

  async connect(): Promise<Stan> {
    if (this.connection) {
      return Promise.resolve(this.connection);
    }
    this.connection = await createConnection(
      this.clusterID,
      this.clientID,
      this.connectOptions,
    );
    this.logger.log('Publisher - Connected to nats...');
  }

  close() {
    this.connection.close();
  }

  protected publish(
    packet: ReadPacket<any>,
    callback: (packet: WritePacket<any>) => void,
  ): Function {
    // const packet = this.assignPacketId(partialPacket);
    return () => {
      this.connection.publish(
        packet.pattern,
        packet as any,
        err => err && callback({ err }),
      );
    };
  }

  protected async dispatchEvent(
    packet: ReadPacket<{ pattern: string; data: any }>,
  ): Promise<any> {
    return new Promise((resolve, reject) => {
      const guid = this.connection.publish(
        packet.pattern,
        JSON.stringify(packet.data),
        err => {
          if (err) {
            reject(err);
          }
          resolve(guid);
        },
      );
    });
  }
}
