import { Client } from "../castproto/client.js";
import { ConnectionController } from "../controllers/connection.js";
import { HeartbeatController } from "../controllers/heartbeat.js";
import { ReceiverController } from "../controllers/receiver.js";
import { Sender } from "./sender.js";
export class PlatformSender extends Sender {
    connection = new ConnectionController(this);
    heartbeat = new HeartbeatController(this);
    receiver = new ReceiverController(this);
    constructor() {
        super(new Client(), 'sender-0', 'receiver-0');
    }
    async connect(options) {
        await new Promise((resolve, reject) => {
            const onerror = (err) => {
                reject(err);
            };
            this.client.on('error', onerror);
            this.client.connect(options, resolve);
        });
        this.connection.connect();
        this.heartbeat.ping();
    }
    async close() {
        try {
            this.connection.close();
        }
        catch (e) { }
        return await super.close();
    }
    async getAppAvailability(appId) {
        const availability = await this.receiver?.getAppAvailability(appId);
        for (const key in availability) {
            availability[key] = (availability[key] === 'APP_AVAILABLE');
        }
        return availability;
    }
    async join(session, App) {
        return new App(this.client, session);
    }
    async launch(App) {
        const sessions = await this.receiver?.launch(App.APP_ID);
        const filtered = (sessions ?? []).filter((session) => session.appId === App.APP_ID);
        const session = filtered.shift();
        return await this.join(session, App);
    }
    async stop(application) {
        const session = application.session;
        await this.receiver?.stop(session.sessionId);
        application.close();
    }
}
//# sourceMappingURL=platform.js.map