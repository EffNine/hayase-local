import { EventEmitter } from 'node:events';
import Ssdp from '../chromecast/lib/ssdp.ts';
import type { MediaInformation } from 'chromecast-caf-receiver/cast.framework.messages';
interface DeviceDescription {
    friendlyName: string;
    host: string;
    controlURL: string;
    serviceType: string;
    deviceId: string;
}
declare class DLNARenderer {
    friendlyName: string;
    host: string;
    controlURL: string;
    serviceType: string;
    lastTransportState?: string;
    destroyed: boolean;
    constructor(opts: DeviceDescription);
    update(opts: DeviceDescription): void;
    reset(): void;
    play(media: MediaInformation): Promise<void>;
    stop(): Promise<void>;
    transportState(): Promise<string>;
    waitForCompletion(): Promise<void>;
    destroy(): void;
}
export declare class DLNAs extends EventEmitter<{
    display: [Array<{
        friendlyName: string;
        host: string;
    }>];
}> {
    players: Map<string, DLNARenderer>;
    displays: Record<string, {
        friendlyName: string;
        host: string;
    }>;
    deviceToHost: Map<string, string>;
    ssdp: Ssdp;
    interval: NodeJS.Timeout;
    constructor();
    listen(cb: (displays: Array<{
        friendlyName: string;
        host: string;
    }>) => void): void;
    add(desc: DeviceDescription): void;
    play(host: string, _hash: string, _id: number, media: MediaInformation): Promise<void>;
    close(host: string): Promise<void>;
    update(): Promise<void>;
    destroy(): Promise<void>;
}
export {};
