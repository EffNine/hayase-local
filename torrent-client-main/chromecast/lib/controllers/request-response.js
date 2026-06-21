/* eslint-disable @typescript-eslint/no-explicit-any */
import { JsonController } from "./json.js";
export class RequestResponseController extends JsonController {
    lastRequestId = 0;
    async request(data) {
        const requestId = ++this.lastRequestId;
        return await new Promise((resolve, reject) => {
            const onmessage = (response, broadcast) => {
                if (response.requestId === requestId) {
                    this.channel.removeListener('message', onmessage);
                    if (response.type === 'INVALID_REQUEST') {
                        return reject(new Error('Invalid request: ' + response.reason));
                    }
                    delete response.requestId;
                    resolve(response);
                }
            };
            this.channel.on('message', onmessage);
            data.requestId = requestId;
            this.channel.send(data);
        });
    }
}
//# sourceMappingURL=request-response.js.map