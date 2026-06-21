import { EventEmitter } from 'node:events';
import fetch from 'cross-fetch-ponyfill';
import { XMLParser } from 'fast-xml-parser';
import Ssdp from "../chromecast/lib/ssdp.js";
import { buildDidlLiteMetadata } from "./lib/metadata.js";
import { soapRequest } from "./lib/soap.js";
const POLL_INTERVAL_MS = 2_000;
const sleep = (time) => new Promise(resolve => setTimeout(resolve, time).unref());
const normalizeControlURL = (controlURL) => {
    try {
        const url = new URL(controlURL);
        url.hash = '';
        return url.toString().toLowerCase();
    }
    catch {
        return controlURL.trim().toLowerCase();
    }
};
const normalizeUDN = (udn) => udn.trim().toLowerCase().replace(/^uuid:/, '');
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseTagValue: false,
    trimValues: true
});
const toArray = (value) => {
    if (!value)
        return [];
    return Array.isArray(value) ? value : [value];
};
const findAVTransportService = (device) => {
    const serviceList = device.serviceList;
    const services = serviceList && typeof serviceList === 'object'
        ? toArray(serviceList.service)
        : [];
    for (const service of services) {
        const serviceType = typeof service.serviceType === 'string' ? service.serviceType : '';
        if (!serviceType.startsWith('urn:schemas-upnp-org:service:AVTransport:'))
            continue;
        const controlURL = typeof service.controlURL === 'string' ? service.controlURL : '';
        if (!controlURL)
            continue;
        return { controlURL, serviceType };
    }
    const deviceList = device.deviceList;
    const embeddedDevices = deviceList && typeof deviceList === 'object'
        ? toArray(deviceList.device)
        : [];
    for (const embeddedDevice of embeddedDevices) {
        const service = findAVTransportService(embeddedDevice);
        if (service)
            return service;
    }
    return undefined;
};
const parseDescription = async (descriptionURL) => {
    const response = await fetch(descriptionURL);
    if (!response.ok)
        return undefined;
    const parsed = parser.parse(await response.text());
    const root = parsed.root;
    if (!root)
        return undefined;
    const device = root.device;
    if (!device || typeof device !== 'object')
        return undefined;
    const avTransport = findAVTransportService(device);
    if (!avTransport)
        return undefined;
    const friendlyName = typeof device.friendlyName === 'string'
        ? device.friendlyName
        : '';
    const rawUDN = typeof device.UDN === 'string'
        ? device.UDN
        : '';
    const locationURL = new URL(descriptionURL);
    const urlBaseValue = typeof root.URLBase === 'string' ? root.URLBase : descriptionURL;
    const baseURL = new URL(urlBaseValue || descriptionURL, descriptionURL);
    const controlURL = new URL(avTransport.controlURL, baseURL).toString();
    const host = baseURL.hostname || locationURL.hostname;
    const deviceId = rawUDN ? normalizeUDN(rawUDN) : normalizeControlURL(controlURL);
    if (!friendlyName || !host || !controlURL || !deviceId)
        return undefined;
    return {
        friendlyName,
        host,
        controlURL,
        serviceType: avTransport.serviceType,
        deviceId
    };
};
class DLNARenderer {
    friendlyName;
    host;
    controlURL;
    serviceType;
    lastTransportState;
    destroyed = false;
    constructor(opts) {
        this.friendlyName = opts.friendlyName;
        this.host = opts.host;
        this.controlURL = opts.controlURL;
        this.serviceType = opts.serviceType;
    }
    update(opts) {
        this.friendlyName = opts.friendlyName;
        this.host = opts.host;
        this.controlURL = opts.controlURL;
        this.serviceType = opts.serviceType;
    }
    reset() {
        this.lastTransportState = undefined;
    }
    async play(media) {
        const contentId = typeof media.contentId === 'string' ? media.contentId : '';
        if (!contentId)
            throw new Error('Invalid media contentId for DLNA playback');
        await soapRequest(this.controlURL, this.serviceType, 'SetAVTransportURI', {
            InstanceID: 0,
            CurrentURI: contentId,
            CurrentURIMetaData: buildDidlLiteMetadata(media)
        });
        await soapRequest(this.controlURL, this.serviceType, 'Play', {
            InstanceID: 0,
            Speed: 1
        });
    }
    async stop() {
        await soapRequest(this.controlURL, this.serviceType, 'Stop', {
            InstanceID: 0
        });
    }
    async transportState() {
        const response = await soapRequest(this.controlURL, this.serviceType, 'GetTransportInfo', {
            InstanceID: 0
        });
        const state = typeof response.CurrentTransportState === 'string'
            ? response.CurrentTransportState
            : undefined;
        if (!state)
            throw new Error('DLNA transport state is unavailable');
        this.lastTransportState = state;
        return state;
    }
    async waitForCompletion() {
        let failedPolls = 0;
        while (!this.destroyed) {
            try {
                const state = await this.transportState();
                failedPolls = 0;
                if (state === 'STOPPED' || state === 'NO_MEDIA_PRESENT')
                    return;
            }
            catch {
                failedPolls += 1;
                // If the renderer stopped responding, treat it as a closed session.
                if (failedPolls >= 2)
                    return;
            }
            await sleep(POLL_INTERVAL_MS);
        }
    }
    destroy() {
        this.destroyed = true;
        this.reset();
    }
}
export class DLNAs extends EventEmitter {
    players = new Map();
    displays = {};
    deviceToHost = new Map();
    ssdp = new Ssdp({ permanentFallback: true });
    interval = setInterval(() => this.update(), 1 * 60 * 1000);
    constructor() {
        super();
        const unique = new Map();
        this.ssdp.on('device', async ({ device }) => {
            if (!device.url)
                return;
            try {
                const description = await parseDescription(device.url);
                if (!description)
                    return;
                const key = description.deviceId;
                if (unique.has(key))
                    return;
                unique.set(key, description);
                this.add(description);
            }
            catch (error) {
                console.error('DLNA discovery error:', error);
                return undefined;
            }
        });
        this.update();
    }
    listen(cb) {
        const existing = Object.values(this.displays);
        if (existing.length > 0)
            cb(existing);
        this.on('display', displays => cb(displays));
    }
    add(desc) {
        const host = this.deviceToHost.get(desc.deviceId) ?? desc.host;
        this.deviceToHost.set(desc.deviceId, host);
        const resolved = host === desc.host
            ? desc
            : { ...desc, host };
        const existing = this.players.get(host);
        if (existing) {
            existing.update(resolved);
        }
        else {
            this.players.set(host, new DLNARenderer(resolved));
        }
        if (host !== desc.host) {
            const duplicate = this.players.get(desc.host);
            if (duplicate) {
                duplicate.destroy();
                this.players.delete(desc.host);
            }
            const { [desc.host]: _removed, ...remaining } = this.displays;
            this.displays = remaining;
        }
        this.displays[host] = {
            friendlyName: 'DLNA - ' + desc.friendlyName,
            host: 'dlna://' + host
        };
        this.emit('display', Object.values(this.displays));
    }
    async play(host, _hash, _id, media) {
        const player = this.players.get(host);
        if (!player)
            throw new Error('No such player');
        await player.play(media);
        await player.waitForCompletion();
    }
    async close(host) {
        const player = this.players.get(host);
        if (!player)
            throw new Error('No such player');
        try {
            await player.stop();
        }
        catch (error) {
            console.error('DLNA stop error:', error);
        }
        player.reset();
    }
    async update() {
        await this.ssdp.search('urn:schemas-upnp-org:device:MediaRenderer:1');
    }
    async destroy() {
        clearInterval(this.interval);
        for (const player of this.players.values()) {
            player.destroy();
        }
        this.deviceToHost.clear();
        await this.ssdp.destroy();
    }
}
//# sourceMappingURL=index.js.map