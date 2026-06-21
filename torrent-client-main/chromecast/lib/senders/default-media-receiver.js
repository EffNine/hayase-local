import { MediaController } from "../controllers/media.js";
import { Application } from "./application.js";
export class DefaultMediaReceiver extends Application {
    media;
    constructor(client, session) {
        super(client, session);
        this.media = new MediaController(this);
    }
    static APP_ID = 'CC1AD845';
}
//# sourceMappingURL=default-media-receiver.js.map