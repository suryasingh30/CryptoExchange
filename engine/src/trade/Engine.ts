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
        let snapshot: Buffer | null = null;
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
                    });
                } catch (e) {
                    console.log(e);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId: "",
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });
                }
                break;
            
            case CANCEL_ORDER:
                try {
                    const orderId = message.data.odereId;
                    const cancelMarket = message.data.market;
                    const cancelOrderbook = this.orderbooks.find(o => o.ticker() === cancelMarket);
                    const quoteAsset = cancelMarket.split("_")[1];
                    if(!cancelOrderbook)
                        throw new Error("No orderbook found")

                    const order = cancelOrderbook.asks.find(o => o.orderId === orderId) || cancelOrderbook.bids.find(o => o.orderId === orderId);
                    if(!order)
                    {
                        console.log("No order found to CANCEL_ORDER");
                        throw new Error("No order found");
                    }

                    if(order.side === "buy"){
                        const price = cancelOrderbook.cancelBid(order)
                        const leftQuantity = (order.quantity - order.filled) * order.price;
                        // @ts-ignore
                        this.balance.get(order.userId)[BASE_CURRENCY].available += leftQuantity;
                        // @ts-ignore
                        this.balance.get(order.userId)[BASE_CURRENCY].locked -= leftQuantity;
                        if(price)
                            this.sendUpdateDepthAt(price.toString(), cancelMarket);
                    }

                    else{
                        const price = cancelOrderbook.cancelAsk(order)
                        const leftQuantity = order.quantity - order.filled;
                        // @ts-ignore
                        this.balance.get(order.userId)[quoteAsset].available += leftQuantity;
                        // @ts-ignore
                        this.balance.get(order.userId)[quoteAsset].locked -= leftQuantity;
                        if(price)
                            this.sendUpdateDepthAt(price.toString(), cancelMarket);
                    }

                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "ORDER_CANCELLED",
                        payload: {
                            orderId,
                            executedQty: 0,
                            remainingQty: 0
                        }
                    });

                } catch (e) {
                    console.log("Error while cancelling order", );
                    console.log(e);
                }
                break;

            case GET_OPEN_ORDERS:
                try {
                    const openOrderbook = this.orderbooks.find(o => o.ticker() === message.data.market);
                    if(!openOrderbook)
                        throw new Error("No orderbook found!");

                    const openOrders = openOrderbook.getOpenOrders(message.data.userId);

                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "OPEN_ORDERS",
                        payload: openOrders
                    });
                } catch (e) {
                    console.log(e);
                }
                break;

            case ON_RAMP:
                const userId = message.data.userId;
                const amount = Number(message.data.amount);
                this.onRamp(userId, amount);
                break;

            case GET_DEPTH:
                try {
                    const market = message.data.market;
                    const orderbook = this.orderbooks.find(o => o.ticker() === market);
                    if(!orderbook)
                        throw new Error("No orderbook found!");
                    RedisManager.getInstance().sendToApi(clientId, {
                        type:  "DEPTH",
                        payload: orderbook.getDepth()
                    })
                } catch (e) {
                    console.log(e);
                    RedisManager.getInstance().sendToApi(clientId, {
                        type: "DEPTH",
                        payload: {
                            asks: [],
                            bids: []
                        }
                    })
                }
                break;
        }
    }

    onRamp(userId: string, amount: number){
        const userBalnace = this.balance.get(userId);
        if(!userBalnace){
            this.balance.set(userId, {
                [BASE_CURRENCY]: {
                    available: amount,
                    locked: 0
                }
            })
        } else {
            userBalnace[BASE_CURRENCY].available += amount;
        }
    }

    sendUpdateDepthAt(price: string, market: string){
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if(!orderbook)
            return;

        const depth = orderbook.getDepth();
        const updateBids = depth?.bids.filter(x => x[0] === price);
        const updateAsks = depth?.asks.filter(x => x[0] === price);

        RedisManager.getInstance().publishMessage(`depth@${market}`, {
            stream: `depth@${market}`,
            data: {
                a: updateAsks.length ? updateAsks : [[price, "0"]],
                b: updateBids.length ? updateBids : [[price, "0"]],
                e: "depth"
            }
        });
    }

    createOrder(market: string, price: string, quantity: string, side: "buy"|"sell", userId: string){
        const orderbook = this.orderbooks.find(o => o.ticker() === market)
        const baseAsset = market.split("_")[0];
        const quoteAsset = market.split("_")[1];

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

        const {fills, executedQty} = orderbook.addOrder(order);
        this.updateBalance(userId, baseAsset, quoteAsset, side, fills, executedQty);
        
        this.createDbTrades(fills, market, userId);
        this.updateDbOrders(order, executedQty, fills, market);
        this.publishWsDepthUpdates(fills, price, side, market);
        this.publishWsTrades(fills, userId, market);

    return {executedQty, fills, orderId: order.orderId};
    }

    createDbTrades(fills: Fill[], market: string, userId: string){
        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: TRADE_ADDED,
                data: {
                    market: market,
                    id: fill.tradeId.toString(),
                    isBuyerMaker: fill.otherUserId === userId ? "1" : "0",
                    price: fill.price,
                    quantity: fill.price,
                    quoteQuantity: (fill.qty * Number(fill.price)).toString(),
                    timestamp: Date.now()
                }
            });
        });
    }
    
    updateDbOrders(order: Order, executedQty: number, fills: Fill[], market: string){
        RedisManager.getInstance().pushMessage({
            type: ORDER_UPDATE,
            data: {
                orderId: order.orderId,
                executedQty: executedQty,
                market: market,
                price: order.price.toString(),
                quantity: order.quantity.toString(),
                side: order.side
            }
        });

        fills.forEach(fill => {
            RedisManager.getInstance().pushMessage({
                type: ORDER_UPDATE,
                data: {
                    orderId: fill.markerOrderId,
                    executedQty: fill.qty
                }
            })
        })
    }

    publishWsDepthUpdates(fills: Fill[], price: string, side: "buy" | "sell", market: string){
        const orderbook = this.orderbooks.find(o => o.ticker() === market);
        if(!orderbook)
            return;

        const depth = orderbook.getDepth();
        if(side === "buy")
        {
            const updateAsks = depth?.asks.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            const updateBids = depth?.bids.find(x => x[0] === price);
            console.log("publish ws depth updates");
            RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updateAsks,
                    b: updateBids ? [updateBids] : [],
                    e: "depth"
                }
            });
        }

        if(side === "sell")
        {
            const updateAsks = depth?.asks.find(x => x[0] === price);
            const updateBids = depth?.bids.filter(x => fills.map(f => f.price).includes(x[0].toString()));
            console.log("publish ws depth updates");
            RedisManager.getInstance().publishMessage(`depth@${market}`, {
                stream: `depth@${market}`,
                data: {
                    a: updateAsks ? [updateAsks]: [],
                    b: updateBids,
                    e: "depth"
                }
            });
        }
    }

    publishWsTrades(fills: Fill[], userId: string, market: string){
        fills.forEach(fill => {
            RedisManager.getInstance().publishMessage(`trade@${market}`, {
                stream: `trade@${market}`,
                data: {
                    e: "trade",
                    t: fill.tradeId,
                    m: fill.otherUserId === userId,
                    p: fill.price,
                    q: fill.qty.toString(),
                    s:  market
                }
            });
        });
    }

    updateBalance(userId: string, baseAsset: string, quoteAsset: string, side: "buy" | "sell", fills: Fill[], executedQty: number){
        if(side == "buy"){
            fills.forEach(fill => {
                // update the quote asset balance
                // @ts-ignore
                this.balance.get(fill.otherUserId)[quoteAsset].available = this.balance.get(fill.otherUserId)?.[quoteAsset].available + (fill.qty * fill.price);
                // @ts-ignore
                this.balance.get(userId)[quoteAsset].locked = this.balance.get(userId)?.[quoteAsset].locked + (fill.qty * fill.price);

                // update the base asset balance
                // @ts-ignore
                this.balance.get(fill.otherUserId)[baseAsset].locked =  this.balance.get(fill.otherUserId)?.[baseAsset].locked - fill.qty;
                // @ts-ignore
                this.balance.get(userId)[baseAsset].available = this.balance.get(userId)?.[baseAsset].available + fill.qty;
            });
        } else {
            fills.forEach(fill => {
                // update quote asset balance
                // @ts-ignore
                this.balance.get(fill.otherUserId)[quoteAsset].locked = this.balance.get(userId)?.[quoteAsset].locked - (fill.gty * fill.price);
                // @ts-ignore
                this.balance.get(userID)[baseAsset].available = this.balance.get(userId)?.[quoteAsset].available + (fill.qty * fill.price);

                // update base asset balance
                // @ts-ignore
                this.balance.get(fill.otherUserId)[baseAsset].available = this.balance.get(fill.otherUserId)?.[baseAsset].available + fill.qty;
                // @ts-ignore
                this.balance.get(userId)[baseAsset].locked = this.balance.get(userId)?.[baseAsset].locked - (fill.qty);
            });
        }
    }

    checkAndLockFunds(baseAsset: string, quoteAsset: string, side: "buy"|"sell", userId: string, asset: string, price: string, quantity: string){
        if(side === "buy")
        {
            if((this.balance.get(userId)?.[quoteAsset]?.available || 0) < Number(quantity) * Number(price))
                throw new Error("Insufficient funds");

            // @ts-ignore
            this.balance.get(userId)[quoteAsset].available = this.balance.get(userId)?.[quoteAsset].available - (Number(quantity) * Number(price));
            // @ts-ignore
            this.balance.get(userId)[quoteAsset].locked = this.balance.get(userId)?.[quoteAsset].locked + (Number(quantity) * Number(price));
        } else {
            if((this.balance.get(userId)?.[baseAsset]?.available || 0) < Number(quantity))
                throw new Error("Insufficient funds");

            // @ts-ignore
            this.balance.get(userId)[baseAsset].available = this.balance.get(userId)?.[baseAsset].available - (Number(quantity));
            // @ts-ignore
            this.balance.get(userId)[baseAsset].locked = this.balance.get(userId)?.[baseAsset].locked + Number(quantity);
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