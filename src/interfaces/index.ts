import { StanOptions, StartPosition } from 'node-nats-streaming';

export type TransportConnectOptions = StanOptions;

export interface TransportSubscriptionOptions {
  deliverAllAvailable?: boolean;
  durableName?: string;
  manualAckMode?: boolean;
  maxInFligth?: number;
  startAt?: StartPosition;
  startAtSequence?: number;
  startAtTimeDelta?: number;
  startTime?: Date;
  startWithLastReceived?: boolean;
}

