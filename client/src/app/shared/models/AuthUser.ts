import { FormBuilder, FormGroup } from '@angular/forms';

import { IAuthUser } from '../interfaces/IAuthUser';

export class AuthUser implements IAuthUser {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
    password: string;

    constructor() {
        this.id = '';
        this.firstname = '';
        this.lastname = '';
        this.username = '';
        this.password = '';
    }

    createForm(fb: FormBuilder): FormGroup {
        return fb.group({
            firstname: [this.firstname || ''],
            lastname: [this.lastname || ''],
            username: [this.username || ''],
            password: [this.password || ''],
        });
    }
}
