import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { ConfirmationDialogComponent } from './confirmation-dialog.component';

describe('ConfirmationDialogComponent', () => {
    let fixture: ComponentFixture<ConfirmationDialogComponent>;

    const setup = (data: { title: string; message: string | null; submitText: string; hideCancel?: boolean }) => {
        TestBed.configureTestingModule({
            imports: [ConfirmationDialogComponent],
            providers: [
                { provide: MAT_DIALOG_DATA, useValue: data },
                { provide: MatDialogRef, useValue: {} },
                provideNoopAnimations()
            ]
        });
        fixture = TestBed.createComponent(ConfirmationDialogComponent);
        fixture.detectChanges();
    };

    afterEach(() => TestBed.resetTestingModule());

    it('shows Cancel button by default', () => {
        setup({ title: 'Test', message: 'Test message', submitText: 'OK' });
        const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
        const cancelButton = buttons.find(btn => btn.textContent?.trim() === 'Cancel');
        expect(cancelButton).toBeTruthy();
    });

    it('hides Cancel button when hideCancel is true', () => {
        setup({ title: 'Test', message: 'Test message', submitText: 'OK', hideCancel: true });
        const buttons: HTMLButtonElement[] = Array.from(fixture.nativeElement.querySelectorAll('button'));
        const cancelButton = buttons.find(btn => btn.textContent?.trim() === 'Cancel');
        expect(cancelButton).toBeFalsy();
    });
});
