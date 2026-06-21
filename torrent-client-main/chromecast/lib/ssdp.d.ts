import dgram from 'node:dgram';
import { EventEmitter } from 'node:events';
import os from 'node:os';
declare class Device {
    url: string | undefined;
    permanentFallback: boolean;
    services: string[];
    constructor(opts?: {
        url?: string;
        permanentFallback?: boolean;
    });
}
export default class Ssdp extends EventEmitter<{
    device: [{
        device: Device;
        address: string;
    }];
}> {
    multicast: string;
    port: number;
    sockets: dgram.Socket[];
    _destroyed: boolean;
    _sourcePort: number;
    _bound: boolean;
    _boundCount: number;
    permanentFallback: boolean;
    constructor(opts?: {
        sourcePort?: number;
        permanentFallback?: boolean;
    });
    createSockets(): void;
    search(device: string): Promise<void>;
    createSocket(interf: os.NetworkInterfaceInfo): void;
    _parseResponse(response: string, addr: string): void;
    _parseMimeHeader(headerStr: string): Record<string, string> | undefined;
    _waitForBind(): Promise<void>;
    destroy(): Promise<PromiseSettledResult<void>[]>;
}
export {};
