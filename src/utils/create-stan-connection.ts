import * as nats from 'node-nats-streaming';
import { TransportConnectOptions } from '../interfaces';
import { Stan } from 'node-nats-streaming';
import { generate } from 'shortid';

export const createConnection = (
  clusterID: string,
  clientID: string,
  connectOptions: TransportConnectOptions,
): Promise<Stan> => {
  const nc = nats.connect(
    clusterID,
    clientID + '-' + generate(),
    connectOptions,
  );
  return new Promise((resolve, reject) => {
    nc.on('connect', () => resolve(nc));
    nc.on('error', err => reject(err));
  });
};


