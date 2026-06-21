import { escapeXml } from "./soap.js";
const toText = (value) => {
    if (typeof value === 'string')
        return value.trim();
    if (typeof value === 'number')
        return String(value);
    return '';
};
const xmlEntry = (tag, value) => `<${tag}>${escapeXml(value)}</${tag}>`;
const OPTIONAL_FIELD_MAP = [
    ['seriesTitle', 'upnp:album'],
    ['subtitle', 'upnp:longDescription'],
    ['episodeTitle', 'dc:description'],
    ['episode', 'upnp:genre'],
    ['episodeNumber', 'upnp:episodeNumber'],
    ['posterUrl', 'upnp:albumArtURI']
];
export const buildDidlLiteMetadata = (media) => {
    const metadata = media.metadata;
    const contentId = media.contentId;
    const contentType = media.contentType || 'video/*';
    const entries = [
        xmlEntry('dc:title', metadata.episodeTitle),
        '<upnp:class>object.item.videoItem</upnp:class>'
    ];
    for (const [field, tag] of OPTIONAL_FIELD_MAP) {
        const value = toText(metadata[field]);
        if (!value)
            continue;
        entries.push(xmlEntry(tag, value));
    }
    if (contentId) {
        entries.push(`<res protocolInfo="http-get:*:${escapeXml(contentType)}:*">${escapeXml(contentId)}</res>`);
    }
    return [
        '<?xml version="1.0" encoding="utf-8"?>',
        '<DIDL-Lite xmlns="urn:schemas-upnp-org:metadata-1-0/DIDL-Lite/" xmlns:dc="http://purl.org/dc/elements/1.1/" xmlns:upnp="urn:schemas-upnp-org:metadata-1-0/upnp/">',
        `<item id="0" parentID="-1" restricted="1">${entries.join('')}</item>`,
        '</DIDL-Lite>'
    ].join('');
};
//# sourceMappingURL=metadata.js.map