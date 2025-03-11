import fs from "fs";
import { RedisManager } from "../RedisManager";
import {ORDER_UPDATE, TRADE_ADDED} from "../types/index";
import { CANCEL_ORDER, CREATE_ORDER, GET_DEPTH, GET_OPEN_ORDERS, MessageFromApi, ON_RAMP } from "../types/fromApi";
import {Fill, Order, Orderbook} from "./Orderbook";

export const BASE_CURRENCY = "INR";

interface UserBalance {
    [key: string]: {
        available: number;
        locked: number;
    }
}

export class Engine {
    private orderbooks: Orderbook[] = [];
    private balance: Map<string,UserBalance> = new Map();

    constructor(){
        let snapshot = null
        try {
            if (process.env.WITH_SNAPSHOT) {
                snapshot = fs.readFileSync("./snapshot.json");
            }
        }  catch(e) {
            console.log("No snapshot found");
        }

        if(snapshot){
            const snapshotSnapshot = JSON.parse(snapshot.toString());
            this.orderbooks = snapshotSnapshot.orderbooks.map((o: any) => new Orderbook(o.baseAsset, o.bids, o.asks, o.lastTradeId, o.currentPrice));
            this.balance = new Map(snapshotSnapshot.balance);
        } else {
            this.orderbooks = [new Orderbook(`TATA`, [], [], 0, 0)];
            this.setBaseBalance();
        }
        setInterval(()=>{
            this.saveSnapshot();
        }, 1000 * 10);
    }

    saveSnapshot(){
        const snapshotSnapshot = {
            orderbooks: this.orderbooks.map(o => o.getSnapshot()),
            balances: Array.from(this.balance.entries())
        }
        fs.writeFileSync("./snapshot.json", JSON.stringify(snapshotSnapshot));
    }

    process({message, clientId}:{message: MessageFromApi, clientId: string}){
        switch(message.type){
            case CREATE_ORDER:
                try {
                    const {executedQty, fills, orderId} = this.createOrder(message.data.market, message.data.price, message.data.quantity, message.data.side, message.data.userId);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_PLACED",
                        payload: {
                            orderId,
                            executedQty,
                            fills
                        }
                    })
                }
        }
    }

    createOrder(market: string, price: string, quantity: string, side: "buy"|"sell", userId: string){
        const orderbook = this.orderbooks.find(o => o.ticker() === market)
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[0];

        if(!orderbook)
            throw new Error("No orderboo found");

        this.checkAndLockFunds(baseAsset, quoteAsset, side, userId, quoteAsset, price, quantity);

        const order: Order = {
            price: Number(price),
            quantity: Number(quantity),
            orderId: Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15),
            filled: 0,
            side,
            userId
        }


    }

    checkAndLockFunds(baseAsset: string, quoteAsset: string, side: "buy"|"sell", userId: string, asset: string, price: string, quantity: string){
        if(side === "buy")
        {
            if((this.balance.get(userId)?.[quoteAsset]?.available || 0) < Number(quantity) * Number(price))
                throw new Error("Insufficient funds");
        }

    }

    setBaseBalance(){
        this.balance.set("1",{
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });

        this.balance.set("2", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });

        this.balance.set("3", {
            [BASE_CURRENCY]: {
                available: 10000000,
                locked: 0
            },
            "TATA": {
                available: 10000000,
                locked: 0
            }
        });
    }
}