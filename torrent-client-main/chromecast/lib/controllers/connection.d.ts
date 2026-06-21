import { JsonController } from './json.ts';
import type { Sender } from '../senders/sender';
export declare class ConnectionController extends JsonController {
    constructor(sender: Sender);
    connect(): void;
    close(): void;
}
