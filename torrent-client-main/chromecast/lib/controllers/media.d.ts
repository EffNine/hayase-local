import { RequestResponseController, type AnyRequestMessage } from './request-response.ts';
import type { Sender } from '../senders/sender';
import type { MediaStatusMessage } from 'castv2';
import type { LoadRequestData } from 'chromecast-caf-receiver/cast.framework.messages';
export declare class MediaController extends RequestResponseController {
    currentSession?: MediaStatusMessage['status'][0];
    constructor(sender: Sender);
    getStatus(): Promise<any>;
    load(media: LoadRequestData['media']): Promise<any>;
    sessionRequest(data: AnyRequestMessage): Promise<any>;
    play(): Promise<any>;
    pause(): Promise<any>;
    stop(): Promise<any>;
    seek(currentTime: number): Promise<any>;
}
