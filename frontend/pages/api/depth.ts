import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BASE_URL = 'https://api.backpack.exchange/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const {symbol} = req.query;

    try {
        const response = await axios.get(`${BASE_URL}/depth`, {
            params: {
                symbol
            },
        });
        res.status(200).json(response.data);
        console.log("depth hit");
    } catch (error: any) {
        console.error("getDepth handler:", error.message);
        return res.status(500).json({error: "Failed to fetch"});
    }
}