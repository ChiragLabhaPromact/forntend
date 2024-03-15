export interface login {
    email: string;
    password: string;
}

export interface register {
    name: string;
    email: string;
    password: string;
}

export interface GetUser {
    id: string;
    name: string;
    email: string;
}