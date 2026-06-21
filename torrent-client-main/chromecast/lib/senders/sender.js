import { once } from 'node:events';
export class Sender {
    client;
    senderId;
    receiverId;
    constructor(client, senderId, receiverId) {
        this.client = client;
        this.senderId = senderId;
        this.receiverId = receiverId;
    }
    async close() {
        this.senderId = null;
        this.receiverId = null;
        this.client = null;
        try {
            this.client.close();
            await once(this.client, 'close');
        }
        catch (e) { }
    }
}
//# sourceMappingURL=sender.js.map