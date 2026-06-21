import type { Client } from '../castproto/client.ts';
export declare class Sender {
    client: Client;
    senderId: string;
    receiverId: string;
    constructor(client: Client, senderId: string, receiverId: string);
    close(): Promise<void>;
}
