import { DataTypes } from 'sequelize';

import { sequelize } from '../config/db';
import { UserInstance } from '../types/users.types';
import { USER_ROLES } from '../constants';

export const User = sequelize.define<UserInstance>(
  'User',
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatarUrl: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    role: {
      type: DataTypes.ENUM(USER_ROLES.USER, USER_ROLES.ADMIN),
      defaultValue: USER_ROLES.USER,
    },
    isVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    isBlocked: {
      type: DataTypes.BOOLEAN,
      defaultValue: false,
    },
    authProvider: {
      type: DataTypes.ENUM('local', 'google', 'github'),
      defaultValue: 'local',
    },
    refreshToken: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    tableName: 'Users',
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ['password', 'refreshToken'] },
    },
  },
);
