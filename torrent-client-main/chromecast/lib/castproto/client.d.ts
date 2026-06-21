import EventEmitter from 'node:events';
import tls from 'node:tls';
import Channel from './channel.ts';
import PacketStreamWrapper from './packet-stream-wrapper.ts';
export interface ApplicationInfo {
    appId: string;
    appType: string;
    displayName: string;
    iconUrl: string;
    isIdleScreen: boolean;
    launchedFromCloud: boolean;
    namespaces: ApplicationNamespace[];
    sessionId: string;
    statusText: string;
    transportId: string;
    universalAppId: string;
}
export interface ApplicationNamespace {
    name: string;
}
export declare class Client extends EventEmitter {
    socket: tls.TLSSocket | null;
    ps: PacketStreamWrapper | null;
    connect(options: tls.ConnectionOptions | string, callback?: () => void): void;
    close(): void;
    send(sourceId: string, destinationId: string, namespace: string, data: any): void;
    createChannel(sourceId: string, destinationId: string, namespace: string, encoding?: string): Channel;
}
