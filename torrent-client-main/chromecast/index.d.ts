import { EventEmitter } from 'node:events';
import multicastdns from 'multicast-dns';
import { PlatformSender } from './lib/senders/platform.ts';
import { UrlCast } from './lib/senders/url-cast.ts';
import Ssdp from './lib/ssdp.ts';
import type Attachments from '../attachments.ts';
import type { MediaInformation } from 'chromecast-caf-receiver/cast.framework.messages';
declare class Cast {
    platform: PlatformSender;
    host: string;
    friendlyName: string;
    destroyed: boolean;
    constructor(name: string, host: string);
    start(): void;
    restart(): Promise<void>;
    destroy(): Promise<void>;
    _ready?: Promise<UrlCast>;
    connect(): Promise<UrlCast>;
    _connect(): Promise<UrlCast>;
}
export declare class ChromeCasts extends EventEmitter<{
    display: [Array<{
        friendlyName: string;
        host: string;
    }>];
}> {
    players: Map<string, Cast>;
    mdns: multicastdns.MulticastDNS;
    casts: Record<string, {
        friendlyName: string;
        host: string;
    }>;
    ssdp: Ssdp;
    interval: NodeJS.Timeout;
    attachments: {
        destroyed: boolean;
        filemap: Map<string, File & EventEmitter<any>>;
        metadatamap: Map<File & EventEmitter<any>, import("matroska-metadata").default & EventEmitter<any>>;
        server: import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>;
        _metadata(hash: string, id: number): (import("matroska-metadata").default & EventEmitter<any>) | undefined;
        subtitle(hash: string, id: number, cb: (subtitle: {
            text: string;
            time: number;
            duration: number;
        }, trackNumber: number) => void): void;
        register(files: Array<File & EventEmitter>, hash: string): void;
        attachments(hash: string, id: number): Promise<{
            filename: string;
            mimetype: string;
            id: number;
            url: string;
            lan: string;
        }[]>;
        chapters(hash: string, id: number): Promise<{
            start: number;
            end: any;
            text: any;
            language: any;
        }[]>;
        tracks(hash: string, id: number): Promise<{
            number: string;
            language: string;
            type: string;
            _compressed: boolean;
            default: boolean;
            forced: boolean;
            name?: string;
            header?: string;
        }[]>;
        destroy(): Promise<void>;
    };
    add(cst: {
        friendlyName: string;
        host: string;
    }): void;
    listen(cb: (displays: Array<{
        friendlyName: string;
        host: string;
    }>) => void): void;
    play(host: string, hash: string, id: number, media: MediaInformation): Promise<void>;
    close(host: string): Promise<void>;
    constructor(attachments: typeof Attachments);
    update(): Promise<void>;
    destroy(): Promise<[...void[], void, PromiseSettledResult<void>[]]>;
}
export {};
