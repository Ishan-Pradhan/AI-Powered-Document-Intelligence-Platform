import { Model, Optional } from "sequelize";

export interface Users{
     id: string;
        email: string;
        password: string;
        name: string;
        role: 'user' | 'admin';
        isVerified: boolean;
        isBlocked: boolean;
        refreshToken: string | null;
        createdAt?: Date;
        updatedAt?: Date;
}

export type UserCreationAttributes = Optional<
    Users,
    | 'id'
    | 'role'
    | 'isVerified'
    | 'isBlocked'
    | 'refreshToken'
    | 'createdAt'
    | 'updatedAt'
>;

export type UserInstance = Model<Users, UserCreationAttributes> & Users;