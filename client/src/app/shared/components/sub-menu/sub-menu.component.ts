import { Component, Input } from "@angular/core";

import { IMenuItem } from "../../interfaces/IMenuItem";

@Component({
    selector: "app-sub-menu",
    templateUrl: "./sub-menu.component.html",
    standalone: false,
})

export class SubMenuComponent {
    @Input() menuItems: IMenuItem[] = [];
}
