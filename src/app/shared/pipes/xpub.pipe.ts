import { Pipe, PipeTransform } from '@angular/core';

const LETTERS = 6;

@Pipe({
    name: 'xpub',
    standalone: true
})
export class XPubPipe implements PipeTransform {
    transform(xpub: string) {
        return xpub.substring(0, 4 + LETTERS) + '...' + xpub.slice(-LETTERS);
    }
}
