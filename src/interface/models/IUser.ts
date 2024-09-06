export interface IUser extends Document {
    _id:string,
    firstName:string;
    lastName:string;
    email: string;
    password: string;
    comparePassword: (password: string) => Promise<boolean>;
    SignAccessToken: () => string;
    SignRefreshToken: () => string;
}