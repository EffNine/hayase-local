import { JsonController } from '../controllers/json.ts';
import { MediaController } from '../controllers/media.ts';
import { Application } from './application.ts';
import type { ApplicationInfo, Client } from '../castproto/client.ts';
export declare class UrlCast extends Application {
    url: JsonController;
    media: MediaController;
    constructor(client: Client, session: ApplicationInfo);
    static APP_ID: string;
}
