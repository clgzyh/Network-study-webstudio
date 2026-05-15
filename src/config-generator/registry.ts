import type { Vendor } from '../types';
import type { ConfigGenerator } from './ConfigGenerator';
import { HuaweiGenerator } from './vendors/HuaweiGenerator';
import { H3CGenerator } from './vendors/H3CGenerator';
import { CiscoGenerator } from './vendors/CiscoGenerator';
import { RuijieGenerator } from './vendors/RuijieGenerator';

const registry = new Map<Vendor, ConfigGenerator>();
registry.set('huawei', new HuaweiGenerator());
registry.set('h3c', new H3CGenerator());
registry.set('cisco', new CiscoGenerator());
registry.set('ruijie', new RuijieGenerator());

export function getGenerator(vendor: Vendor): ConfigGenerator {
  return registry.get(vendor) ?? registry.get('huawei')!;
}
