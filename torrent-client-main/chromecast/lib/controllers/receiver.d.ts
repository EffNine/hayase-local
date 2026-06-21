import { RequestResponseController, type AnyResponseMessage } from './request-response.ts';
import type { Sender } from '../senders/sender';
export declare class ReceiverController extends RequestResponseController {
    constructor(sender: Sender);
    getStatus(): Promise<AnyResponseMessage>;
    getAppAvailability(appId: string | string[]): Promise<any>;
    launch(appId: string): Promise<any>;
    stop(sessionId: string): Promise<any>;
    setVolume(options: {
        level: number;
        muted: boolean;
    }): Promise<any>;
    getVolume(): Promise<any>;
    getSessions(): Promise<any>;
}
