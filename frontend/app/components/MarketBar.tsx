"use client"

import { useEffect, useState } from "react";
import { Ticker } from "../utils/types" ;
import { getTicker } from "../utils/httpClients";
import { SignalingManager } from "../utils/SignalingManager";
import { useThrottle } from "../utils/useThrottle";

export const MarketBar = ({market}: {market: string}) => {
    const [rawTicker,setRawTicker] = useState<Ticker | null>(null);
    const throttledTicker = useThrottle(rawTicker, 900);

    useEffect(() => {
        getTicker(market).then(setRawTicker);
        SignalingManager.getInstance().registerCallback("ticker", (data: Partial<Ticker>)  =>  setRawTicker(prevTicker => ({
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

    const ticker = throttledTicker;
    
    return (
        <div className="w-full border-b border-slate-800 overflow-x-auto">
          <div className="flex items-center space-x-6 min-w-[768px] px-4 py-2">
            {/* Left-most: Ticker name */}
            <Tickerr market={market} />
      
            {/* Price section */}
            <div className="flex flex-col justify-center">
              <p className="font-medium text-green-500 tabular-nums text-md">
                ${ticker?.lastPrice}
              </p>
              <p className="font-medium text-s tabular-nums text-white">
                ${ticker?.lastPrice}
              </p>
            </div>
      
            {/* 24h Change */}
            <div className="flex flex-col justify-center">
              <p className="text-sm text-slate-400">24H Change</p>
              <p
                className={`text-sm font-medium tabular-nums leading-5 ${
                  Number(ticker?.priceChange) > 0
                    ? "text-green-500"
                    : "text-red-500"
                }`}
              >
                {Number(ticker?.priceChange) > 0 ? "+" : ""}
                {ticker?.priceChange} ({Number(ticker?.priceChangePercent)?.toFixed(2)}%)
              </p>
            </div>
      
            {/* 24H High */}
            <div className="flex flex-col justify-center">
              <p className="text-sm text-slate-400">24H High</p>
              <p className="text-sm font-medium tabular-nums leading-5 text-white">
                {ticker?.high}
              </p>
            </div>
      
            {/* 24H Low */}
            <div className="flex flex-col justify-center">
              <p className="text-sm text-slate-400">24H Low</p>
              <p className="text-sm font-medium tabular-nums leading-5 text-white">
                {ticker?.low}
              </p>
            </div>
      
            {/* 24H Volume */}
            <div className="flex flex-col justify-center">
              <p className="text-sm text-slate-400">24H Volume</p>
              <p className="text-sm font-medium tabular-nums leading-5 text-white">
                {ticker?.volume}
              </p>
            </div>
          </div>
        </div>
      );
      
}

function Tickerr({ market }: { market: string }) {
    return (
      <div className="flex h-[60px] items-center space-x-4 px-2">
        {/* Token Icons */}
        <div className="relative flex items-center">
          <img
            alt="Base Token Logo"
            loading="lazy"
            className="z-10 rounded-full h-6 w-6"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVvBqZC_Q1TSYObZaMvK0DRFeHZDUtVMh08Q&s"
          />
          <img
            alt="Quote Token Logo"
            loading="lazy"
            className="rounded-full h-6 w-6 -ml-2 border-2 border-gray-900"
            src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVvBqZC_Q1TSYObZaMvK0DRFeHZDUtVMh08Q&s"
          />
        </div>
  
        {/* Market Name */}
        <button
          type="button"
          className="px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition duration-200"
        >
          <p className="font-medium text-white text-sm tracking-wide">
            {market.replace("_", " / ")}
          </p>
        </button>
      </div>
    );
  }
  