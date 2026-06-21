import { ConnectionController } from '../controllers/connection.ts';
import { Sender } from './sender.ts';
import type { ApplicationInfo, Client } from '../castproto/client.ts';
export declare class Application extends Sender {
    session: ApplicationInfo;
    connection: ConnectionController;
    constructor(client: Client, session: ApplicationInfo);
    static APP_ID: string;
}
