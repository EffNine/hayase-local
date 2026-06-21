import { RequestResponseController } from "./request-response.js";
export class MediaController extends RequestResponseController {
    currentSession;
    constructor(sender) {
        super(sender, 'urn:x-cast:com.google.cast.media');
        const onmessage = (data, broadcast) => {
            if (data.type === 'MEDIA_STATUS' && broadcast) {
                const status = data.status[0];
                // Sometimes an empty status array can come through; if so don't emit it
                if (!status)
                    return;
                this.currentSession = status;
            }
        };
        const onclose = () => {
            this.channel.removeListener('message', onmessage);
        };
        this.channel.on('message', onmessage);
        this.channel.once('close', onclose);
    }
    async getStatus() {
        const response = await this.request({ type: 'GET_STATUS' });
        const status = response.status[0];
        this.currentSession = status;
        return status;
    }
    async load(media) {
        const data = { type: 'LOAD' };
        data.autoplay ??= true;
        data.currentTime ??= 0;
        data.activeTrackIds ??= [];
        data.repeatMode ??= 'REPEAT_OFF';
        data.media = media;
        const response = await this.request(data);
        if (response.type === 'LOAD_FAILED')
            throw new Error('Load failed');
        if (response.type === 'LOAD_CANCELLED')
            throw new Error('Load cancelled');
        const status = response.status[0];
        return status;
    }
    async sessionRequest(data) {
        data.mediaSessionId = this.currentSession?.mediaSessionId;
        const response = await this.request(data);
        const status = response.status[0];
        return status;
    }
    play() { return this.sessionRequest({ type: 'PLAY' }); }
    pause() { return this.sessionRequest({ type: 'PAUSE' }); }
    stop() { return this.sessionRequest({ type: 'STOP' }); }
    seek(currentTime) { return this.sessionRequest({ type: 'SEEK', currentTime }); }
}
//# sourceMappingURL=media.js.map