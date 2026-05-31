import { Document } from "../models/documents.models";

export const documentsRepository = {
    create: async (data: { title: string; filename: string; fileType: string; status?: string; uploadedBy?: string }) => {
        return await Document.create(data);
    },

    findById: async (id: string) => {
        return await Document.findByPk(id);
    },

    updateStatus: async (id: string, status: 'pending' | 'processing' | 'ready' | 'failed') => {
        return await Document.update({ status }, { where: { id } });
    }
};
