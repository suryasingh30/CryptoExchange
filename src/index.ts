import express from "express";
import { OrderInputSchema } from "./types";
import { orderbook,bookWithQunatity } from "./orderbooks";

const  BASE_ASSET = 'BTC';
const QUOTE_ASSET = 'USD';

const app = express();
app.use(express.json());

let GLOBAL_TRADE_ID = 0;

app.post('/api/v1/order',(req,res) => {
    const order = OrderInputSchema.safeParse(req.body);
    if(!order.success){
        res.status(400).send(order.error.message);
        return;
    }

    const {baseAsset, quoteAsset, price, quantity, side, kind} = order.data;
    const orderId = getOrderId();

    if(baseAsset !== BASE_ASSET || quoteAsset !== QUOTE_ASSET)
    {
        res.status(400).send('Invalid base or quote asset');
    }

    const {executedQty, fills} = fillOrder(orderId, price, quantity, side, kind);

})

function getOrderId():string{
    return Math.random().toString(36).substring(2,15) + Math.random().toString(36).substring(2,15);
}

interface Fill {
    "price": number,
    "qty": number,
    "tradeId": number
}

function fillOrder(orderId: string, price: number, quantity: number,  side: "buy"|"sell",  type?: "ioc"):{status: "rejected"|"accepted";executedQty: number; fills: Fill[]}{

    const fills: Fill[] = [];
    const maxFillQuantity = getFillAmount(price, quantity, side);
    let executedQty = 0;

    if(type=== 'ioc' && maxFillQuantity < quantity)
        return {status: 'rejected', executedQty:  maxFillQuantity, fills:[]};

    if(side === 'buy')
    {
        orderbook.asks.forEach(o => {
            if(o.price <= price && quantity > 0)
            {
                console.log("filling ask");
                const filledQuantity = Math.min(quantity, o.quantity);
                console.log(filledQuantity);
                o.quantity -= filledQuantity;
                bookWithQunatity.asks[o.price] = (bookWithQunatity.asks[o.price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    qty: filledQuantity,
                    tradeId: GLOBAL_TRADE_ID++
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if(o.quantity === 0)
                    orderbook.asks.splice(orderbook.asks.indexOf(o),1);
                if(bookWithQunatity.asks[price] === 0)
                    delete bookWithQunatity.asks[o.price];
            }
        });

        if(quantity != 0)
        {
            orderbook.bids.push({
                price,
                quantity: quantity - executedQty,
                side: 'bid',
                orderId
            });
            bookWithQunatity.bids[price] = (bookWithQunatity.bids[price] || 0) + (quantity - executedQty);
        }
    }
    else
    {
        orderbook.bids.forEach(o => {
            if(o.price >= price && quantity > 0){
                const filledQuantity = Math.min(quantity, o.quantity);
                o.quantity -= filledQuantity;
                bookWithQunatity.bids[price] = (bookWithQunatity.bids[price] || 0) - filledQuantity;
                fills.push({
                    price: o.price,
                    qty: filledQuantity,
                    tradeId: GLOBAL_TRADE_ID++
                });
                executedQty += filledQuantity;
                quantity -= filledQuantity;
                if(o.quantity == 0)
                    orderbook.bids.splice(orderbook.bids.indexOf(o),1);
                if(bookWithQunatity.bids[price] === 0)
                    delete bookWithQunatity.bids[price];
            }
        });

        if(quantity !== 0)
        {
            orderbook.asks.push({
                price,
                quantity: quantity,
                side: 'ask',
                orderId
            });
            bookWithQunatity.asks[price] = (bookWithQunatity.asks[price] || 0) + (quantity);
        }
    }

    return {
        status: 'accepted',
        executedQty,
        fills
    }
}

function getFillAmount(price: number, quantity:number, side: "buy"|"sell"):number{
    let filled = 0;
    if(side === 'buy')
    {
        orderbook.asks.forEach(o => {
            if(o.price < price)
                filled += Math.min(quantity, o.quantity);
        });
    }
    else
    {
        orderbook.bids.forEach(o => {
            if(o.price > price)
                filled += Math.min(quantity, o.quantity);
        })
    }
return filled;
}


