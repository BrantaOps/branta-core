import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable } from 'rxjs';
import { ConfirmationDialogComponent } from '../components/confirmation-dialog/confirmation-dialog.component';
import { CanComponentDeactivate } from '../interfaces/can-deactivate.interface';

@Injectable({
    providedIn: 'root'
})
export class UnsavedChangesGuard implements CanDeactivate<CanComponentDeactivate> {
    canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
        if (component.hasUnsavedChanges()) {
            return new Observable<boolean>((observer) => {
                const dialogRef = component.dialog.open(ConfirmationDialogComponent, {
                    data: {
                        title: 'Confirm Exit',
                        message: 'You have unsaved changes. Are you sure you want to exit?',
                        submitText: 'Yes'
                    },
                    width: '450px'
                });

                dialogRef.afterClosed().subscribe((result) => {
                    if (result === true) {
                        observer.next(true);
                        observer.complete();
                    } else {
                        observer.next(false);
                        observer.complete();
                    }
                });
            });
        }
        return true;
    }
}
