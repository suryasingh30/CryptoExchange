import type { NextApiRequest, NextApiResponse } from "next";
import axios from 'axios';

const BASE_URL = 'https://api.backpack.exchange/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    try {
        const response = await axios.get(`${BASE_URL}/tickers`);
        res.status(200).json(response.data);
        console.log("ticker hit")
    } catch(error) {
        console.error('Error fetching tickers:', error);
        res.status(500).json({error: 'Failed to fetch tickers'});
    }
}