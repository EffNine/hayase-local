import { JsonController } from "../controllers/json.js";
import { MediaController } from "../controllers/media.js";
import { Application } from "./application.js";
export class UrlCast extends Application {
    url;
    media;
    constructor(client, session) {
        super(client, session);
        this.url = new JsonController(this, 'urn:x-cast:com.url.cast');
        this.media = new MediaController(this);
    }
    static APP_ID = 'F433D22E';
}
//# sourceMappingURL=url-cast.js.map