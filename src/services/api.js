import axios from 'axios';

const API_BASE_URL = '/api';


export const startResearch = async (topic, numPapers, downloadPdfs) => {
    const response = await axios.post(`${API_BASE_URL}/research`, {
        topic,
        num_papers: numPapers,
        download_pdfs: downloadPdfs
    });
    return response.data;
};


export const getPapers = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/papers`);
        return response.data;
    } catch (error) {
        console.error('Error fetching papers:', error);
        return [];
    }
};


export const getEntities = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/entities`);
        return response.data;
    } catch (error) {
        console.error('Error fetching entities:', error);
        return null;
    }
};


export const getSynthesis = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/synthesis`);
        return response.data;
    } catch (error) {
        console.error('Error fetching synthesis:', error);
        return null;
    }
};


export const getSimilarity = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/similarity`);
        return response.data;
    } catch (error) {
        console.error('Error fetching similarity:', error);
        return null;
    }
};


export const getDraft = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/draft`);
        return response.data;
    } catch (error) {
        console.error('Error fetching draft:', error);
        return null;
    }
};


export const reviseDraft = async (instructions) => {
    const response = await axios.post(`${API_BASE_URL}/revise`, {
        instructions
    });
    return response.data;
};


export const getPDFs = async () => {
    try {
        const response = await axios.get(`${API_BASE_URL}/pdfs`);
        return response.data;
    } catch (error) {
        console.error('Error fetching PDFs:', error);
        return [];
    }
};


export const loadOutputFile = async (filename) => {
    try {
        const response = await axios.get(`${API_BASE_URL}/outputs/${filename}`);
        return response.data;
    } catch (error) {
        console.error(`Error loading ${filename}:`, error);
        return null;
    }
};
