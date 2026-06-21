import Metadata from 'matroska-metadata';
import type EventEmitter from 'node:events';
declare const _default: {
    destroyed: boolean;
    filemap: Map<string, File & EventEmitter<any>>;
    metadatamap: Map<File & EventEmitter<any>, Metadata & EventEmitter<any>>;
    server: import("node:http").Server<typeof import("node:http").IncomingMessage, typeof import("node:http").ServerResponse>;
    _metadata(hash: string, id: number): (Metadata & EventEmitter<any>) | undefined;
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
export default _default;
