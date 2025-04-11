"use client"

import { MarketBar } from "@/app/components/MarketBar";
import { useParams } from "next/navigation";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { SwapUI } from "@/app/components/SwapUI";

export default function Page(){

    const {market} = useParams() as {market: string};
    console.log({market});
    return <div className="flex flex-row flex-1">
        <div className="flex flex-col flex-1">
            <MarketBar market={market as string}/>
            <div className="flex flex-row h-[920px] border-y border-slate-800">
                <div className="flex flex-col flex-1">
                    <TradeView market={market as string}/>
                </div>
                <div className="flex flex-col w-[250px] overflow-hidden">
                    <Depth market={market as string}/>
                </div>
            </div>
        </div>
        <div>
            <div className="flex flex-col w-[250px]">
                <SwapUI market={market as string}/>
            </div>
        </div>
    </div>

}