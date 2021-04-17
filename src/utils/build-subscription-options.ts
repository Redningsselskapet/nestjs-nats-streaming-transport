import { TransportSubscriptionOptions } from '../interfaces';
import { Stan } from 'node-nats-streaming';

export const buildSubscriptionOptions = (
  transportSubscriptionOptions: TransportSubscriptionOptions,
  connection: Stan,
) => {
  const {
    ackWait,
    startAt,
    deliverAllAvailable,
    durableName,
    manualAckMode,
    maxInFligth,
    startAtSequence,
    startAtTimeDelta,
    startTime,
    startWithLastReceived,
  } = transportSubscriptionOptions;
  const opts = connection.subscriptionOptions();
  ackWait && opts.setAckWait(ackWait);
  startAt && opts.setStartAt(startAt);
  deliverAllAvailable && opts.setDeliverAllAvailable();
  durableName && opts.setDurableName(durableName);
  manualAckMode && opts.setManualAckMode(manualAckMode);
  maxInFligth && opts.setMaxInFlight(maxInFligth);
  startAtSequence && opts.setStartAtSequence(startAtSequence);
  startAtTimeDelta && opts.setStartAtTimeDelta(startAtTimeDelta);
  startTime && opts.setStartTime(startTime);
  startWithLastReceived && opts.setStartWithLastReceived();

  return opts;
};
