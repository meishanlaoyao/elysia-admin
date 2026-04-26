import { AlipayAppProvider } from './app';
import { AlipayH5Provider } from './h5';
import { AlipayMiniProvider } from './mini';
import { AlipayPcProvider } from './pc';
import type { PaymentPlatform } from '@/types/pay';

export const alipayProviders: Record<PaymentPlatform, InstanceType<any>> = {
    app: new AlipayAppProvider(),
    h5: new AlipayH5Provider(),
    mini: new AlipayMiniProvider(),
    pc: new AlipayPcProvider(),
};