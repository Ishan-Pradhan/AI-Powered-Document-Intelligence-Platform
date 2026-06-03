import { Op, WhereOptions } from 'sequelize';
import { Document } from '../models/documents.model';
import { DocumentAttributes, DocumentInstance } from '../types/document.types';

const buildDocumentWhere = (
  search?: string,
): WhereOptions<DocumentAttributes> => {
  const where: WhereOptions<DocumentAttributes> = {};

  if (search) {
    where.title = { [Op.iLike]: `%${search}%` };
  }

  return where;
};

export const documentsRepository = {
  create: async (data: {
    title: string;
    filename: string;
    fileType: 'pdf' | 'docx' | 'txt' | 'csv' | 'xlsx' | 'xls';
    status?: 'pending' | 'processing' | 'ready' | 'failed';
    uploadedBy?: string;
  }): Promise<DocumentInstance> => {
    return await Document.create(data);
  },

  findById: async (id: string): Promise<DocumentInstance | null> => {
    return await Document.findByPk(id);
  },

  updateStatus: async (
    id: string,
    status: 'pending' | 'processing' | 'ready' | 'failed',
  ): Promise<number[]> => {
    return await Document.update({ status }, { where: { id } });
  },

  findAndCountAll: async (options?: {
    limit?: number;
    offset?: number;
    search?: string;
  }): Promise<{ rows: DocumentInstance[]; count: number }> => {
    const { limit, offset, search } = options || {};

    const where = buildDocumentWhere(search);

    return Document.findAndCountAll({
      where,
      limit,
      offset,
      order: [['createdAt', 'DESC']],
    });
  },

  deleteDocument: async (id: string): Promise<number> => {
    return await Document.destroy({ where: { id } });
  },
};
