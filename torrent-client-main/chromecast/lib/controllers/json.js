export class JsonController {
    channel;
    constructor(sender, namespace) {
        sender.client.once('close', () => {
            try {
                this.channel.close();
            }
            catch (error) { }
        });
        this.channel = sender.client.createChannel(sender.senderId, sender.receiverId, namespace, 'JSON');
    }
}
//# sourceMappingURL=json.js.map