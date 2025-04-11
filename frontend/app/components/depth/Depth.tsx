"use client";

import { useEffect, useRef, useState } from "react";
import { getDepth, getKlines, getTicker, getTrades } from "../../utils/httpClients";
import { BidTable } from "./BidTable";
import { AskTable } from "./AskTable";
import { SignalingManager } from "@/app/utils/SignalingManager";

export function Depth({ market }: { market: string }) {
  const [bids, setBids] = useState<[string, string][]>([]);
  const [asks, setAsks] = useState<[string, string][]>([]);
  const [price, setPrice] = useState<string>();

  const pendingDepthRef = useRef<{ bids: [string, string][], asks: [string, string][] } | null>(null);
  const throttleTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const applyDepthUpdate = () => {
    const data = pendingDepthRef.current;
    if (!data) return;
  
    setBids((originalBids) => {
      const updated = new Map(originalBids.map(([p, q]) => [p, q]));
  
      for (const [price, qty] of data.bids) {
        if (Number(qty) === 0) {
          updated.delete(price);
        } else {
          updated.set(price, qty);
        }
      }
  
      const result = Array.from(updated.entries()).sort((a, b) => Number(b[0]) - Number(a[0]));
      return result;
    });
  
    setAsks((originalAsks) => {
      const updated = new Map(originalAsks.map(([p, q]) => [p, q]));
  
      for (const [price, qty] of data.asks) {
        if (Number(qty) === 0) {
          updated.delete(price);
        } else {
          updated.set(price, qty);
        }
      }
  
      const result = Array.from(updated.entries()).sort((a, b) => Number(a[0]) - Number(b[0]));
      return result;
    });
  
    pendingDepthRef.current = null;
  };
  

  useEffect(() => {
    const throttledHandler = (data: any) => {
      pendingDepthRef.current = data;

      if (!throttleTimeoutRef.current) {
        throttleTimeoutRef.current = setTimeout(() => {
          applyDepthUpdate();
          throttleTimeoutRef.current = null;
        }, 0); // Adjust throttle delay (ms)
      }
    };

    SignalingManager.getInstance().registerCallback("depth", throttledHandler, `DEPTH-${market}`);
    SignalingManager.getInstance().sendMessage({ method: "SUBSCRIBE", params: [`depth.200ms.${market}`] });

    getDepth(market).then((d) => {
      setBids(d.bids.reverse());
      setAsks(d.asks);
    });

    getTicker(market).then((t) => setPrice(t.lastPrice));
    getTrades(market).then((t) => setPrice(t[0].price));

    return () => {
      SignalingManager.getInstance().sendMessage({ method: "UNSUBSCRIBE", params: [`depth.200ms.${market}`] });
      SignalingManager.getInstance().deRegisterCallback("depth", `DEPTH-${market}`);
      if (throttleTimeoutRef.current) clearTimeout(throttleTimeoutRef.current);
    };
  }, [market]);

  return (
    <div>
      <TableHeader />
      {asks && <AskTable asks={asks} />}
      {price && <div>{price}</div>}
      {bids && <BidTable bids={bids} />}
    </div>
  );
}

function TableHeader() {
  return (
    <div className="flex justify-between text-xs">
      <div className="text-white">Price</div>
      <div className="text-slate-500">Size</div>
      <div className="text-slate-500">Total</div>
    </div>
  );
}
