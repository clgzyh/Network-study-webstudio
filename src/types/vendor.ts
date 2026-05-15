export type Vendor = 'huawei' | 'h3c' | 'cisco' | 'ruijie';

export interface VendorTheme {
  vendor: Vendor;
  label: string;
  brandColor: string;
  interfacePrefixes: {
    ethernet: string;
    serial: string;
    fiber: string;
    management: string;
    vlan: string;
    loopback: string;
  };
  cli: {
    commentChar: string;
    promptEndDelimiter: string;
    systemViewCommand: string;
    enableCommand: string;
    displayCommand: string;
    ospfKeyword: string;
    vlanKeyword: string;
    defaultRouteKeyword: string;
  };
  nodeStyles: {
    router: string;
    switch: string;
    firewall: string;
    ac: string;
    ap: string;
    'access-controller': string;
    'access-point': string;
    pc: string;
    server: string;
    cloud: string;
  };
}
