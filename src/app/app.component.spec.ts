import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MatDialog } from '@angular/material/dialog';
import { provideNoopAnimations } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { of } from 'rxjs';
import { AppComponent } from './app.component';
import { ConfirmationDialogComponent } from './shared/components/confirmation-dialog/confirmation-dialog.component';
import { SettingsService } from './shared/services/settings.service';
import { Settings, BitcoinUnitType, ClipboardHistoryRolloffType } from './shared/models/settings';

const makeSettings = (disclaimerAccepted: boolean): Settings => ({
    disclaimerAccepted,
    developerMode: false,
    bitcoinUnitType: BitcoinUnitType.Sats,
    clipboardHistory: { show: true, rolloffType: ClipboardHistoryRolloffType.Never },
    generalNotifications: {
        bitcoinAddress: true,
        bitcoinPublicKey: true,
        nostrPublicKey: true,
        nostrPrivateKey: true,
        lightningAddress: true
    }
});

describe('AppComponent disclaimer', () => {
    let dialogSpy: any;
    let settingsServiceSpy: any;
    let dialogRefSpy: any;

    beforeEach(() => {
        (window as any).electron = { platform: () => '' };
        dialogRefSpy = jasmine.createSpyObj('MatDialogRef', ['afterClosed']);
        dialogRefSpy.afterClosed.and.returnValue(of(true));
        dialogSpy = jasmine.createSpyObj('MatDialog', ['open']);
        dialogSpy.open.and.returnValue(dialogRefSpy);
    });

    afterEach(() => TestBed.resetTestingModule());

    const createComponent = (disclaimerAccepted: boolean): ComponentFixture<AppComponent> => {
        const settings = makeSettings(disclaimerAccepted);
        settingsServiceSpy = jasmine.createSpyObj('SettingsService', ['save']);
        settingsServiceSpy.settings = jasmine.createSpy('settings').and.returnValue(settings);

        TestBed.configureTestingModule({
            imports: [AppComponent],
            providers: [
                { provide: MatDialog, useValue: dialogSpy },
                { provide: SettingsService, useValue: settingsServiceSpy },
                provideRouter([]),
                provideNoopAnimations()
            ]
        });

        TestBed.overrideComponent(AppComponent, {
            set: { template: '', imports: [] }
        });

        const fixture = TestBed.createComponent(AppComponent);
        fixture.detectChanges();
        return fixture;
    };

    it('shows disclaimer dialog when not yet accepted', () => {
        createComponent(false);
        expect(dialogSpy.open).toHaveBeenCalledWith(
            ConfirmationDialogComponent,
            jasmine.objectContaining({ disableClose: true })
        );
    });

    it('saves disclaimerAccepted after acknowledging', () => {
        createComponent(false);
        expect(settingsServiceSpy.save).toHaveBeenCalledWith(
            jasmine.objectContaining({ disclaimerAccepted: true })
        );
    });

    it('does not show dialog when disclaimer already accepted', () => {
        createComponent(true);
        expect(dialogSpy.open).not.toHaveBeenCalled();
    });
});
