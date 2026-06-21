import fetch from 'cross-fetch-ponyfill';
import { XMLParser } from 'fast-xml-parser';
const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    parseTagValue: false,
    removeNSPrefix: true,
    trimValues: true
});
const xmlEscapeMap = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&apos;'
};
export const escapeXml = (value) => value.replace(/[&<>"']/g, char => xmlEscapeMap[char] ?? char);
const extractFault = (fault) => {
    const generic = typeof fault.faultstring === 'string' ? fault.faultstring : undefined;
    if (generic)
        return generic;
    const detail = fault.detail;
    if (!detail || typeof detail !== 'object')
        return undefined;
    const upnpError = detail.UPnPError;
    if (!upnpError || typeof upnpError !== 'object')
        return undefined;
    const code = typeof upnpError.errorCode === 'string'
        ? upnpError.errorCode
        : undefined;
    const description = typeof upnpError.errorDescription === 'string'
        ? upnpError.errorDescription
        : undefined;
    if (!code && !description)
        return undefined;
    return [code, description].filter(Boolean).join(': ');
};
const toBody = (raw) => {
    const parsed = parser.parse(raw);
    const envelope = (parsed.Envelope ?? parsed['s:Envelope']);
    const body = (envelope?.Body ?? parsed.Body ?? parsed['s:Body']);
    return body;
};
export const buildSoapEnvelope = (serviceType, action, args = {}) => {
    const payload = Object.entries(args)
        .map(([key, value]) => `<${key}>${escapeXml(String(value))}</${key}>`)
        .join('');
    return '<?xml version="1.0" encoding="utf-8"?>\n' +
        '<s:Envelope xmlns:s="http://schemas.xmlsoap.org/soap/envelope/" ' +
        's:encodingStyle="http://schemas.xmlsoap.org/soap/encoding/">' +
        `<s:Body><u:${action} xmlns:u="${escapeXml(serviceType)}">${payload}</u:${action}></s:Body>` +
        '</s:Envelope>';
};
export const soapRequest = async (endpoint, serviceType, action, args = {}) => {
    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'Content-Type': 'text/xml; charset="utf-8"',
            SOAPACTION: `"${serviceType}#${action}"`
        },
        body: buildSoapEnvelope(serviceType, action, args)
    });
    const text = await response.text();
    const body = toBody(text);
    if (!body) {
        if (!response.ok) {
            throw new Error(`SOAP request failed (${response.status}): ${response.statusText}`);
        }
        return {};
    }
    const fault = body.Fault;
    if (fault && typeof fault === 'object') {
        throw new Error(extractFault(fault) ?? `SOAP action failed: ${action}`);
    }
    const actionResponseKey = `${action}Response`;
    const actionResponse = body[actionResponseKey];
    if (!response.ok && !actionResponse) {
        throw new Error(`SOAP request failed (${response.status}): ${response.statusText}`);
    }
    if (actionResponse && typeof actionResponse === 'object') {
        return actionResponse;
    }
    const fallbackResponse = Object.entries(body)
        .find(([key]) => key.endsWith('Response'));
    if (fallbackResponse?.[1] && typeof fallbackResponse[1] === 'object') {
        return fallbackResponse[1];
    }
    return {};
};
//# sourceMappingURL=soap.js.map