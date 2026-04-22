import type { PaymentPlatform } from '../types';
import { PaypalH5Provider } from './h5';
import { PaypalPcProvider } from './pc';

// PayPal 不支持 app / mini 平台
export const paypalProviders: Partial<Record<PaymentPlatform, InstanceType<any>>> = {
    h5: new PaypalH5Provider(),
    pc: new PaypalPcProvider(),
};
