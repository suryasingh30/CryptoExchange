"use client"

import { useEffect, useState } from "react";
import {Ticker} from "../utils/types";
import { getTickers } from "../utils/httpClients";
import { useRouter } from "next/router";

export const Markets = () => {
    const [tickers, setTickers] = useState<Ticker[]>();

    useEffect(() => {
        getTickers().then((m)=>setTickers(m));
    }, []);

    return (
        <div className="">
            <div className="">
                <div className="">
                    <table className="">
                        <MarketHeader/>
                        {tickers?.map((m) => <MarketRow market={m}/>)}
                    </table>
                </div>
            </div>
        </div>  
    );
};

function MarketRow({market} : {market: Ticker}){
    const router = useRouter();
    return (
        <tr>
            <td>
                <div>
                    <div>
                        <div>
                            <div>
                                <img/>
                            </div>
                        </div>
                        <div>
                            <p>
                                {market.symbol}
                            </p>
                            <div>
                                <p>
                                    {market.symbol}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>
            </td>
            <td>
                <p>{market.lastPrice}</p>
            </td>
            <td>
                <p>{market.high}</p>
            </td>
            <td>
                <p>{market.volume}</p>
            </td>
            <td>
                <p>{Number(market.priceChangePercent)?.toFixed(3)}%</p>
            </td>
        </tr>
    );
}

function MarketHeader(){
    return (
        <thead>
            <tr>
                <th>
                    <div>
                        Name<span></span>
                    </div>
                </th>
                <th>
                    <div>
                        Price<span></span>
                    </div>
                </th>
                <th>
                    <div>
                        Market Cap<span></span>
                    </div>
                </th>
                <th>
                    <div>
                        24th Volume
                        <svg>
                            <path></path>
                            <path></path>
                        </svg>
                    </div>
                </th>
                <th>
                    <div>
                        24th Change<span></span>
                    </div>
                </th>
            </tr>
        </thead>
    );
}