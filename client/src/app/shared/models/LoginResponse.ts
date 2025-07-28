import { ILoginResponse } from '../interfaces/ILoginResponse';

export class LoginResponse implements ILoginResponse {
	token: string;
	id: string;

	constructor(token: string, userId: string) {
		this.token = token,
		this.id = userId
	}
}

