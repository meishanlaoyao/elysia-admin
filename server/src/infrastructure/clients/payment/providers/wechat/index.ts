import { WechatAppProvider } from './app';
import { WechatH5Provider } from './h5';
import { WechatMiniProvider } from './mini';
import { WechatPcProvider } from './pc';
import type { PaymentPlatform } from '@/types/pay';

export const wechatProviders: Record<PaymentPlatform, InstanceType<any>> = {
    app: new WechatAppProvider(),
    h5: new WechatH5Provider(),
    mini: new WechatMiniProvider(),
    pc: new WechatPcProvider(),
};