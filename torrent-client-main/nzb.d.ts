import Wire from 'bittorrent-protocol';
import ltDontHave from 'lt_donthave';
import { NNTPFile } from 'nzb-file/src';
import { Pool } from 'nzb-file/src/pool';
import type EventEmitter from 'node:events';
import type Torrent from 'webtorrent/lib/torrent.js';
type TorrentFile = File & EventEmitter & {
    _startPiece: number;
    _endPiece: number;
};
export declare class NZBManager {
    pool: Pool;
    constructor(domain: string, port: number, login: string, password: string, _poolSize: number);
    addedNZBs: Set<string>;
    addNZBPeers(torrent: Torrent, url: string): Promise<void>;
    registeredTorrents: Map<string, NZBWebSeed[]>;
    register(torrent: Torrent): Promise<void>;
    destroy(): Promise<void>;
}
interface NZBWebSeed extends EventEmitter {
    destroyed: boolean;
}
declare class NZBWebSeed extends Wire {
    connId: string;
    _torrent: Torrent;
    _files: Map<TorrentFile, NNTPFile[]>;
    lt_donthave: InstanceType<ReturnType<typeof ltDontHave>>;
    _bitfield: any;
    constructor(torrent: Torrent, id: string);
    _mergeFileList(map: Map<TorrentFile, NNTPFile>): void;
    request(pieceIndex: number, offset: number, length: number): Promise<any>;
    destroy(): this;
}
export {};
