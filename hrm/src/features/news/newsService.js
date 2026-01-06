import api from "../../utils/api";

const API_URL = "/news";

export const listNews = async () => {
    const res = await api.get(API_URL);
    return res.data;
};

export const createNews = async (data) => {
    const res = await api.post(API_URL, data);
    return res.data;
};

export const updateNews = async (id, data) => {
    const res = await api.patch(`${API_URL}/${id}`, data);
    return res.data;
};

export const deleteNews = async (id) => {
    const res = await api.delete(`${API_URL}/${id}`);
    return res.data;
};

export const getWhatsAppStatus = async () => {
    const res = await api.get(`${API_URL}/whatsapp/status`);
    return res.data;
};
export const initWhatsAppSession = async () => {
    const res = await api.post(`${API_URL}/whatsapp/init`);
    return res.data;
};

export const updateWhatsAppSettings = async (groupId) => {
    const res = await api.post(`${API_URL}/whatsapp/settings`, { groupId });
    return res.data;
};

export const syncWhatsAppGroups = async () => {
    const res = await api.post(`${API_URL}/whatsapp/sync`);
    return res.data;
};

export const logoutWhatsAppSession = async (hardReset = false) => {
    const res = await api.post(`${API_URL}/whatsapp/logout`, { hardReset });
    return res.data;
};
