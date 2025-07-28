import { ILoginRequest } from "../interfaces/ILoginRequest";

export class LoginRequest implements ILoginRequest {
	username: string;
	password: string;

	constructor(username: string, password: string) {
		this.username = username;
		this.password = password;
	}
}

