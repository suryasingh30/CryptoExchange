import {Ticker} from "./types";

export const BASE_URL = "wss://ws.backpack.exchange/"
// export const BASE_URL = "ws://localhost:3001"

export class SignalingManager{
    private ws: WebSocket;
    private static instance: SignalingManager;
    private bufferedMessage: any[] = [];
    private callbacks: any = {};
    private id: number;
    private  initialized: boolean = false;

    private constructor(){
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessage = [];
        this.id = 1;
        this.init();
    }

    public static getInstance(){
        if(!this.instance)
            this.instance  = new SignalingManager();

    return this.instance;
    }
    
    init(){
        this.ws.onopen = () => {
            this.initialized = true;
            this.bufferedMessage.forEach(message => {
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessage = [];
        }

        this.ws.onmessage = (event) => {
            const message = JSON.parse(event.data);
            const type = message.data.e;

            if(this.callbacks[type]){
                this.callbacks[type].forEach(({callback}) => {
                    if(type === "ticker"){
                        const newTicker: Partial<Ticker> = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s,
                        }
                        console.log(newTicker);
                        callback(newTicker);
                    }

                    if(type === "depth"){
                        const updateBids = message.data.b;
                        const updateAsks = message.data.a;
                        callback({bids: updateBids, asks: updateAsks});
                    }
                });
            }
        }
    }

    sendMessage(message: any){
        const messageToSend = {
            ...message,
            id: this.id++
        }
        if(!this.initialized){
            this.bufferedMessage.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }

    async registerCallback(type: string, callback: any, id: string){
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({callback, id});
    }

    async deRegisterCallback(type: string, id: string){
        if(this.callbacks[type]){
            const index = this.callbacks[type].findIndex(callback => callback.id === id);
            if(index !== -1)
                this.callbacks[type].splice(index, 1);
        }
    }
}