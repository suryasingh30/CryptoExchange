import { useEffect, useRef } from "react";
import { ChartManager } from "../utils/ChartManager";
import { getKlines } from "../utils/httpClients";
import { KLine } from "../utils/types";

export function TradeView({market,}:{market: string;}){
    const chartRef = useRef<HTMLDivElement>(null);
    const ChartManagerRef = useRef<ChartManager>(null);

    useEffect(()=>{
        const init = async () => {
            let klineData: KLine[] = [];
            try{
                klineData = await getKlines(market, "1h", Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7) / 1000), Math.floor(new Date().getTime() / 1000));
            } catch(e){}

            if(chartRef){
                if(ChartManagerRef.current)
                {
                    chartRef.current,
                    [
                        ...klineData?.map((x)=>({
                            close: parseFloat(x.close),
                            high: parseFloat(x.high),
                            low: parseFloat(x.low),
                            open: parseFloat(x.open),
                            timestamp: new Date(x.end)
                        })),
                    ].sort((x,y) => (x.timestamp < y.timestamp ? -1 : 1)) || [],
                    {
                        background: "#0e0f14",
                        color: "white"
                    }
                };
                // @ts-ignore
                ChartManagerRef.current = ChartManager;
            };
        };
        init();
    }, [market]);

    return (
        <>
            <div ref={chartRef} style={{height: "520px", width: "100%", marginTop: 4}}>
            </div>
        </>
    );
};
