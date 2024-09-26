import { Injectable } from '@angular/core';
import { AbstractControl, ValidationErrors } from '@angular/forms';
import { Observable, from } from 'rxjs';
import { map } from 'rxjs/operators';

@Injectable({
    providedIn: 'root'
})
export class XpubValidatorService {
    validate(control: AbstractControl<any, any>): Promise<ValidationErrors | null> | Observable<ValidationErrors | null> {
        return from(window.electron.verifyXpub(control.value)).pipe(map((isValid: boolean) => isValid ? null : { 'xpub': 'Invalid.' }));
    }
}
