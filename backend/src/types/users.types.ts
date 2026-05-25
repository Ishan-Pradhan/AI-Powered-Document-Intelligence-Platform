
export interface Users{
    id: string;
    email: string;
    password: string;
    name: string;
    role: "user" | 'admin';
    isVerified: boolean;
    isBlocked: boolean;
}