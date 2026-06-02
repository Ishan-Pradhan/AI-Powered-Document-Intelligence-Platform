import { Document } from '../models/documents.model';

export const documentsRepository = {
  create: async (data: {
    title: string;
    filename: string;
    fileType: string;
    status?: string;
    uploadedBy?: string;
  }) => {
    return await Document.create(data);
  },

  findById: async (id: string) => {
    return await Document.findByPk(id);
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'processing' | 'ready' | 'failed',
  ) => {
    return await Document.update({ status }, { where: { id } });
  },

  getAllDocuments: async (options?: { limit?: number; offset?: number; search?: string }) => {
    const { limit, offset, search } = options || {};
    const { Op } = require("sequelize");
    const where: any = {};
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    return await Document.findAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });
  },

  findAndCountAll: async (options?: { limit?: number; offset?: number; search?: string }) => {
    const { limit, offset, search } = options || {};
    const { Op } = require("sequelize");
    const where: any = {};
    if (search) {
      where.title = { [Op.iLike]: `%${search}%` };
    }
    return await Document.findAndCountAll({
      where,
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });
  },

  deleteDocument: async (id: string) => {
    return await Document.destroy({ where: { id } });
  },
};
