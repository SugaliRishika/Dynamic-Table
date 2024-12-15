import axios from 'axios';

const BASE_URL = 'https://api.artic.edu/api/v1/artworks?page=1'; 

export const fetchData = async (page: number, rows: number = 12) => {
    try {
        const response = await axios.get(BASE_URL, {
            params: { page, rows }
        });
        return response.data.data; 
    } catch (error) {
        console.error("Error fetching data:", error);
        return [];
    }
};
