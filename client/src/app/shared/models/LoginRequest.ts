import { ILoginRequest } from "../interfaces/ILoginRequest";

export class LoginRequest implements ILoginRequest {
	username: string;
	password: string;
	rememberMe?: boolean;

	constructor(username: string, password: string, rememberMe?: boolean) {
		this.username = username;
		this.password = password;
		this.rememberMe = rememberMe;
	}
}

