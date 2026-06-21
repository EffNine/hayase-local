import { createServer } from 'node:http';
import Metadata from 'matroska-metadata';
import networkAddress from 'network-address';
export default new class Attachments {
    destroyed = false;
    filemap = new Map();
    metadatamap = new Map();
    server = createServer(async (req, res) => {
        try {
            const { pathname } = new URL(req.url, 'http://localhost');
            const [hashid, number] = pathname.split('/').slice(1);
            if (!hashid || !number)
                throw new Error('Invalid request');
            const file = this.filemap.get(hashid);
            if (!file)
                throw new Error('File not found');
            const metadata = this.metadatamap.get(file);
            if (!metadata)
                throw new Error('Metadata not found');
            const attachment = (await metadata.getAttachments())[Number(number)];
            if (!attachment)
                throw new Error('Attachment not found');
            res.writeHead(200, { 'Content-Type': attachment.mimetype, 'Access-Control-Allow-Origin': '*' });
            res.end(attachment.data);
        }
        catch (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: err.message }));
        }
    }).listen();
    _metadata(hash, id) {
        const file = this.filemap.get(hash + id);
        if (!file)
            return;
        const meta = this.metadatamap.get(file);
        if (meta)
            return meta;
        const metadata = new Metadata(file);
        this.metadatamap.set(file, metadata);
        return metadata;
    }
    subtitle(hash, id, cb) {
        const metadata = this._metadata(hash, id);
        if (!metadata)
            throw new Error('File not found');
        metadata.removeAllListeners('subtitle');
        metadata.on('subtitle', (a, b) => cb(a, b));
    }
    register(files, hash) {
        this.filemap.clear();
        files.forEach((file, id) => {
            if (file.name.endsWith('.mkv') || file.name.endsWith('.webm')) {
                this.filemap.set(hash + id, file);
                file.on('iterator', ({ iterator }, cb) => {
                    if (this.destroyed)
                        return cb(iterator);
                    cb(this._metadata(hash, id)?.parseStream(iterator) ?? iterator);
                });
            }
        });
    }
    async attachments(hash, id) {
        const metadata = this._metadata(hash, id);
        if (!metadata)
            throw new Error('File not found');
        const lan = networkAddress();
        return (await metadata.getAttachments()).map(({ filename, mimetype }, number) => {
            const suffix = ':' + this.server.address().port + '/' + hash + id + '/' + number;
            return { filename, mimetype, id, url: 'http://localhost' + suffix, lan: 'http://' + lan + suffix };
        });
    }
    chapters(hash, id) {
        const metadata = this._metadata(hash, id);
        if (!metadata)
            throw new Error('File not found');
        return metadata.getChapters();
    }
    tracks(hash, id) {
        const metadata = this._metadata(hash, id);
        if (!metadata)
            throw new Error('File not found');
        return metadata.getTracks();
    }
    async destroy() {
        this.destroyed = true;
        await new Promise(resolve => this.server.close(resolve));
    }
}();
//# sourceMappingURL=attachments.js.map