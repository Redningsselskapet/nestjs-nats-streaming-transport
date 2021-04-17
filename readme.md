# Nats Streaming Transport Module for NestJS

Build Event Driven Microservices Architecture with Nats Streaming Server and NestJS.

- Log based persistence
- At-Least-Once Delivery model, giving reliable message delivery
- Rate matched on a per subscription basis
- Replay/Restart
- Last Value Semantics

Exposes the node-nats-streaming library through @ctx context object.

## Install

```bash
npm i @nestjs/microservices
npm i @nestjs-plugins/nestjs-nats-streaming-transport
```

## Running nats-streaming-server in docker
```bash
docker run -p 4222:4222 -p 8222:8222 nats-streaming -m 8222 -cid 'my-cluster' -SD
```


## TransportConnectOptions
- **ackTimeout** (number: default: 30000) - Timeout for the server to receive acknowledgement messages from the client in milliseconds.
- **connectTimeout** (number, default: 2000 ) - Timeout for the client to receive request responses from the nats-streaming-server in milliseconds.
- **discoverPrefix** (string, defeult: _STAN.discover) - Subject prefix used to discover nats-streaming-servers (must match server).
- **encoding** (string, default: utf8) - Encoding used by stan to decode strings.
- **maxPingOut** (number, default: 3) - Maximum number of missing pongs from the nats-streaming-server before the connection is lost and closed.
- **maxPubAcksInflight** (number, default: 16384) - Maximum number of messages a publisher may have in flight without acknowledgment.
- **maxReconnectAttempts** (number, default: -1) - Maximum number of reconnect attempts (infinite = -1)
- **name** (string, default:) - Optional client name
- **nc** - (Stan, default: ) - nats client
- **nkey** - (string, default:) - nkeys authentication
- **noRandomize** (boolean: default: false) - If set, the order of user-specified servers is randomized.
- **nonceSigner** (Function, default:) - A function that takes a Buffer and returns a nkey signed signature.
- **pass** (string, default:) - Sets the password for a connection
- **pedantic** (boolean, default false) - Turns on strict subject format checks
- **pingInterval** (number, default: 120000) - Number of milliseconds between client-sent pings
- **reconnect** (boolean, false) - If false server will not attempt reconnecting
- **reconnectTimeWait** (number, default: 2000)- If disconnected, the client will wait the specified number of milliseconds between reconnect attempts.
- **servers** (string[], default:) - Array of connection urls.
- **stanEncoding** () -
- **stanMaxPingOut** () -
- **stanPingInterval** (number, default: 5000) - Client ping interval to the nats-streaming-server in milliseconds.
- **tls** (boolean, default: false) - This property can be a boolean or an Object. If true the client requires a TLS connection. If false a non-tls connection is required. The value can also be an object specifying TLS certificate data. The properties ca, key, cert should contain the certificate file data. ca should be provided for self-signed certificates. key and cert are required for client provided certificates. rejectUnauthorized if true validates server's credentials
- **token** (string, default:) - Sets a authorization token for a connection
- **tokenHandler** (Function, default:) - A function returning a token used for authentication.
- **url** (string, default: nats://localhost:4222) - Connection url
- **useOldRequestStyle** (boolean: false) - If set to true calls to request() and requestOne() will create an inbox subscription per call.
- **user** (string, default:) - Sets the username for a connection
- **userCreds** (string, default: '') - Set with NATS.creds()
- **userJWT** (string, default: '') - The property can be a JWT or a function that returns a JWT.
- **verbose** (boolean, default: false) - Turns on +OK protocol acknowledgements
- **waitOnFirstConnect** (boolean, default: false) - If true the server will fall back to a reconnect mode if it fails its first connection attempt.
- **yieldTime** (number, default:) - If set, processing will yield at least the specified number of milliseconds to IO callbacks before processing inbound messages

## TransportSubscriptionOptions
  - **ackWait** (number, default: 30 * 1000) - Attempt redelivery of the message if an acknowledgement is not received within the configured timeout interval.
  - **deliverAllAvailable** (string, default: false) - Receive all stored values in order
  - **durableName** (string, default: "") - Track the last acknowledged message for that clientID + durable name. Only messages since the last acknowledged message will be delivered to the client.
  - **manualAckMode** (boolean, default: false) - Manual acknowledgement mode on the subscription. Default is to automatically acknowledge messsages.
  - **maxInFligth** (number, default: 0) - Specifies the maximum number of outstanding acknowledgements.
  - **startAt** (Nats.StartPosition, default null) - Subscribe starting at a specific time
  - **startAtSequence** (number, default: 0) - Receive all messages starting at a specific sequence number
  - **startAtTimeDelta** (number: default:0) - Subscribe starting at a specific amount of time in the past (e.g. 30 seconds ago)
  - **startTime** (Date, default: null) - Subscribe starting at a specific time
  - **startWithLastReceived** (boolean, default: false) - Subscribe starting with the most recently published value

Read more about [nats-streaming-server](https://docs.nats.io/nats-streaming-concepts/intro)

Read more about [node-nats-streaming](https://www.npmjs.com/package/node-nats-streaming)

## nestjs-nats-streaming-transport - code examples:


A simple Event interface used in this example
```javascript
  // @app/events;
  
  export interface UserCreatedEvent {
    id: number,
    username: string
}
```
A simple enum to describe pattern used as subjects.
```javascript
// '@app/events

export enum Patterns {
  UserCreated = 'user:created'  
}

```

### Setup event Publisher

```javascript
// app.module.ts
 
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsStreamingTransport } from '@nestjs-plugins/nestjs-nats-streaming-transport'

@Module({
  imports: [
     NatsStreamingTransport.register(
       {
        clientId: 'user-service-publisher',
        clusterId: 'my-cluster',
        connectOptions: {
          url: 'http://127.0.0.1:4222',
        },
      }
     ),
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}

```

### Publish an Event

```javascript
// app.service.ts

import { Injectable } from '@nestjs/common';
import { Publisher } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { UserCreatedEvent, Patterns } from '@app/events'

@Injectable()
export class AppService {

  constructor(private publisher: Publisher) { }

  getHello(): string {
    const event: UserCreatedEvent = { id: Math.floor(Math.random() * Math.floor(1000)), username: 'bernt' }
    this.publisher.emit<string, UserCreatedEvent>(Patterns.UserCreated, event).subscribe(guid => {
      console.log('published message with guid:', guid)
    })
    return `published message: ${JSON.stringify(event)}`
  }
}

```

### Setup Event Listener

```javascript
// main.ts

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Listener } from '@nestjs-plugins/nestjs-nats-streaming-transport'
import { CustomStrategy } from '@nestjs/microservices';
async function bootstrap() {

  const options: CustomStrategy = {
    strategy: new Listener(
      'my-cluster' /* clusterID */,
      'user-service-listener' /* clientID */,
      'user-service-group', /* queueGroupName */
      {
        url: 'http://127.0.0.1:4222'
      } /* TransportConnectOptions */,
      {
        durableName: 'user-queue-group',
        manualAckMode: true,
        deliverAllAvailable: true,
      } /* TransportSubscriptionOptions */ ,
    ),
  };
 
  // hybrid microservice and web application
  const app = await NestFactory.create(AppModule);
  const microService = app.connectMicroservice(options)
  microService.listen(() => app.listen(3000))
}
bootstrap();

```

### Subscribe Handler

```javascript
// app.controller.ts

import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload, Ctx } from '@nestjs/microservices';
import { NatsStreamingContext } from '@nestjs-plugins/nestjs-nats-streaming-transport';
import { Patterns } from '@app/events';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) { }

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern(Patterns.UserCreated)
  public async stationCreatedHandler(@Payload() data: { id: number, name: string }, @Ctx() context: NatsStreamingContext) {
    console.log(`received message: ${JSON.stringify(data)}`)
    context.message.ack()
  }
}

```