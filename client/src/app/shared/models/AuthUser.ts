export class AuthUser {
	firstname: string;
	lastname: string;
	username: string; // used as email address
	password: string;

	constructor() {
		this.firstname = '';
		this.lastname = '';
		this.username = '';
		this.password = '';
	}
}
