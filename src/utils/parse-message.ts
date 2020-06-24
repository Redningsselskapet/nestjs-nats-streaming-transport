import { Message } from "node-nats-streaming";

export const parseMessage = (msg: Message): string | Buffer => {
  const data = msg.getData();
  return typeof data === 'string'
    ? JSON.parse(data)
    : JSON.parse(data.toString('utf8'));
}