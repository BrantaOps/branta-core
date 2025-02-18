import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ClipboardComponent } from './features/clipboard/clipboard.component';
import { SettingsComponent } from './features/settings/settings.component';
import { VaultsComponent } from './features/vaults/vaults.component';
import { WalletFormComponent } from './features/wallets/wallet-form/wallet-form.component';
import { WalletsComponent } from './features/wallets/wallets.component';
import { UnsavedChangesGuard } from './shared/guards/unsaved-changes.guard';

export const routes: Routes = [
    {
        path: '',
        redirectTo: '/clipboard',
        pathMatch: 'full'
    },
    {
        path: 'clipboard',
        component: ClipboardComponent,
        pathMatch: 'full'
    },
    {
        path: 'wallets',
        component: WalletsComponent
    },
    {
        path: 'wallets/add',
        component: WalletFormComponent,
        canDeactivate: [UnsavedChangesGuard]
    },
    {
        path: 'vaults',
        component: VaultsComponent
    },
    {
        path: 'settings',
        component: SettingsComponent
    }
];

@NgModule({
    imports: [RouterModule.forRoot(routes)],
    exports: [RouterModule]
})
export class AppRoutingModule {}
