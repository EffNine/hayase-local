const equalSign = Buffer.from('=');
const bytecache = {
    decodeBlock: 0,
    decode: 0
};
export default function decode(buf, offset = 0, len = buf.length) {
    if (!offset)
        offset = 0;
    if (!Number.isFinite(len))
        len = buf.length;
    const data = {};
    const oldOffset = offset;
    while (offset < len) {
        const b = decodeBlock(buf, offset);
        const i = b.indexOf(equalSign);
        offset += bytecache.decodeBlock;
        if (b.length === 0)
            continue; // ignore: most likely a single zero byte
        if (i === -1)
            data[b.toString().toLowerCase()] = true;
        else if (i === 0)
            continue; // ignore: invalid key-length
        else {
            const key = b.subarray(0, i).toString().toLowerCase();
            if (key in data)
                continue; // ignore: overwriting not allowed
            data[key] = b.subarray(i + 1).toString();
        }
    }
    bytecache.decode = offset - oldOffset;
    return data;
}
function decodeBlock(buf, offset) {
    const len = buf[offset];
    const to = offset + 1 + len;
    const b = buf.subarray(offset + 1, to > buf.length ? buf.length : to);
    bytecache.decodeBlock = len + 1;
    return b;
}
//# sourceMappingURL=dns-txt.js.map