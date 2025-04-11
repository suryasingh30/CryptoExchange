import type { NextApiRequest, NextApiResponse } from "next";
import axios from "axios";

const BASE_URL = 'https://api.backpack.exchange/api/v1';

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const {symbol} = req.query;

    if(!symbol || typeof symbol !== "string")
        return res.status(400).json({error: "Missing or invalid market"});

    try {
        const response = await axios.get(`${BASE_URL}/trades`, {
            params: {
                symbol
            }
        });
        console.log("trade hit");
        return res.status(200).json(response.data);
    } catch(error: any) {
        console.error("get Trade habdler failed", error.message);
        return res.status(500).json({error: "Failed to fetch tardes"});
    }
}