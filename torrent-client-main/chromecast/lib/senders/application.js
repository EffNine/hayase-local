import { ConnectionController } from "../controllers/connection.js";
import { Sender } from "./sender.js";
export class Application extends Sender {
    session;
    connection;
    constructor(client, session) {
        super(client, 'client-' + Math.floor(Math.random() * 10e5), session.transportId);
        this.session = session;
        this.connection = new ConnectionController(this);
        this.connection.connect();
    }
    static APP_ID = '';
}
//# sourceMappingURL=application.js.map