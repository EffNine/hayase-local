import { type ApplicationInfo } from '../castproto/client.ts';
import { ConnectionController } from '../controllers/connection.ts';
import { HeartbeatController } from '../controllers/heartbeat.ts';
import { ReceiverController } from '../controllers/receiver.ts';
import { Sender } from './sender.ts';
import type { Application } from './application';
import type { ConnectionOptions } from 'node:tls';
export declare class PlatformSender extends Sender {
    connection: ConnectionController;
    heartbeat: HeartbeatController;
    receiver: ReceiverController;
    constructor();
    connect(options: ConnectionOptions | string): Promise<void>;
    close(): Promise<void>;
    getAppAvailability(appId: string | string[]): Promise<any>;
    join<T extends typeof Application>(session: ApplicationInfo, App: T): Promise<InstanceType<T>>;
    launch<T extends typeof Application>(App: T): Promise<InstanceType<T>>;
    stop(application: Application): Promise<void>;
}
