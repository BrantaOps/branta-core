import { Bolt11Details } from "../../src/app/shared/models/lightning";

const bolt11 = require('bolt11');

export function decodeLightningPayment(payment: string): Bolt11Details | null {
    let data = bolt11.decode(payment);

    if (!data) {
        return null;
    }

    return {
        amount: parseInt(data.millisatoshis ?? "0") / 1000,
        expiry: data.tags.find((tag: any) => tag.tagName == "expire_time")?.data as number,
        description: data.tags.find((tag: any) => tag.tagName == "description")?.data as string
    }
}
