import axios from "axios";
import {Depth, KLine, Ticker, Trade} from './types';
import { resolve } from "path";

const BASE_URL = "https://api.backpack.exchange/api/v1";

export async function getTickers(): Promise<Ticker[]> {
    const response = await axios.get(`${BASE_URL}/tickers`);
    return response.data;
}

export async function getTicker(market: string): Promise<Ticker>{
    const tickers = await getTickers();
    const ticker = tickers.find(t => t.symbol === market);  
    if(!ticker)
    {
        throw new Promise(resolve => setTimeout(resolve, 1000));
    }
    return ticker;
}
// const x = getTickers()

export async function getDepth(market: string): Promise<Depth>{
    const response = await axios.get(`${BASE_URL}/depth?symbol=${market}`)
    return response.data;
}

export async function getTrades(market:string): Promise<Trade[]>{
    const response = await axios.get(`${BASE_URL}/trade?symbol=${market}`);
    return response.data;
}

export async function getKlines(market:string, interval: string, startTime: number, endTime: number): Promise<KLine[]> {
    const response = await axios.get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
    const data: KLine[] = response.data;
    return data.sort((x,y) => (Number(x.end) < Number(y.end) ? -1: 1));
}

