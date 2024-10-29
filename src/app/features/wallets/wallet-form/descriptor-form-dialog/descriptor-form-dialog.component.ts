import { Component, inject } from '@angular/core';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogActions, MatDialogClose, MatDialogContent, MatDialogRef, MatDialogTitle } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { ExtendedPublicKey } from '../../../../shared/models/wallet.model';

export interface DescriptorWallet {
    keys: ExtendedPublicKey[];
    m: number | null;
}

@Component({
    selector: 'app-descriptor-form-dialog',
    standalone: true,
    imports: [MatDialogTitle, MatDialogContent, MatDialogActions, MatDialogClose, FormsModule, ReactiveFormsModule, MatButtonModule, MatFormFieldModule, MatInputModule],
    templateUrl: './descriptor-form-dialog.component.html',
    styleUrl: './descriptor-form-dialog.component.scss'
})
export class DescriptorFormDialogComponent {
    readonly data = inject<any>(MAT_DIALOG_DATA);

    descriptorForm: FormGroup;
    error: string | null = null;

    constructor(private fb: FormBuilder, private dialogRef: MatDialogRef<DescriptorFormDialogComponent>) {
        this.descriptorForm = this.fb.group({
            descriptor: this.fb.control('')
        });
    }

    onSave(event: MouseEvent) {
        this.error = null;
        let descriptor = this.descriptorForm.getRawValue().descriptor;

        let result = this.parseDescriptor(descriptor);

        if (result == null) {
            this.error = 'Error: Unable to parse descriptor.';
            return;
        }

        this.dialogRef.close(result);
    }

    private parseDescriptor(descriptor: string): DescriptorWallet | null {
        let keys = descriptor.match(/([xXyYzZtuUvV]pub[1-9A-HJ-NP-Za-km-z]{79,108})/g);

        if (!keys) {
            return null;
        }

        let mMatch = descriptor.match(/sortedmulti\((\d+),/);
        let m = mMatch ? parseInt(mMatch[1], 10) : null;

        if ((keys.length > 1 && mMatch == null) || (m != null && keys.length < m)) {
            return null;
        }

        return {
            m,
            keys: keys ? keys.map((key: string) => ({
                value: key
            } as ExtendedPublicKey)) : []
        };
    }
}
