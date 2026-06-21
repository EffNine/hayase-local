import type Channel from '../castproto/channel.ts';
import type { Sender } from '../senders/sender.ts';
export declare class JsonController {
    channel: Channel;
    constructor(sender: Sender, namespace: string);
}
