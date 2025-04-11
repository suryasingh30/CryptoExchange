import type {NextApiRequest, NextApiResponse} from "next";
import axios from "axios";

const BASE_URL = "https://api.backpack.exchange/api/v1";

export default async function handler(req: NextApiRequest, res: NextApiResponse){
    const {symbol, interval, startTime, endTime} = req.query;
    try {
        const response = await axios.get(`${BASE_URL}/klines`, {
            params: {
                symbol,
                interval,
                startTime,
                endTime
            },
        });
        res.status(200).json(response.data);
        console.log("klines hit")
    } catch (error: any) {
        console.error("Klines error:", error.response?.data || error.message);
        res.status(500).json({error: "Failed to fetch klines"});
    }
}