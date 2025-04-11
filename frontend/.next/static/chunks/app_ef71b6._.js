(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/app_ef71b6._.js", {

"[project]/app/utils/httpClients.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "getDepth": (()=>getDepth),
    "getKlines": (()=>getKlines),
    "getTicker": (()=>getTicker),
    "getTickers": (()=>getTickers),
    "getTrades": (()=>getTrades)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/axios/lib/axios.js [app-client] (ecmascript)");
;
const BASE_URL = "https://api.backpack.exchange/api/v1";
async function getTickers() {
    // const response = await axios.get(`${BASE_URL}/tickers`);
    // return response.data;
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get('/api/tickers');
    return response.data;
}
async function getTicker(market) {
    const tickers = await getTickers();
    const ticker = tickers.find((t)=>t.symbol === market);
    if (!ticker) {
        throw new Promise((resolve)=>setTimeout(resolve, 1000));
    }
    return ticker;
}
async function getDepth(market) {
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/api/depth", {
        params: {
            symbol: market
        }
    });
    return response.data;
}
async function getTrades(market) {
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/api/trades", {
        params: {
            symbol: market
        }
    });
    return response.data;
}
async function getKlines(market, interval, startTime, endTime) {
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get("/api/klines", {
        params: {
            symbol: market,
            interval,
            startTime,
            endTime
        }
    });
    const data = response.data;
    return data.sort((x, y)=>Number(x.end) < Number(y.end) ? -1 : 1);
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/utils/SignalingManager.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "BASE_URL": (()=>BASE_URL),
    "SignalingManager": (()=>SignalingManager)
});
const BASE_URL = "wss://ws.backpack.exchange/";
class SignalingManager {
    ws;
    static instance;
    bufferedMessage = [];
    callbacks = {};
    id;
    initialized = false;
    constructor(){
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessage = [];
        this.id = 1;
        this.init();
    }
    static getInstance() {
        if (!this.instance) this.instance = new SignalingManager();
        return this.instance;
    }
    init() {
        this.ws.onopen = ()=>{
            this.initialized = true;
            this.bufferedMessage.forEach((message)=>{
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessage = [];
        };
        this.ws.onmessage = (event)=>{
            const message = JSON.parse(event.data);
            const type = message.data.e;
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(({ callback })=>{
                    if (type === "ticker") {
                        const newTicker = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s
                        };
                        console.log(newTicker);
                        callback(newTicker);
                    }
                    if (type === "depth") {
                        const updateBids = message.data.b;
                        const updateAsks = message.data.a;
                        callback({
                            bids: updateBids,
                            asks: updateAsks
                        });
                    }
                });
            }
        };
    }
    sendMessage(message) {
        const messageToSend = {
            ...message,
            id: this.id++
        };
        if (!this.initialized) {
            this.bufferedMessage.push(messageToSend);
            return;
        }
        this.ws.send(JSON.stringify(messageToSend));
    }
    async registerCallback(type, callback, id) {
        this.callbacks[type] = this.callbacks[type] || [];
        this.callbacks[type].push({
            callback,
            id
        });
    }
    async deRegisterCallback(type, id) {
        if (this.callbacks[type]) {
            const index = this.callbacks[type].findIndex((callback)=>callback.id === id);
            if (index !== -1) this.callbacks[type].splice(index, 1);
        }
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/components/MarketBar.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "MarketBar": (()=>MarketBar)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$httpClients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/utils/httpClients.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$SignalingManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/utils/SignalingManager.ts [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
"use client";
;
;
;
const MarketBar = ({ market })=>{
    _s();
    const [ticker, setTicker] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "MarketBar.useEffect": ()=>{
            (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$httpClients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTicker"])(market).then(setTicker);
            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$SignalingManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SignalingManager"].getInstance().registerCallback("ticker", {
                "MarketBar.useEffect": (data)=>setTicker({
                        "MarketBar.useEffect": (prevTicker)=>({
                                firstPrice: data?.firstPrice ?? prevTicker?.firstPrice ?? '',
                                high: data?.high ?? prevTicker?.high ?? '',
                                lastPrice: data?.lastPrice ?? prevTicker?.lastPrice ?? '',
                                low: data?.low ?? prevTicker?.low ?? '',
                                priceChange: data?.priceChange ?? prevTicker?.priceChange ?? '',
                                priceChangePercent: data?.priceChangePercent ?? prevTicker?.priceChangePercent ?? '',
                                quoteVolume: data?.quoteVolume ?? prevTicker?.quoteVolume ?? '',
                                symbol: data?.symbol ?? prevTicker?.symbol ?? '',
                                trades: data?.trades ?? prevTicker?.trades ?? '',
                                volume: data?.volume ?? prevTicker?.volume ?? ''
                            })
                    }["MarketBar.useEffect"])
            }["MarketBar.useEffect"], `TICKER-${market}`);
            __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$SignalingManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SignalingManager"].getInstance().sendMessage({
                "method": "SUBSCRIBE",
                "params": [
                    `ticker.${market}`
                ]
            });
            return ({
                "MarketBar.useEffect": ()=>{
                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$SignalingManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SignalingManager"].getInstance().deRegisterCallback("ticker", `Ticker-${market}`);
                    __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$SignalingManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SignalingManager"].getInstance().sendMessage({
                        "method": "UNSUBSCRIBE",
                        "params": [
                            `Ticker-${market}`
                        ]
                    });
                }
            })["MarketBar.useEffect"];
        }
    }["MarketBar.useEffect"], [
        market
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "w-full border-b border-slate-800 overflow-x-auto",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center space-x-6 min-w-[768px] px-4 py-2",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tickerr, {
                    market: market
                }, void 0, false, {
                    fileName: "[project]/app/components/MarketBar.tsx",
                    lineNumber: 37,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col justify-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium text-green-500 tabular-nums text-md",
                            children: [
                                "$",
                                ticker?.lastPrice
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 41,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "font-medium text-s tabular-nums text-white",
                            children: [
                                "$",
                                ticker?.lastPrice
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 44,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/MarketBar.tsx",
                    lineNumber: 40,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col justify-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-400",
                            children: "24H Change"
                        }, void 0, false, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 51,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: `text-sm font-medium tabular-nums leading-5 ${Number(ticker?.priceChange) > 0 ? "text-green-500" : "text-red-500"}`,
                            children: [
                                Number(ticker?.priceChange) > 0 ? "+" : "",
                                ticker?.priceChange,
                                " (",
                                Number(ticker?.priceChangePercent)?.toFixed(2),
                                "%)"
                            ]
                        }, void 0, true, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 52,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/MarketBar.tsx",
                    lineNumber: 50,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col justify-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-400",
                            children: "24H High"
                        }, void 0, false, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 66,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium tabular-nums leading-5 text-white",
                            children: ticker?.high
                        }, void 0, false, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 67,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/MarketBar.tsx",
                    lineNumber: 65,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col justify-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-400",
                            children: "24H Low"
                        }, void 0, false, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 74,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium tabular-nums leading-5 text-white",
                            children: ticker?.low
                        }, void 0, false, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 75,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/MarketBar.tsx",
                    lineNumber: 73,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col justify-center",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm text-slate-400",
                            children: "24H Volume"
                        }, void 0, false, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 82,
                            columnNumber: 15
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                            className: "text-sm font-medium tabular-nums leading-5 text-white",
                            children: ticker?.volume
                        }, void 0, false, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 83,
                            columnNumber: 15
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/MarketBar.tsx",
                    lineNumber: 81,
                    columnNumber: 13
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/MarketBar.tsx",
            lineNumber: 35,
            columnNumber: 11
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/MarketBar.tsx",
        lineNumber: 34,
        columnNumber: 9
    }, this);
};
_s(MarketBar, "6u1Sg2X8CwFxVIj66rhEBRBMnpw=");
_c = MarketBar;
function Tickerr({ market }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex h-[60px] items-center space-x-4 px-2",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "relative flex items-center",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        alt: "Base Token Logo",
                        loading: "lazy",
                        className: "z-10 rounded-full h-6 w-6",
                        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVvBqZC_Q1TSYObZaMvK0DRFeHZDUtVMh08Q&s"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MarketBar.tsx",
                        lineNumber: 98,
                        columnNumber: 11
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        alt: "Quote Token Logo",
                        loading: "lazy",
                        className: "rounded-full h-6 w-6 -ml-2 border-2 border-gray-900",
                        src: "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTVvBqZC_Q1TSYObZaMvK0DRFeHZDUtVMh08Q&s"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MarketBar.tsx",
                        lineNumber: 104,
                        columnNumber: 11
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/MarketBar.tsx",
                lineNumber: 97,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                type: "button",
                className: "px-3 py-2 bg-slate-800 rounded-lg hover:bg-slate-700 transition duration-200",
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                    className: "font-medium text-white text-sm tracking-wide",
                    children: market.replace("_", " / ")
                }, void 0, false, {
                    fileName: "[project]/app/components/MarketBar.tsx",
                    lineNumber: 117,
                    columnNumber: 11
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/MarketBar.tsx",
                lineNumber: 113,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/MarketBar.tsx",
        lineNumber: 95,
        columnNumber: 7
    }, this);
}
_c1 = Tickerr;
var _c, _c1;
__turbopack_refresh__.register(_c, "MarketBar");
__turbopack_refresh__.register(_c1, "Tickerr");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/trade/[market]/page.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "default": (()=>Page)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$MarketBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/components/MarketBar.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/navigation.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
"use client";
;
;
function Page() {
    _s();
    const { market } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    console.log({
        market
    });
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-row flex-1",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex flex-col flex-1",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$MarketBar$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["MarketBar"], {
                        market: market
                    }, void 0, false, {
                        fileName: "[project]/app/trade/[market]/page.tsx",
                        lineNumber: 15,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        className: "flex flex-row h-[920px] border-y border-slate-800",
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col flex-1"
                            }, void 0, false, {
                                fileName: "[project]/app/trade/[market]/page.tsx",
                                lineNumber: 17,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                className: "flex flex-col w-[250px] overflow-hidden"
                            }, void 0, false, {
                                fileName: "[project]/app/trade/[market]/page.tsx",
                                lineNumber: 20,
                                columnNumber: 17
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/trade/[market]/page.tsx",
                        lineNumber: 16,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/trade/[market]/page.tsx",
                lineNumber: 14,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "flex flex-col w-[250px]"
                }, void 0, false, {
                    fileName: "[project]/app/trade/[market]/page.tsx",
                    lineNumber: 26,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/trade/[market]/page.tsx",
                lineNumber: 25,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/trade/[market]/page.tsx",
        lineNumber: 13,
        columnNumber: 12
    }, this);
}
_s(Page, "KHnBPKMJhNegA5PKOeZ6r1513Bc=", false, function() {
    return [
        __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"]
    ];
});
_c = Page;
var _c;
__turbopack_refresh__.register(_c, "Page");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/trade/[market]/page.tsx [app-rsc] (ecmascript, Next.js server component, client modules)": ((__turbopack_context__) => {

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, t: __turbopack_require_real__ } = __turbopack_context__;
{
}}),
}]);

//# sourceMappingURL=app_ef71b6._.js.map