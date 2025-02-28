"use client"

import { useEffect, useState } from "react";
import { Ticker } from "../utils/types" ;
import { getTicker } from "../utils/httpClients";
import { SignalingManager } from "../utils/SignalingManager";

export const MarketBar = ({market}: {market: string}) => {
    const [ticker,setTicker] = useState<Ticker | null>(null);

    useEffect(() => {
        getTicker(market).then(setTicker);
        SignalingManager.getInstance().registerCallback("ticker", (data: Partial<Ticker>)  =>  setTicker(prevTicker => ({
            firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? '',
            high: data?.high ?? prevTicker?.high ?? '',
            lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? '',
            low: data?.low ?? prevTicker?.low ?? '',
            priceChange: data?.priceChange ?? prevTicker?.priceChange ?? '',
            priceChangePercent: data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? '',
            quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? '',
            symbol: data?.symbol ?? prevTicker?.symbol ?? '',
            trades: data?.trades ?? prevTicker?.trades ?? '',
            volume: data?.volume ?? prevTicker?.volume ?? '',
        })), `TICKER-${market}`);
        SignalingManager.getInstance().sendMessage({"method":"SUBSCRIBE","params":[`ticker.${market}`]});
        
        return () => {
            SignalingManager.getInstance().deRegisterCallback("ticker", `Ticker-${market}`);
            SignalingManager.getInstance().sendMessage({"method":"UNSUBSCRIBE", "params":[`Ticker-${market}`]});
        }
    }, [market]);
    
    return <div>
        <div className="flex items-center flex-row relative w-full overflow-hidden border-b border-slate-800">
            <div className="">
                <Tickerr market={market}/>
                <div>
                    <div>
                        <p>${ticker?.lastPrice}</p>
                        <p>${ticker?.lastPrice}</p>
                    </div>
                    <div>
                        <p>24H Change</p>
                        <p>{Number(ticker?.priceChange) > 0 ? "+" : ""}{ticker?.priceChange}{Number(ticker?.priceChangePercent)?.toFixed(2)}%</p>
                        <div>
                            <p>24H high</p>
                            <p>{ticker?.high}</p>
                        </div>
                        <div>
                            <p>24H Low</p>
                            <p>{ticker?.low}</p>
                        </div>
                        <button>
                            <div>
                                <p>24H Volume</p>
                                <p>{ticker?.volume}</p>
                            </div>
                        </button>
                    </div>
                </div>
            </div> 
        </div>
    </div>
}

function Tickerr({market}: {market: string}){
    return <div>
        <div>
            <img alt="SOL Logo" loading="lazy" decoding="async" data-nimg="1" className="z-10 rounded-full h-6 w-6 mt-4 ouutline-baseBackgroundL1" src="/sol.webp"/>
            <img alt="USDC Logo" loading="lazy" decoding="async" data-nigm="1" className="h-6 w-6 -ml-2 mtt-4 rounded-full" src="/usdc.webpe"/>
        </div>
        <button>
            <div>
                <div>
                    <div>
                        <p>{market.replace("_"," / ")}</p>
                    </div>
                </div>
            </div>
        </button>
    </div>
}