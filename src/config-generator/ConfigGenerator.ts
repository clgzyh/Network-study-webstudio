import type { TopologyNode, TopologyEdge, Vendor, VendorTheme, DeviceInterface } from '../types';
import { VENDOR_THEMES } from '../theme/vendorThemes';

export interface GeneratorOptions {
  annotations: boolean;
  deviceScope: 'all' | string[];
  lineNumbers: boolean;
}

export interface ConfigSection {
  title: string;
  lines: string[];
  annotation: string;
  order: number;
}

export abstract class ConfigGenerator {
  abstract vendor: Vendor;

  // Lazily resolve theme via getter because subclass field initializers
  // (e.g. `vendor = 'huawei'`) run AFTER the parent constructor.
  get theme(): VendorTheme {
    return VENDOR_THEMES[this.vendor];
  }

  get c() { return this.theme.cli; }
  get p() { return this.theme.interfacePrefixes; }

  generateFullConfig(
    nodes: TopologyNode[],
    edges: TopologyEdge[],
    options: GeneratorOptions
  ): string {
    const deviceNodes = options.deviceScope === 'all'
      ? nodes
      : nodes.filter((n) => options.deviceScope.includes(n.id));

    const outputs: string[] = [];
    for (const node of deviceNodes) {
      const cfg = this.generateDeviceConfig(node, edges, options);
      if (cfg.trim()) {
        outputs.push(cfg);
      }
    }
    return outputs.join('\n\n');
  }

  generateDeviceConfig(
    node: TopologyNode,
    edges: TopologyEdge[],
    options: GeneratorOptions
  ): string {
    const sections: ConfigSection[] = [];

    sections.push(this.genBasicSettings(node));
    sections.push(this.genInterfaces(node, edges));

    const p = node.data.protocols;
    if (p.vlans?.enabled) sections.push(this.genVLAN(node));
    if (p.stp?.enabled) sections.push(this.genSTP(node));
    if (p.ospf?.enabled) sections.push(this.genOSPF(node));
    if (p.bgp?.enabled) sections.push(this.genBGP(node));
    if (p.rip?.enabled) sections.push(this.genRIP(node));
    if ((p.staticRoutes?.length ?? 0) > 0) sections.push(this.genStaticRoutes(node));
    if (p.dhcp?.enabled) sections.push(this.genDHCP(node));
    if (p.acls?.enabled) sections.push(this.genACL(node));
    if (p.nat?.enabled) sections.push(this.genNAT(node));

    sections.sort((a, b) => a.order - b.order);

    const lines: string[] = [];
    lines.push(`${this.c.commentChar} ${'='.repeat(60)}`);
    lines.push(`${this.c.commentChar} Device: ${node.data.hostname} (${node.data.model})`);
    lines.push(`${this.c.commentChar} Type: ${node.data.deviceType.toUpperCase()}`);
    lines.push(`${this.c.commentChar} ${'='.repeat(60)}`);
    lines.push('');

    let lineNum = 0;
    for (const section of sections) {
      if (section.lines.length === 0) continue;

      if (options.annotations && section.annotation) {
        lines.push('');
        lines.push(`${this.c.commentChar} ${'—'.repeat(50)}`);
        lines.push(`${this.c.commentChar} ${section.title}`);
        lines.push(`${this.c.commentChar} ${'—'.repeat(50)}`);
        for (const aline of section.annotation.split('\n')) {
          lines.push(`${this.c.commentChar} ${aline}`);
        }
      }

      for (const cliLine of section.lines) {
        lineNum++;
        if (options.lineNumbers) {
          lines.push(`${String(lineNum).padStart(3, ' ')}  ${cliLine}`);
        } else {
          lines.push(cliLine);
        }
      }
      lines.push('');
    }

    lines.push(`${this.c.commentChar} === End of ${node.data.hostname} configuration ===`);
    return lines.join('\n');
  }

  abstract genBasicSettings(node: TopologyNode): ConfigSection;
  abstract genInterfaces(node: TopologyNode, edges: TopologyEdge[]): ConfigSection;
  abstract genOSPF(node: TopologyNode): ConfigSection;
  abstract genBGP(node: TopologyNode): ConfigSection;
  abstract genRIP(node: TopologyNode): ConfigSection;
  abstract genStaticRoutes(node: TopologyNode): ConfigSection;
  abstract genVLAN(node: TopologyNode): ConfigSection;
  abstract genACL(node: TopologyNode): ConfigSection;
  abstract genNAT(node: TopologyNode): ConfigSection;
  abstract genDHCP(node: TopologyNode): ConfigSection;
  abstract genSTP(node: TopologyNode): ConfigSection;

  protected getEdgeForIface(node: TopologyNode, iface: DeviceInterface, edges: TopologyEdge[]): TopologyEdge | undefined {
    return edges.find((e) =>
      (e.data?.sourceInterfaceId === iface.id || e.data?.targetInterfaceId === iface.id) &&
      (e.source === node.id || e.target === node.id)
    );
  }
}
