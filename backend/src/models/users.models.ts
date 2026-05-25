import { DataTypes } from "sequelize";
import { sequelize } from "../config/db";

export const User = sequelize.define("User",{
    id:{
        type: DataTypes.UUID,
        defaultValue: DataTypes.UUIDV4,
        primaryKey: true,
    },
    email:{
        type: DataTypes.STRING,
        allowNull: false,
        unique: true,
    },
    password:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    name:{
        type: DataTypes.STRING,
        allowNull: false,
    },
    role:{
        type: DataTypes.ENUM("user", "admin"),
        defaultValue: "user",
    },
    isVerified:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,    
    },
    isBlocked:{
        type: DataTypes.BOOLEAN,
        defaultValue: false,    
    }
})