import { MatDialog } from '@angular/material/dialog';

export interface CanComponentDeactivate {
    dialog: MatDialog;
    hasUnsavedChanges(): boolean;
}
