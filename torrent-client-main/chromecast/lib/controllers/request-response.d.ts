import { JsonController } from './json.ts';
export type AnyResponseMessage = {
    requestId?: number;
    type: string;
} & Record<string, any>;
export type AnyRequestMessage = {
    requestId?: number;
    type: string;
} & Record<string, any>;
export declare class RequestResponseController extends JsonController {
    lastRequestId: number;
    request(data: AnyRequestMessage): Promise<AnyResponseMessage>;
}
