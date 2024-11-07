import { Component, Input, OnInit } from '@angular/core';

@Component({
    selector: 'app-expandable-text',
    standalone: true,
    imports: [],
    templateUrl: './expandable-text.component.html',
    styleUrl: './expandable-text.component.scss'
})
export class ExpandableTextComponent implements OnInit {
    @Input() text: string | null;

    isLarge: boolean = false;
    isExpanded: boolean = true;

    LETTERS = 10;

    ngOnInit(): void {
        if (this.text && this.text.length > 200) {
            this.isLarge = true;
            this.isExpanded = false;
        }
    }

    toggle() {
        if (!this.isLarge) return;

        this.isExpanded = !this.isExpanded;
    }

    getText(): string | null {
        if (!this.text) {
            return null;
        }

        if (!this.isExpanded) {
            return this.text?.substring(0, 4 + this.LETTERS) + '...' + this.text?.slice(-this.LETTERS);
        }

        return this.text;
    }
}
