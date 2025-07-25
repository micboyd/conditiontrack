import { IMenuItem } from "../interfaces/IMenuItem";

export class MenuItem implements IMenuItem {
    route: string;
    label: string;

    constructor(route: string, label: string) {
        this.route = route;
        this.label = label;
    }
}
