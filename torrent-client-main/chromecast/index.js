import { EventEmitter, once } from 'node:events';
import fetch from 'cross-fetch-ponyfill';
import { XMLParser } from 'fast-xml-parser';
import multicastdns from 'multicast-dns';
import decode from "./lib/dns-txt.js";
import { PlatformSender } from "./lib/senders/platform.js";
import { UrlCast } from "./lib/senders/url-cast.js";
import Ssdp from "./lib/ssdp.js";
class Cast {
    platform;
    host;
    friendlyName;
    destroyed = false;
    constructor(name, host) {
        this.host = host;
        this.friendlyName = name;
        this.start();
    }
    start() {
        this.platform = new PlatformSender();
        this.platform.client.on('error', async (err) => {
            console.error('Chromecast client error:', err);
            this.restart();
        });
        this.platform.client.on('close', async () => {
            this.restart();
        });
    }
    async restart() {
        if (this.destroyed)
            return;
        if (this._ready) {
            this.platform.stop(await this._ready);
        }
        await this.platform.close();
        this._ready = undefined;
        this.start();
    }
    async destroy() {
        this.destroyed = true;
        if (this._ready) {
            this.platform.stop(await this._ready);
        }
        await this.platform.close();
    }
    _ready;
    connect() {
        this._ready = this._ready ?? this._connect();
        return this._ready;
    }
    async _connect() {
        if (this.destroyed)
            throw new Error('Device destroyed');
        await this.platform.connect({ host: this.host });
        const sess = await this.platform.receiver?.getSessions();
        const session = sess[0];
        return session?.appId === UrlCast.APP_ID ? await this.platform.join(session, UrlCast) : await this.platform.launch(UrlCast);
    }
}
export class ChromeCasts extends EventEmitter {
    players = new Map();
    mdns = multicastdns();
    casts = {};
    ssdp = new Ssdp({ permanentFallback: true });
    // every 1 minute
    interval = setInterval(() => this.update(), 1 * 60 * 1000);
    attachments;
    add(cst) {
        const player = this.players.get(cst.host) ?? new Cast(cst.friendlyName, cst.host);
        this.players.set(cst.host, player);
        this.emit('display', Object.values(this.casts));
    }
    listen(cb) {
        const existing = Object.values(this.casts);
        if (existing.length > 0)
            cb(existing);
        this.on('display', casts => cb(casts));
    }
    async play(host, hash, id, media) {
        const player = this.players.get(host);
        if (!player)
            throw new Error('No such player');
        const conn = await player.connect();
        await conn.media.load(media);
        const tracks = await this.attachments.tracks(hash, id);
        conn.url.channel.send({ type: 'tracks', tracks });
        this.attachments.subtitle(hash, id, (subtitle, trackNumber) => {
            conn.url.channel.send({ type: 'subtitle', subtitle, trackNumber });
        });
        const attachments = await this.attachments.attachments(hash, id);
        conn.url.channel.send({ type: 'attachments', attachments });
        await once(player.platform.client, 'close');
    }
    async close(host) {
        const player = this.players.get(host);
        if (!player)
            throw new Error('No such player');
        player.restart();
    }
    constructor(attachments) {
        super();
        this.attachments = attachments;
        this.mdns.on('response', (response) => {
            // id:name
            const friendlyNames = {};
            // id:domain
            const domains = {};
            // domain:ip
            const addresses = {};
            // @ts-expect-error w/e
            for (const { type, name, data } of [...response.answers, ...response.additionals]) {
                if (type === 'A' || type === 'AAAA')
                    addresses[name] ??= data;
                if (!name.endsWith('._googlecast._tcp.local'))
                    continue;
                const _id = name.replace('._googlecast._tcp.local', '') || data.replace('._googlecast._tcp.local', '');
                const id = _id.substring(_id.lastIndexOf('-') + 1);
                if (type === 'PTR') {
                    friendlyNames[id] ??= id;
                }
                else if (type === 'SRV') {
                    domains[id] ??= data.target;
                }
                else if (type === 'TXT') {
                    for (const item of data) {
                        for (const [key, value] of Object.entries(decode(item))) {
                            if (key === 'fn' || key === 'n') { // friendly name or name
                                friendlyNames[id] = value;
                            }
                        }
                    }
                }
            }
            for (const [id, domain] of Object.entries(domains)) {
                const host = addresses[domain] ?? domain;
                const friendlyName = friendlyNames[id] ?? id;
                this.casts[id] ??= { friendlyName: 'Cast - ' + friendlyName, host: 'cast://' + host };
                this.add({ friendlyName, host });
            }
        });
        this.ssdp.on('device', async ({ device }) => {
            if (!device?.url)
                return;
            const res = await fetch(device.url);
            const service = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '' }).parse(await res.text()).root;
            const friendlyName = service.device?.friendlyName ?? service.device?.friendlyname ?? service.device?.modelName;
            if (!friendlyName)
                return;
            const id = service.device.UDN.replace('uuid:', '').replaceAll('-', '');
            const host = new URL(service.URLBase).hostname;
            this.casts[id] ??= { friendlyName: 'Cast - ' + friendlyName, host: 'cast://' + host };
            this.add({ friendlyName, host });
        });
        this.update();
    }
    async update() {
        this.mdns.query('_googlecast._tcp.local', 'PTR');
        await this.ssdp.search('urn:dial-multiscreen-org:device:dial:1');
    }
    async destroy() {
        clearInterval(this.interval);
        return await Promise.all([
            ...this.players.values().map(player => player.destroy()),
            new Promise(resolve => this.mdns.destroy(resolve)),
            this.ssdp.destroy()
        ]);
    }
}
//# sourceMappingURL=index.js.map