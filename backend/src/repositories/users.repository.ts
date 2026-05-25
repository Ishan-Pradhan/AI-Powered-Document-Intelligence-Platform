import { User } from "../models/users.models";
import { UserCreationAttributes } from "../types/users.types";

export const userRepository = {
  findAll: async () => {
    return await User.findAll();
  },

  
  findById: async (id: string) => {
    return await User.findByPk(id);
  },

  findByEmail: async (email: string) => {
    return await User.findOne({ where: { email } });
  },

  create: async (userData: UserCreationAttributes) => {
    return await User.create(userData);
  },
};