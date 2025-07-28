export interface IJWTPayload {
	exp: number;
	iat: number;
	sub?: string;
	email?: string;
}
