import type Torrent from 'webtorrent/lib/torrent.js';
export declare function createNZB(torrent: Torrent, url: string, domain: string, port: number, login: string, password: string, _poolSize: number): Promise<any>;
