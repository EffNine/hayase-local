import { JsonController } from './json.ts';
import type { Sender } from '../senders/sender';
export declare class HeartbeatController extends JsonController {
    pingTimer?: ReturnType<typeof setTimeout>;
    timeout?: ReturnType<typeof setTimeout>;
    client: import("../castproto/client.ts").Client;
    constructor(sender: Sender);
    ping(): void;
    stop(): void;
}
