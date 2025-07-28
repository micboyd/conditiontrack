import { FormBuilder, FormGroup } from '@angular/forms';
import { IUser } from '../interfaces/IUser';

export class User implements IUser {
    id: string;
    firstname: string;
    lastname: string;
    username: string;
	profileImage: string;
	bio: string;

	constructor() {
        this.id = '';
        this.firstname = '';
        this.lastname = '';
        this.username = '';
        this.profileImage = '';
        this.bio = '';
    }

	createForm(fb: FormBuilder): FormGroup {
		return fb.group({
			firstname: [this.firstname || ''],
			lastname: [this.lastname || ''],
			bio: [this.bio || ''],
		});
	}
}
