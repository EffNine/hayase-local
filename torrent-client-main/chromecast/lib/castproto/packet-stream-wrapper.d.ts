import { EventEmitter } from 'node:events';
import type { TLSSocket } from 'node:tls';
export default class PacketStreamWrapper extends EventEmitter {
    stream: TLSSocket;
    constructor(stream: TLSSocket);
    send(buf: Uint8Array): void;
}
