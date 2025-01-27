import { useEffect, useState } from "react";
import { getDepth, getKlines, getTicker, getTrades } from "@/app/utils/httpClients";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";

export const Depth = async({market} : {market:string}) => {
    const [bids, setBids] = useState<[string,string][]>();
    const [asks, setAsks] = useState<[string,string][]>();
    const [price, setPrice] = useState<string>();

    const depth = await getDepth(market).then(d => {
        setBids(d.bids.reverse());
        setAsks(d.asks);
    });

    getTicker(market).then(t => setPrice(t.lastPrice));

    return <div>
        <TableHeader/>
        {asks && <AskTable asks={asks}/>}
        {price && <div>{price}</div>}
        {bids && <BidTable bids={bids}/>}
    </div>
}

function TableHeader(){
    return <div className="flex justify-between tet-xs">
        <div className="text-white">Price</div>
        <div className="text-slate-500">Size</div>
        <div className="text-slate-500">Total</div>
    </div>
}

