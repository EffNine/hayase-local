import { JsonController } from "./json.js";
const DEFAULT_INTERVAL = 5; // seconds
const TIMEOUT_FACTOR = 3; // timeouts after 3 intervals
export class HeartbeatController extends JsonController {
    pingTimer;
    timeout;
    client;
    constructor(sender) {
        super(sender, 'urn:x-cast:com.google.cast.tp.heartbeat');
        this.client = sender.client;
        this.channel.once('close', () => this.stop());
    }
    ping() {
        if (this.timeout) {
            // We already have a ping in progress.
            return;
        }
        this.timeout = setTimeout(() => {
            try {
                this.client.close();
            }
            catch (error) { }
            this.stop();
        }, DEFAULT_INTERVAL * 1000 * TIMEOUT_FACTOR).unref();
        const onmessage = (data, broadcast) => {
            if (data.type !== 'PONG')
                return;
            clearTimeout(this.timeout);
            this.timeout = null;
            this.channel.removeListener('message', onmessage);
            this.pingTimer = setTimeout(() => {
                this.pingTimer = null;
                this.ping();
            }, DEFAULT_INTERVAL * 1000);
        };
        this.channel.on('message', onmessage);
        this.channel.send({ type: 'PING' });
    }
    stop() {
        if (this.pingTimer) {
            clearTimeout(this.pingTimer);
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
        this.channel.removeAllListeners('message');
    }
}
//# sourceMappingURL=heartbeat.js.map