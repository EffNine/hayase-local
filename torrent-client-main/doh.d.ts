import dns from 'node:dns';
import { type LookupFunction } from 'node:net';
declare const DNS_TYPES: {
    readonly A: 1;
    readonly AAAA: 28;
    readonly CNAME: 5;
    readonly MX: 15;
    readonly TXT: 16;
    readonly NS: 2;
    readonly PTR: 12;
};
export declare const PROVIDERS: {
    readonly 'doh.cleanbrowsing.org/doh/adult-filter': readonly ["185.228.168.10", "185.228.169.11", "[2a0d:2a00:1::1]", "[2a0d:2a00:2::1]"];
    readonly 'doh.cleanbrowsing.org/doh/family-filter': readonly ["185.228.168.168", "185.228.169.168", "[2a0d:2a00:1::]", "[2a0d:2a00:2::]"];
    readonly 'doh.cleanbrowsing.org/doh/security-filter': readonly ["185.228.168.9", "185.228.169.9", "[2a0d:2a00:1::2]", "[2a0d:2a00:2::2]"];
    readonly 'cloudflare-dns.com/dns-query': readonly ["1.1.1.1", "1.0.0.1", "[2606:4700:4700::1111]", "[2606:4700:4700::1001]"];
    readonly 'one.one.one.one/dns-query': readonly ["1.1.1.1", "1.0.0.1", "[2606:4700:4700::1111]", "[2606:4700:4700::1001]"];
    readonly 'doh.xfinity.com/dns-query': readonly ["75.75.75.75", "75.75.76.76", "[2001:558:feed::1]", "[2001:558:feed::2]"];
    readonly 'doh.cox.net/dns-query': readonly ["68.105.28.11", "68.105.28.12", "[2001:578:3f::30]"];
    readonly 'odvr.nic.cz/doh': readonly ["185.43.135.1", "193.17.47.1", "[2001:148f:fffe::1]", "[2001:148f:ffff::1]"];
    readonly 'doh.dns.sb/dns-query': readonly ["185.222.222.222", "45.11.45.11", "[2a09::]", "[2a11::]"];
    readonly 'dns.google/dns-query': readonly ["8.8.8.8", "8.8.4.4", "[2001:4860:4860::8888]", "[2001:4860:4860::8844]"];
    readonly 'dns64.dns.google/dns-query': readonly ["[2001:4860:4860::64]", "[2001:4860:4860::6464]"];
    readonly 'dns.levonet.sk/dns-query': readonly ["109.236.119.2", "109.236.120.2", "[2a02:6ca3:0:1::2]", "[2a02:6ca3:0:2::2]"];
    readonly 'doh.opendns.com/dns-query': readonly ["208.67.222.222", "208.67.220.220", "[2620:119:35::35]", "[2620:119:53::53]"];
    readonly 'doh.familyshield.opendns.com/dns-query': readonly ["208.67.222.123", "[208.67.220.123]", "[2620:119:35::123]", "[2620:119:53::123]"];
    readonly 'dns11.quad9.net/dns-query': readonly ["9.9.9.11", "149.112.112.11", "[2620:fe::11]", "[2620:fe::fe:11]"];
    readonly 'dns10.quad9.net/dns-query': readonly ["9.9.9.10", "149.112.112.10", "[2620:fe::10]", "[2620:fe::fe:10]"];
    readonly 'dns.quad9.net/dns-query': readonly ["9.9.9.9", "149.112.112.112", "[2620:fe::fe]", "[2620:fe::9]"];
    readonly 'doh.quickline.ch/dns-query': readonly ["212.60.61.246", "212.60.63.246", "[2001:1a88:10:ffff::1]", "[2001:1a88:10:ffff::2]"];
    readonly 'doh-01.spectrum.com/dns-query': readonly ["209.18.47.61", "209.18.47.62", "[2001:1998:0f00:0001::1]", "[2001:1998:0f00:0002::1]"];
    readonly 'doh-02.spectrum.com/dns-query': readonly ["209.18.47.61", "209.18.47.62", "[2001:1998:0f00:0001::1]", "[2001:1998:0f00:0002::1]"];
};
export default class DoHResolver {
    dohServers: readonly ["185.228.168.10", "185.228.169.11", "[2a0d:2a00:1::1]", "[2a0d:2a00:2::1]"] | readonly ["185.228.168.168", "185.228.169.168", "[2a0d:2a00:1::]", "[2a0d:2a00:2::]"] | readonly ["185.228.168.9", "185.228.169.9", "[2a0d:2a00:1::2]", "[2a0d:2a00:2::2]"] | readonly ["1.1.1.1", "1.0.0.1", "[2606:4700:4700::1111]", "[2606:4700:4700::1001]"] | readonly ["75.75.75.75", "75.75.76.76", "[2001:558:feed::1]", "[2001:558:feed::2]"] | readonly ["68.105.28.11", "68.105.28.12", "[2001:578:3f::30]"] | readonly ["185.43.135.1", "193.17.47.1", "[2001:148f:fffe::1]", "[2001:148f:ffff::1]"] | readonly ["185.222.222.222", "45.11.45.11", "[2a09::]", "[2a11::]"] | readonly ["8.8.8.8", "8.8.4.4", "[2001:4860:4860::8888]", "[2001:4860:4860::8844]"] | readonly ["[2001:4860:4860::64]", "[2001:4860:4860::6464]"] | readonly ["109.236.119.2", "109.236.120.2", "[2a02:6ca3:0:1::2]", "[2a02:6ca3:0:2::2]"] | readonly ["208.67.222.222", "208.67.220.220", "[2620:119:35::35]", "[2620:119:53::53]"] | readonly ["208.67.222.123", "[208.67.220.123]", "[2620:119:35::123]", "[2620:119:53::123]"] | readonly ["9.9.9.11", "149.112.112.11", "[2620:fe::11]", "[2620:fe::fe:11]"] | readonly ["9.9.9.10", "149.112.112.10", "[2620:fe::10]", "[2620:fe::fe:10]"] | readonly ["9.9.9.9", "149.112.112.112", "[2620:fe::fe]", "[2620:fe::9]"] | readonly ["212.60.61.246", "212.60.63.246", "[2001:1a88:10:ffff::1]", "[2001:1a88:10:ffff::2]"] | readonly ["209.18.47.61", "209.18.47.62", "[2001:1998:0f00:0001::1]", "[2001:1998:0f00:0002::1]"];
    pathname: string;
    constructor(dohServer?: `https://${keyof typeof PROVIDERS}`);
    _lookup: LookupFunction;
    resolve(name: string, type?: keyof typeof DNS_TYPES): Promise<dns.LookupAddress[]>;
    destroy(): Promise<void>;
}
export {};
