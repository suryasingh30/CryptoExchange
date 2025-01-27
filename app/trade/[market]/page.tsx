"use client"

import { MarketBar } from "@/app/components/MarketBar";
import { useParams } from "next/navigation";
import { TradeView } from "@/app/components/TradeView";
import { Depth } from "@/app/components/depth/Depth";
import { SwapUI } from "@/app/components/SwapUI";

export default function Page(){

    const {market} = useParams();

    return <div className="flex flex-roow flex-1">
        <div className="flex flex-col flex-1">
            <MarketBar market={market as string}/>
            <div>
                <div>
                    <TradeView market={market as string}/>
                </div>
                <div>
                    <Depth market={market as string}/>
                </div>
            </div>
        </div>
        <div>
            <div>
                <SwapUI market={market}/>
            </div>
        </div>
    </div>

}