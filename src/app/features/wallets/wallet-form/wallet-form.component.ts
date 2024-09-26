import { Component } from '@angular/core';
import { FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { ExtendedPublicKey, PolicyType, Wallet } from '../../../shared/models/wallet.model';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { WalletService } from '../../../shared/services/wallet.service';
import { XpubValidatorService } from '../../../shared/services/xpub-validator.service';

@Component({
    selector: 'app-wallet-form',
    standalone: true,
    imports: [FormsModule, ReactiveFormsModule, MatFormFieldModule, MatInputModule, MatButtonModule, RouterModule, MatSelectModule, MatTabsModule],
    templateUrl: './wallet-form.component.html',
    styleUrl: './wallet-form.component.scss'
})
export class WalletFormComponent {
    formGroup: FormGroup;

    isMultiSig: boolean = false;
    wallet: Wallet | null = null;

    policyTypes = [PolicyType.SingleSig, PolicyType.MultiSig];
    DEFAULT_DERIVATION_PATH = '0/0';
    DERIVATION_PATH_REGEX = /^\d+(\/\d+)*$/;

    constructor(
        private fb: FormBuilder,
        private walletService: WalletService,
        private router: Router,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        public xpubValidatorService: XpubValidatorService
    ) {
        this.route.queryParams.subscribe((params) => {
            var walletId: number = params['walletId'];
            this.wallet = this.walletService.getById(walletId) ?? null;

            this.formGroup = this.fb.group({
                name: this.fb.control(this.wallet?.name ?? '', Validators.required),
                policyType: this.fb.control(this.wallet?.policyType ?? PolicyType.SingleSig),
                m: this.fb.control(this.wallet?.m ?? 1),
                n: this.fb.control(this.wallet?.n ?? 1),
                keys: this.fb.array((this.wallet?.keys || []).map((key) => this.getKeyForm(key)))
            });

            if (!this.wallet) {
                this.updateKeysForm(1);
            }
        });

        this.formGroup.get('policyType')?.valueChanges.subscribe((value) => {
            if (value == PolicyType.SingleSig) {
                this.isMultiSig = false;
                this.formGroup.get('m')?.setValue(1);
                this.formGroup.get('n')?.setValue(1);
            } else {
                this.isMultiSig = true;
                this.formGroup.get('m')?.setValue(2);
                this.formGroup.get('n')?.setValue(3);
            }
        });

        this.formGroup.get('n')?.valueChanges.subscribe((value) => {
            this.updateKeysForm(value);
        });
    }

    get keysFormArray(): FormArray {
        return this.formGroup.get('keys') as FormArray;
    }

    get keysFormArrayGroups(): FormGroup[] {
        return this.keysFormArray.controls as FormGroup[];
    }

    updateKeysForm(count: number) {
        this.keysFormArray.clear();

        for (let i = 0; i < count; i++) {
            this.keysFormArray.push(this.getKeyForm({ value: '', derivationPath: null }));
        }
    }

    getKeyForm(key: ExtendedPublicKey): FormGroup {
        return this.fb.group({
            value: this.fb.control(key.value, [Validators.required, Validators.pattern(ClipboardService.XPUB_REGEX)], [this.xpubValidatorService.validate]),
            derivationPath: this.fb.control(key.derivationPath ?? this.DEFAULT_DERIVATION_PATH, Validators.pattern(this.DERIVATION_PATH_REGEX))
        });
    }

    submit() {
        if (this.wallet) {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                data: {
                    title: 'Update Wallet',
                    message: 'Are you sure you want to save your changes?',
                    submitText: 'Update'
                }
            });

            dialogRef.afterClosed().subscribe((result) => {
                if (result === true) {
                    this.walletService.updateWallet({ ...this.formGroup.getRawValue(), id: this.wallet!.id });
                }

                this.router.navigate(['wallets']);
            });
        } else {
            this.walletService.addWallet(this.formGroup.getRawValue());
            this.router.navigate(['wallets']);
        }
    }
}
