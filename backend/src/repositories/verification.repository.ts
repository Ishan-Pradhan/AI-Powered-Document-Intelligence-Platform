import { Verification } from "../models/verification.models";

export const verificationRepository = {
  createEmailVerification: async (userId: string, token: string, expiresAt: Date) => {
    return await Verification.create({
      userId,
      token,
      type: "emailVerification",
      expiresAt,
    } as any);
  },

  findEmailVerificationByToken: async (token: string) => {
    return await Verification.findOne({
      where: {
        token,
        type: "emailVerification",
      },
    });
  },

  deleteById: async (id: string) => {
    return await Verification.destroy({
      where: {
        id,
      },
    });
  },

  deleteEmailVerificationsForUser: async (userId: string) => {
    return await Verification.destroy({
      where: {
        userId,
        type: "emailVerification",
      },
    });
  },
};
