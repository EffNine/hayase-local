import { EventEmitter } from 'node:events';
import type { Client } from './client.ts';
export default class Channel extends EventEmitter {
    bus: Client;
    sourceId: string;
    destinationId: string;
    namespace: string;
    encoding: string | undefined;
    constructor(bus: Client, sourceId: string, destinationId: string, namespace: string, encoding?: string);
    send(data: any): void;
    close(): void;
}
