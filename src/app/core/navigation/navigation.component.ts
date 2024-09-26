import { Component, NgZone } from '@angular/core';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Router, RouterModule } from '@angular/router';
import { debounceTime } from 'rxjs';
import { VaultService } from '../../shared/services/vault.service';

@Component({
    selector: 'app-navigation',
    standalone: true,
    imports: [RouterModule, MatIconModule, MatTooltipModule],
    templateUrl: './navigation.component.html',
    styleUrl: './navigation.component.scss'
})
export class NavigationComponent {
    displayVaults: boolean = false;

    constructor(private vaultService: VaultService, private ngZone: NgZone, private router: Router) {
        this.vaultService.vaults.pipe(debounceTime(200)).subscribe((vaults) => {
            this.ngZone.run(() => {
                let displayVaults = vaults.length > 0;

                if (this.displayVaults == true && displayVaults == false) {
                    this.router.navigate(['clipboard']);
                }

                this.displayVaults = displayVaults;
            });
        });
    }
}
