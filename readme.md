# Nats Streaming Transport Module for NestJS

Build Event Driven Microservices Architecture with Nats Streaming Server and NestJS.

- Log based persistence
- At-Least-Once Delivery model, giving reliable message delivery
- Rate matched on a per subscription basis
- Replay/Restart
- Last Value Semantics

Exposes the node-nats-streaming library through @ctx context object.


### Install

```bash
--- not published yet.
```

## Usage:

### Setup event Publisher

```javascript
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { NatsStreamingTransport } from '@transport/nats-streaming-transport';

@Module({
  imports: [
    NatsStreamingTransport.forRoot(
      'vessel-manager',
      'test-service-publisher',
      {
        url: 'http://127.0.0.1:4222',
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
import { Injectable } from '@nestjs/common';
import { Publisher } from '@transport/nats-streaming-transport';
import { stringify } from 'querystring';

interface VesselCreatedEvent {id: number, name: string }

const enum Subjects {
  VesselCreated = 'vessel-created'
}

@Injectable()
export class AppService {

  constructor(private publisher: Publisher) {}

  getHello(): string {
   this.publisher.emit<void,VesselCreatedEvent>(Subjects.VesselCreated, {id: 136, name: 'RS Halfdan Grieg'})
    return 'Hello Bernt!';
  }
}

```


### Setup Event Listener
```javascript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { Listener } from '@transport/nats-streaming-transport/listener';
import { MicroserviceOptions } from '@nestjs/microservices';

async function bootstrap() {
  const options = {
    strategy: new Listener(
      'vessel-manager',
      'test-service-listener',
      'test-service-group',
      {
        url: 'http://127.0.0.1:4222',
      },
      {
        durableName: 'test-queue-group',
        manualAckMode: true,
        deliverAllAvailable: true,
      },
    ),
  };

  const microservice = await NestFactory.createMicroservice<
    MicroserviceOptions
  >(AppModule, options);
  await microservice.listen(() => console.log('Microservice is listening'));

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
```

### Subscribe Handler
```javascript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { EventPattern, Payload, Ctx, MessagePattern } from '@nestjs/microservices';
import { NatsStreamingContext } from '@transport/nats-streaming-transport/nats-streaming.context.';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('vessel-created')
  public async execute(@Payload() data: {id: number, name:string}, @Ctx() context: NatsStreamingContext) {
      console.log('emit: ', data)
      context.message.ack()
  }
}
```