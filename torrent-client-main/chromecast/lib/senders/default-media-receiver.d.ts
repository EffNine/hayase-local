import { MediaController } from '../controllers/media.ts';
import { Application } from './application.ts';
import type { ApplicationInfo, Client } from '../castproto/client.ts';
export declare class DefaultMediaReceiver extends Application {
    media: MediaController;
    constructor(client: Client, session: ApplicationInfo);
    static APP_ID: string;
}
