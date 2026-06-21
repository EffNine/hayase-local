type SoapArgs = Record<string, string | number | boolean>;
export declare const escapeXml: (value: string) => string;
export declare const buildSoapEnvelope: (serviceType: string, action: string, args?: SoapArgs) => string;
export declare const soapRequest: (endpoint: string, serviceType: string, action: string, args?: SoapArgs) => Promise<Record<string, unknown>>;
export {};
