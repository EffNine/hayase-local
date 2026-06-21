import WebTorrent from 'webtorrent';
import { ChromeCasts } from './chromecast/index.ts';
import { DLNAs } from './dlna/index.ts';
import DoHResolver from './doh';
import { NZBManager } from './nzb.ts';
import type { PROVIDERS } from './doh';
import type { MediaInformation } from 'chromecast-caf-receiver/cast.framework.messages';
import type { LibraryEntry, PeerInfo, TorrentFile, TorrentInfo, ClientSettings } from 'native';
import type { Server } from 'node:http';
import type Torrent from 'webtorrent/lib/torrent.js';
interface ScrapeResponse {
    hash: string;
    complete: string;
    downloaded: string;
    incomplete: string;
}
interface TorrentData {
    info: unknown;
    'announce-list'?: Uint8Array[][];
    'url-list'?: string[];
    private?: number;
    _bitfield?: Uint8Array;
    announce?: string;
    date: number;
    mediaID: number;
    episode: number;
}
declare const client: unique symbol;
declare const server: unique symbol;
declare const store: unique symbol;
declare const path: unique symbol;
declare const opts: unique symbol;
declare const tmp: unique symbol;
declare const doh: unique symbol;
declare const nzb: unique symbol;
declare class Store {
    cacheFolder: Promise<string>;
    constructor(path: string);
    get(key?: string): Promise<{
        bencoded: TorrentData;
        torrent: any;
    } | null | undefined>;
    set(key: string, value: TorrentData): Promise<void>;
    delete(key: string): Promise<void | null>;
    entries(): AsyncGenerator<{
        bencoded: TorrentData;
        torrent: any;
    }, void, unknown>;
    list(): Promise<string[]>;
}
export default class TorrentClient {
    [client]: WebTorrent;
    [server]: Server;
    [store]: Store;
    [path]: string;
    [opts]: Record<string, unknown>;
    [tmp]: string;
    [doh]?: DoHResolver;
    [nzb]?: NZBManager;
    attachments: {
        destroyed: boolean;
        filemap: Map<string, File & import("node:events")<any>>;
        metadatamap: Map<File & import("node:events")<any>, import("matroska-metadata").default & import("node:events")<any>>;
        server: Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>;
        _metadata(hash: string, id: number): (import("matroska-metadata").default & import("node:events")<any>) | undefined;
        subtitle(hash: string, id: number, cb: (subtitle: {
            text: string;
            time: number;
            duration: number;
        }, trackNumber: number) => void): void;
        register(files: Array<File & import("node:events")>, hash: string): void;
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
    chromecasts: ChromeCasts;
    dlnas: DLNAs;
    streamed: boolean;
    persist: boolean;
    constructor(settings: ClientSettings & {
        path: string;
    }, temp: string);
    updateSettings(settings: ClientSettings & {
        path: string;
    }): void;
    setDOH(dohServer: `https://${keyof typeof PROVIDERS}`): Promise<void>;
    checkIncomingConnections(testPort: number): Promise<boolean>;
    checkAvailableSpace(): Promise<number>;
    scrape(infoHashes: string[]): Promise<ScrapeResponse[]>;
    toInfoHash(torrentId: string | ArrayBufferView): Promise<string | undefined>;
    playTorrent(id: string | ArrayBufferView, mediaID: number, episode: number): Promise<TorrentFile[]>;
    rescanTorrents(hashes: string[]): Promise<void>;
    deleteTorrents(hashes: string[]): Promise<void>;
    cached(): Promise<string[]>;
    library(): Promise<LibraryEntry[]>;
    trackers(id: string): Promise<{
        [k: string]: {
            complete: number;
            downloaded: number;
            incomplete: number;
            failed: boolean;
        };
    }>;
    errors(cb: (errors: Error) => void): void;
    debug(levels: string): void;
    torrents(): TorrentInfo[];
    createNZBWebSeed(id: string, url: string): Promise<void>;
    torrentInfo(id: string): Promise<TorrentInfo>;
    peerInfo(id: string): Promise<PeerInfo[]>;
    verifyDirectoryPermissions(path: string): Promise<void>;
    _wireProgress(wire: Torrent['wires'][number], torrent: Torrent): number;
    fileInfo(id: string): Promise<{
        name: any;
        size: any;
        progress: number;
        selections: number;
    }[]>;
    protocolStatus(id: string): Promise<{
        dht: boolean;
        lsd: boolean;
        pex: boolean;
        nat: boolean;
        forwarding: boolean;
        persisting: boolean;
        streaming: boolean;
    }>;
    makeStats(torrent: Torrent): TorrentInfo;
    listenDisplay(cb: (displays: Array<{
        friendlyName: string;
        host: string;
    }>) => void): void;
    playDisplay(host: string, hash: string, id: number, media: MediaInformation): Promise<void> | undefined;
    closeDisplay(host: string): Promise<void> | undefined;
    destroy(): Promise<void>;
}
export {};
