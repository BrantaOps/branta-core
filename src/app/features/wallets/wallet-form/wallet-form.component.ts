import { Component } from '@angular/core';
import { AbstractControl, FormArray, FormBuilder, FormGroup, FormsModule, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatCheckboxChange, MatCheckboxModule } from '@angular/material/checkbox';
import { MatDialog } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectChange, MatSelectModule } from '@angular/material/select';
import { MatStepperModule } from '@angular/material/stepper';
import { MatTabsModule } from '@angular/material/tabs';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../../../shared/components/confirmation-dialog/confirmation-dialog.component';
import { Address } from '../../../shared/models/address';
import { Icon, IconOption, iconOptions } from '../../../shared/models/icon';
import { ExtendedPublicKey, PolicyType, Wallet } from '../../../shared/models/wallet.model';
import { ClipboardService } from '../../../shared/services/clipboard.service';
import { WalletService } from '../../../shared/services/wallet.service';
import { XpubValidatorService } from '../../../shared/services/xpub-validator.service';
import { DescriptorFormDialogComponent, DescriptorWallet } from './descriptor-form-dialog/descriptor-form-dialog.component';

interface AddressConfirmed {
    address: string;
    isConfirmed: boolean;
}

@Component({
    selector: 'app-wallet-form',
    standalone: true,
    imports: [
        FormsModule,
        ReactiveFormsModule,
        MatFormFieldModule,
        MatInputModule,
        MatButtonModule,
        RouterModule,
        MatSelectModule,
        MatTabsModule,
        MatStepperModule,
        MatCheckboxModule
    ],
    templateUrl: './wallet-form.component.html',
    styleUrl: './wallet-form.component.scss'
})
export class WalletFormComponent {
    nameFormGroup: FormGroup;
    keysFormGroup: FormGroup;
    addressConfirmationFormGroup: FormGroup;

    isMultiSig: boolean = false;
    existingWallet: Wallet | null = null;
    addresses: Address[] = [];

    clipboardTextSub: any;
    addressConfirmed: AddressConfirmed | null;

    policyTypes = [
        {
            label: 'Single Signature',
            value: PolicyType.SingleSig
        },
        {
            label: 'Multi Signature',
            value: PolicyType.MultiSig
        }
    ];

    Icon = Icon;
    iconOptions = iconOptions;
    selectedIcon: any;

    existingNames: string[] = [];

    constructor(
        private fb: FormBuilder,
        private walletService: WalletService,
        private router: Router,
        private route: ActivatedRoute,
        public dialog: MatDialog,
        public xpubValidatorService: XpubValidatorService,
        public clipboardService: ClipboardService,
    ) {
        this.route.queryParams.subscribe((params) => {
            var walletId: number = params['walletId'];
            this.existingWallet = this.walletService.getById(walletId) ?? null;

            this.walletService.wallets.subscribe((wallets: Wallet[]) => {
                this.existingNames = wallets.map((wallet: Wallet) => wallet.name);
            });

            this.selectedIcon = this.existingWallet ? iconOptions.find(option => option.value == this.existingWallet!.icon) || iconOptions[0] : iconOptions[0];

            this.nameFormGroup = this.fb.group({
                name: this.fb.control(this.existingWallet?.name ?? '', [Validators.required, this.uniqueNameValidator.bind(this)]),
                icon: this.fb.control(this.selectedIcon.value)
            });

            this.keysFormGroup = this.fb.group({
                policyType: this.fb.control(this.existingWallet?.policyType ?? PolicyType.SingleSig),
                m: this.fb.control(this.existingWallet?.m ?? 1),
                n: this.fb.control(this.existingWallet?.n ?? 1, Validators.max(15)),
                keys: this.fb.array((this.existingWallet?.keys || []).map((key) => this.getKeyForm(key)))
            });

            this.addressConfirmationFormGroup = new FormGroup({
                addresses: this.fb.array([])
            });

            if (!this.existingWallet) {
                this.updateKeysForm(1);
            }
        });

        this.keysFormGroup.get('policyType')?.valueChanges.subscribe((value) => {
            if (value == PolicyType.SingleSig) {
                this.isMultiSig = false;
                this.keysFormGroup.get('m')?.setValue(1);
                this.keysFormGroup.get('n')?.setValue(1);
            } else {
                this.isMultiSig = true;
                this.keysFormGroup.get('m')?.setValue(2);
                this.keysFormGroup.get('n')?.setValue(3);
            }
        });

        this.keysFormGroup.get('n')?.valueChanges.subscribe((value) => {
            this.updateKeysForm(value);
        });
    }

    get keysFormArray(): FormArray {
        return this.keysFormGroup.get('keys') as FormArray;
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
        });
    }

    onStepChange(event: any) {
        if (event.selectedIndex === 2) {
            this.loadAddressInfo();
        }
    }

    loadAddressInfo(): void {
        window.electron.getAllAddresses(this.wallet, 0).then((addresses: Address[]) => {
            this.addresses = addresses;
        });

        this.clipboardTextSub = this.clipboardService.clipboardText.subscribe(async (text) => {
            if (this.clipboardService.isBitcoinAddress(text)) {
                var wallet = await window.electron.verifyAddress([this.wallet], text);
                this.addressConfirmed = {
                    address: text,
                    isConfirmed: wallet != null
                };
            } else {
                this.addressConfirmed = null;
            }
        });
    }

    revertConfirmation(): void {
        this.clipboardTextSub.unsubscribe();
    }

    onAddressSelectionChange(event: MatCheckboxChange, address: Address): void {
        address.selected = event.checked;
    }

    submit() {
        if (this.existingWallet) {
            const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
                data: {
                    title: 'Update Wallet',
                    message: 'Are you sure you want to save your changes?',
                    submitText: 'Update'
                }
            });

            dialogRef.afterClosed().subscribe((result) => {
                if (result === true) {
                    this.walletService.updateWallet({ ...this.wallet, id: this.existingWallet!.id });
                }

                this.router.navigate(['wallets']);
            });
        } else {
            this.walletService.addWallet(this.wallet);
            this.router.navigate(['wallets']);
        }

        this.clipboardService.rerunGetClipboardItem();
    }

    onShareFeedback(): void {
        window.electron.openUrl('https://branta.pro/uses');
    }

    onIconSelectionChange(event: MatSelectChange) {
        this.selectedIcon = this.iconOptions.find((option: IconOption) => option.value == event.value);
    }

    onClickFormDescriptor(event: MouseEvent) {
        event.preventDefault();

        const dialogRef = this.dialog.open(DescriptorFormDialogComponent, {
            height: 'auto',
            width: '600px'
        });

        dialogRef.afterClosed().subscribe((result: DescriptorWallet) => {
            let n = result.keys.length ?? 1;

            if (n > 1) {
                this.keysFormGroup.get('policyType')?.setValue(PolicyType.MultiSig);
                this.keysFormGroup.get('m')?.setValue(result.m);
                this.keysFormGroup.get('n')?.setValue(n);
            } else if (n == 1) {
                this.keysFormGroup.get('policyType')?.setValue(PolicyType.SingleSig);
            }

            const keysArray = this.keysFormGroup.get('keys') as FormArray;

            for (let i = 0; i < result.keys.length; i++) {
                keysArray.at(i).get('value')?.setValue(result.keys[i].value);
            }
        });
    }

    private get wallet(): Wallet {
        return {
            ...this.nameFormGroup.getRawValue(),
            ...this.keysFormGroup.getRawValue()
        } as Wallet;
    }

    uniqueNameValidator(control: AbstractControl): ValidationErrors | null {
        const isUnique = !this.existingNames.includes(control.value);
        return isUnique ? null : { nameTaken: true };
    }
}
