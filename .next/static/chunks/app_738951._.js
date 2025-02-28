(globalThis.TURBOPACK = globalThis.TURBOPACK || []).push(["static/chunks/app_738951._.js", {

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
const BASE_URL = "https://api.backpack.exchange/";
async function getTickers() {
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE_URL}/tickers`);
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
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE_URL}/depth?symbol=${market}`);
    return response.data;
}
async function getTrades(market) {
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE_URL}/trade?symbol=${market}`);
    return response.data;
}
async function getKlines(market, interval, startTime, endTime) {
    const response = await __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$axios$2f$lib$2f$axios$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["default"].get(`${BASE_URL}/klines?symbol=${market}&interval=${interval}&startTime=${startTime}&endTime=${endTime}`);
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
    bufferedMessages = [];
    callbacks = {};
    id;
    initialized = false;
    constructor(){
        this.ws = new WebSocket(BASE_URL);
        this.bufferedMessages = [];
        this.id = 1;
        this.init();
    }
    static getInstance() {
        if (!this.instance) {
            this.instance = new SignalingManager();
        }
        return this.instance;
    }
    init() {
        this.ws.onopen = ()=>{
            this.initialized = true;
            this.bufferedMessages.forEach((message)=>{
                this.ws.send(JSON.stringify(message));
            });
            this.bufferedMessages = [];
        };
        this.ws.onmessage = (event)=>{
            const message = JSON.parse(event.data);
            const type = message.data.e;
            if (this.callbacks[type]) {
                this.callbacks[type].forEach(({ callback })=>{
                    if (type == "ticker") {
                        const newTicker = {
                            lastPrice: message.data.c,
                            high: message.data.h,
                            low: message.data.l,
                            volume: message.data.v,
                            quoteVolume: message.data.V,
                            symbol: message.data.s
                        };
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
            this.bufferedMessages.push(messageToSend);
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
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "flex items-center flex-row relative w-full overflow-hidden border-b border-slate-800",
            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Tickerr, {
                        market: market
                    }, void 0, false, {
                        fileName: "[project]/app/components/MarketBar.tsx",
                        lineNumber: 36,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            "$",
                                            ticker?.lastPrice
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/MarketBar.tsx",
                                        lineNumber: 39,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            "$",
                                            ticker?.lastPrice
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/MarketBar.tsx",
                                        lineNumber: 40,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/MarketBar.tsx",
                                lineNumber: 38,
                                columnNumber: 21
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: "24H Change"
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/MarketBar.tsx",
                                        lineNumber: 43,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                        children: [
                                            Number(ticker?.priceChange) > 0 ? "+" : "",
                                            ticker?.priceChange,
                                            Number(ticker?.priceChangePercent)?.toFixed(2),
                                            "%"
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/MarketBar.tsx",
                                        lineNumber: 44,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "24H high"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/MarketBar.tsx",
                                                lineNumber: 46,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: ticker?.high
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/MarketBar.tsx",
                                                lineNumber: 47,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/MarketBar.tsx",
                                        lineNumber: 45,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "24H Low"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/MarketBar.tsx",
                                                lineNumber: 50,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: ticker?.low
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/MarketBar.tsx",
                                                lineNumber: 51,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/MarketBar.tsx",
                                        lineNumber: 49,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "24H Volume"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/MarketBar.tsx",
                                                    lineNumber: 55,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: ticker?.volume
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/MarketBar.tsx",
                                                    lineNumber: 56,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/MarketBar.tsx",
                                            lineNumber: 54,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/MarketBar.tsx",
                                        lineNumber: 53,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/MarketBar.tsx",
                                lineNumber: 42,
                                columnNumber: 21
                            }, this)
                        ]
                    }, void 0, true, {
                        fileName: "[project]/app/components/MarketBar.tsx",
                        lineNumber: 37,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/MarketBar.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, this)
        }, void 0, false, {
            fileName: "[project]/app/components/MarketBar.tsx",
            lineNumber: 34,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/MarketBar.tsx",
        lineNumber: 33,
        columnNumber: 12
    }, this);
};
_s(MarketBar, "6u1Sg2X8CwFxVIj66rhEBRBMnpw=");
_c = MarketBar;
function Tickerr({ market }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        alt: "SOL Logo",
                        loading: "lazy",
                        decoding: "async",
                        "data-nimg": "1",
                        className: "z-10 rounded-full h-6 w-6 mt-4 ouutline-baseBackgroundL1",
                        src: "/sol.webp"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MarketBar.tsx",
                        lineNumber: 69,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                        alt: "USDC Logo",
                        loading: "lazy",
                        decoding: "async",
                        "data-nigm": "1",
                        className: "h-6 w-6 -ml-2 mtt-4 rounded-full",
                        src: "/usdc.webpe"
                    }, void 0, false, {
                        fileName: "[project]/app/components/MarketBar.tsx",
                        lineNumber: 70,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/MarketBar.tsx",
                lineNumber: 68,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("button", {
                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                children: market.replace("_", " / ")
                            }, void 0, false, {
                                fileName: "[project]/app/components/MarketBar.tsx",
                                lineNumber: 76,
                                columnNumber: 25
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/MarketBar.tsx",
                            lineNumber: 75,
                            columnNumber: 21
                        }, this)
                    }, void 0, false, {
                        fileName: "[project]/app/components/MarketBar.tsx",
                        lineNumber: 74,
                        columnNumber: 17
                    }, this)
                }, void 0, false, {
                    fileName: "[project]/app/components/MarketBar.tsx",
                    lineNumber: 73,
                    columnNumber: 13
                }, this)
            }, void 0, false, {
                fileName: "[project]/app/components/MarketBar.tsx",
                lineNumber: 72,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/MarketBar.tsx",
        lineNumber: 67,
        columnNumber: 12
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
"[project]/app/utils/ChartManager.ts [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "ChartManager": (()=>ChartManager)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lightweight$2d$charts$2f$dist$2f$lightweight$2d$charts$2e$development$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/lightweight-charts/dist/lightweight-charts.development.mjs [app-client] (ecmascript)");
;
class ChartManager {
    candleSeries;
    lastUpdatTime = 0;
    chart;
    currentBar = {
        open: null,
        high: null,
        low: null,
        close: null
    };
    constructor(ref, initialData, layout){
        const chart = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lightweight$2d$charts$2f$dist$2f$lightweight$2d$charts$2e$development$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["createChart"])(ref, {
            autoSize: true,
            overlayPriceScales: {
                ticksVisible: true,
                borderVisible: true
            },
            crosshair: {
                mode: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lightweight$2d$charts$2f$dist$2f$lightweight$2d$charts$2e$development$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["CrosshairMode"].Normal
            },
            rightPriceScale: {
                visible: true,
                ticksVisible: true,
                entireTextOnly: true
            },
            grid: {
                horzLines: {
                    visible: false
                }
            },
            layout: {
                background: {
                    type: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$lightweight$2d$charts$2f$dist$2f$lightweight$2d$charts$2e$development$2e$mjs__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ColorType"].Solid,
                    color: layout.background
                },
                textColor: "white"
            }
        });
        this.chart = chart;
        this.candleSeries = chart.addCandlestickSeries();
        this.candleSeries.setData(initialData.map((data)=>({
                ...data,
                time: data.timestamp / 1000
            })));
    }
    update(updatePrice) {
        if (!this.lastUpdatTime) {
            this.lastUpdatTime = new Date().getTime();
        }
        this.candleSeries.update({
            time: this.lastUpdatTime / 1000,
            close: updatePrice.close,
            low: updatePrice.low,
            high: updatePrice.high,
            open: updatePrice.open
        });
        if (updatePrice.newCandleInitiated) {
            this.lastUpdatTime = updatePrice.time;
        }
    }
    destroy() {
        this.chart.remove();
    }
}
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/components/TradeView.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "TradeView": (()=>TradeView)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$ChartManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/utils/ChartManager.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$httpClients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/utils/httpClients.ts [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
;
;
;
function TradeView({ market }) {
    _s();
    const chartRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    const ChartManagerRef = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useRef"])(null);
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useEffect"])({
        "TradeView.useEffect": ()=>{
            const init = {
                "TradeView.useEffect.init": async ()=>{
                    let klineData = [];
                    try {
                        klineData = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$httpClients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getKlines"])(market, "1h", Math.floor((new Date().getTime() - 1000 * 60 * 60 * 24 * 7) / 1000), Math.floor(new Date().getTime() / 1000));
                    } catch (e) {}
                    if (chartRef) {
                        if (ChartManagerRef.current) {
                            chartRef.current, [
                                ...klineData?.map({
                                    "TradeView.useEffect.init": (x)=>({
                                            close: parseFloat(x.close),
                                            high: parseFloat(x.high),
                                            low: parseFloat(x.low),
                                            open: parseFloat(x.open),
                                            timestamp: new Date(x.end)
                                        })
                                }["TradeView.useEffect.init"])
                            ].sort({
                                "TradeView.useEffect.init": (x, y)=>x.timestamp < y.timestamp ? -1 : 1
                            }["TradeView.useEffect.init"]) || [], {
                                background: "#0e0f14",
                                color: "white"
                            };
                        }
                        ;
                        // @ts-ignore
                        ChartManagerRef.current = __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$ChartManager$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["ChartManager"];
                    }
                    ;
                }
            }["TradeView.useEffect.init"];
            init();
        }
    }["TradeView.useEffect"], [
        market
    ]);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Fragment"], {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            ref: chartRef,
            style: {
                height: "520px",
                width: "100%",
                marginTop: 4
            }
        }, void 0, false, {
            fileName: "[project]/app/components/TradeView.tsx",
            lineNumber: 44,
            columnNumber: 13
        }, this)
    }, void 0, false);
}
_s(TradeView, "LUcV1PVy/aSqmgT8tttRE1tChQ8=");
_c = TradeView;
var _c;
__turbopack_refresh__.register(_c, "TradeView");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/components/depth/BidTable.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "BidTable": (()=>BidTable)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const BidTable = ({ bids })=>{
    let currentotal = 0;
    const releventBids = bids.slice(0, 15);
    const bidsWithTotal = releventBids.map(([price, quantity])=>[
            price,
            quantity,
            currentotal += Number(quantity)
        ]);
    const maxTotal = releventBids.reduce((acc, [_, quantity])=>acc + Number(quantity), 0);
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: bidsWithTotal.map(([price, quantity, total])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Bid, {
                price: price,
                quantity: quantity,
                total: total,
                maxTotal: maxTotal
            }, void 0, false, {
                fileName: "[project]/app/components/depth/BidTable.tsx",
                lineNumber: 8,
                columnNumber: 58
            }, this))
    }, void 0, false, {
        fileName: "[project]/app/components/depth/BidTable.tsx",
        lineNumber: 7,
        columnNumber: 12
    }, this);
};
_c = BidTable;
const Bid = ({ price, quantity, total, maxTotal })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            position: "relative",
            width: "100%",
            background: "ttransport",
            overflow: "hidden"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${100 * total / maxTotal}%`,
                    height: "100%",
                    background: "rgba(1, 167, 129, 0.325)",
                    transition: "width 0.3s ease-in-out"
                }
            }, void 0, false, {
                fileName: "[project]/app/components/depth/BidTable.tsx",
                lineNumber: 24,
                columnNumber: 13
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: `flex justify-between text-xs w-full`,
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: price
                    }, void 0, false, {
                        fileName: "[project]/app/components/depth/BidTable.tsx",
                        lineNumber: 36,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: quantity
                    }, void 0, false, {
                        fileName: "[project]/app/components/depth/BidTable.tsx",
                        lineNumber: 39,
                        columnNumber: 17
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: total.toFixed(2)
                    }, void 0, false, {
                        fileName: "[project]/app/components/depth/BidTable.tsx",
                        lineNumber: 42,
                        columnNumber: 17
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/depth/BidTable.tsx",
                lineNumber: 35,
                columnNumber: 13
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/depth/BidTable.tsx",
        lineNumber: 17,
        columnNumber: 9
    }, this);
};
_c1 = Bid;
var _c, _c1;
__turbopack_refresh__.register(_c, "BidTable");
__turbopack_refresh__.register(_c1, "Bid");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/components/depth/AskTable.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "AskTable": (()=>AskTable)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
;
const AskTable = ({ asks })=>{
    let currentotal = 0;
    const relevantAsk = asks.slice(0, 15);
    // relevantAsk.reverse();
    let askWithTotal = [];
    for(let i = 0; i < relevantAsk.length; i++){
        const [price, quantity] = relevantAsk[i];
        askWithTotal.push([
            price,
            quantity,
            currentotal += Number(quantity)
        ]);
    }
    const maxTotal = relevantAsk.reduce((acc, [_, quantity])=>acc + Number(quantity), 0);
    askWithTotal.reverse();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: askWithTotal.map(([price, quanity, total])=>/*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(Ask, {
                price: price,
                quantity: quanity,
                total: total,
                maxTotal: maxTotal
            }, void 0, false, {
                fileName: "[project]/app/components/depth/AskTable.tsx",
                lineNumber: 18,
                columnNumber: 56
            }, this))
    }, void 0, false, {
        fileName: "[project]/app/components/depth/AskTable.tsx",
        lineNumber: 17,
        columnNumber: 12
    }, this);
};
_c = AskTable;
const Ask = ({ price, quantity, total, maxTotal })=>{
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        style: {
            display: "flex",
            position: "relative",
            width: "100%",
            backgroundColor: "transparent",
            overflow: "hidden"
        },
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                style: {
                    position: "absolute",
                    top: 0,
                    left: 0,
                    width: `${total * 100 / maxTotal}%`,
                    height: "100%",
                    background: "rgba(228,75,68,0.325)",
                    transition: "width 0.3s ease-in-out"
                }
            }, void 0, false, {
                fileName: "[project]/app/components/depth/AskTable.tsx",
                lineNumber: 33,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "flex justify-between text-xs w-full",
                children: [
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: price
                    }, void 0, false, {
                        fileName: "[project]/app/components/depth/AskTable.tsx",
                        lineNumber: 45,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: quantity
                    }, void 0, false, {
                        fileName: "[project]/app/components/depth/AskTable.tsx",
                        lineNumber: 48,
                        columnNumber: 13
                    }, this),
                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                        children: total?.toFixed(2)
                    }, void 0, false, {
                        fileName: "[project]/app/components/depth/AskTable.tsx",
                        lineNumber: 51,
                        columnNumber: 13
                    }, this)
                ]
            }, void 0, true, {
                fileName: "[project]/app/components/depth/AskTable.tsx",
                lineNumber: 44,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/depth/AskTable.tsx",
        lineNumber: 25,
        columnNumber: 12
    }, this);
};
_c1 = Ask;
var _c, _c1;
__turbopack_refresh__.register(_c, "AskTable");
__turbopack_refresh__.register(_c1, "Ask");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/components/depth/Depth.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "Depth": (()=>Depth)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$httpClients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/utils/httpClients.ts [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$depth$2f$BidTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/components/depth/BidTable.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$depth$2f$AskTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/components/depth/AskTable.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
;
;
;
;
const Depth = async ({ market })=>{
    _s();
    const [bids, setBids] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const [asks, setAsks] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const [price, setPrice] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])();
    const depth = await (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$httpClients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getDepth"])(market).then((d)=>{
        setBids(d.bids.reverse());
        setAsks(d.asks);
    });
    (0, __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$utils$2f$httpClients$2e$ts__$5b$app$2d$client$5d$__$28$ecmascript$29$__["getTicker"])(market).then((t)=>setPrice(t.lastPrice));
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(TableHeader, {}, void 0, false, {
                fileName: "[project]/app/components/depth/Depth.tsx",
                lineNumber: 19,
                columnNumber: 9
            }, this),
            asks && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$depth$2f$AskTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["AskTable"], {
                asks: asks
            }, void 0, false, {
                fileName: "[project]/app/components/depth/Depth.tsx",
                lineNumber: 20,
                columnNumber: 18
            }, this),
            price && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                children: price
            }, void 0, false, {
                fileName: "[project]/app/components/depth/Depth.tsx",
                lineNumber: 21,
                columnNumber: 19
            }, this),
            bids && /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$depth$2f$BidTable$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["BidTable"], {
                bids: bids
            }, void 0, false, {
                fileName: "[project]/app/components/depth/Depth.tsx",
                lineNumber: 22,
                columnNumber: 18
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/depth/Depth.tsx",
        lineNumber: 18,
        columnNumber: 12
    }, this);
};
_s(Depth, "eWtfB+0ydviXMqNmjXpfBPczGrs=");
_c = Depth;
function TableHeader() {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex justify-between tet-xs",
        children: [
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-white",
                children: "Price"
            }, void 0, false, {
                fileName: "[project]/app/components/depth/Depth.tsx",
                lineNumber: 28,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-slate-500",
                children: "Size"
            }, void 0, false, {
                fileName: "[project]/app/components/depth/Depth.tsx",
                lineNumber: 29,
                columnNumber: 9
            }, this),
            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                className: "text-slate-500",
                children: "Total"
            }, void 0, false, {
                fileName: "[project]/app/components/depth/Depth.tsx",
                lineNumber: 30,
                columnNumber: 9
            }, this)
        ]
    }, void 0, true, {
        fileName: "[project]/app/components/depth/Depth.tsx",
        lineNumber: 27,
        columnNumber: 12
    }, this);
}
_c1 = TableHeader;
var _c, _c1;
__turbopack_refresh__.register(_c, "Depth");
__turbopack_refresh__.register(_c1, "TableHeader");
if (typeof globalThis.$RefreshHelpers$ === 'object' && globalThis.$RefreshHelpers !== null) {
    __turbopack_refresh__.registerExports(module, globalThis.$RefreshHelpers$);
}
}}),
"[project]/app/components/SwapUI.tsx [app-client] (ecmascript)": ((__turbopack_context__) => {
"use strict";

var { r: __turbopack_require__, f: __turbopack_module_context__, i: __turbopack_import__, s: __turbopack_esm__, v: __turbopack_export_value__, n: __turbopack_export_namespace__, c: __turbopack_cache__, M: __turbopack_modules__, l: __turbopack_load__, j: __turbopack_dynamic__, P: __turbopack_resolve_absolute_path__, U: __turbopack_relative_url__, R: __turbopack_resolve_module_id_path__, b: __turbopack_worker_blob_url__, g: global, __dirname, k: __turbopack_refresh__, m: module, z: __turbopack_require_stub__ } = __turbopack_context__;
{
__turbopack_esm__({
    "SwapUI": (()=>SwapUI)
});
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/jsx-dev-runtime.js [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/node_modules/next/dist/compiled/react/index.js [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
;
function SwapUI({ market }) {
    _s();
    const [amount, setAmount] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("");
    const [activeTab, setActiveTab] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])('buy');
    const [type, setType] = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$index$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useState"])("limit");
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            className: "",
            children: [
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    className: "",
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(BuyButton, {
                            activeTab: activeTab,
                            setActiveTab: setActiveTab
                        }, void 0, false, {
                            fileName: "[project]/app/components/SwapUI.tsx",
                            lineNumber: 11,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(SellButton, {
                            activeTab: activeTab,
                            setActiveTab: setActiveTab
                        }, void 0, false, {
                            fileName: "[project]/app/components/SwapUI.tsx",
                            lineNumber: 12,
                            columnNumber: 17
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/SwapUI.tsx",
                    lineNumber: 10,
                    columnNumber: 13
                }, this),
                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                    children: [
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(LimitButton, {
                                        type: type,
                                        setType: setType
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SwapUI.tsx",
                                        lineNumber: 17,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(MarketButton, {
                                        type: type,
                                        setType: setType
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SwapUI.tsx",
                                        lineNumber: 18,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/SwapUI.tsx",
                                lineNumber: 16,
                                columnNumber: 21
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/SwapUI.tsx",
                            lineNumber: 15,
                            columnNumber: 17
                        }, this),
                        /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: [
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                            children: [
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "Available Balance"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/SwapUI.tsx",
                                                    lineNumber: 25,
                                                    columnNumber: 33
                                                }, this),
                                                /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                    children: "36.94 USDC"
                                                }, void 0, false, {
                                                    fileName: "[project]/app/components/SwapUI.tsx",
                                                    lineNumber: 26,
                                                    columnNumber: 33
                                                }, this)
                                            ]
                                        }, void 0, true, {
                                            fileName: "[project]/app/components/SwapUI.tsx",
                                            lineNumber: 24,
                                            columnNumber: 29
                                        }, this)
                                    }, void 0, false, {
                                        fileName: "[project]/app/components/SwapUI.tsx",
                                        lineNumber: 23,
                                        columnNumber: 25
                                    }, this),
                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                        children: [
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
                                                children: "Price"
                                            }, void 0, false, {
                                                fileName: "[project]/app/components/SwapUI.tsx",
                                                lineNumber: 30,
                                                columnNumber: 29
                                            }, this),
                                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                children: [
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("input", {}, void 0, false, {
                                                        fileName: "[project]/app/components/SwapUI.tsx",
                                                        lineNumber: 34,
                                                        columnNumber: 33
                                                    }, this),
                                                    /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                                            children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("img", {
                                                                src: "/usdc.webp",
                                                                className: "w-6 h-6"
                                                            }, void 0, false, {
                                                                fileName: "[project]/app/components/SwapUI.tsx",
                                                                lineNumber: 37,
                                                                columnNumber: 41
                                                            }, this)
                                                        }, void 0, false, {
                                                            fileName: "[project]/app/components/SwapUI.tsx",
                                                            lineNumber: 36,
                                                            columnNumber: 37
                                                        }, this)
                                                    }, void 0, false, {
                                                        fileName: "[project]/app/components/SwapUI.tsx",
                                                        lineNumber: 35,
                                                        columnNumber: 33
                                                    }, this)
                                                ]
                                            }, void 0, true, {
                                                fileName: "[project]/app/components/SwapUI.tsx",
                                                lineNumber: 33,
                                                columnNumber: 29
                                            }, this)
                                        ]
                                    }, void 0, true, {
                                        fileName: "[project]/app/components/SwapUI.tsx",
                                        lineNumber: 29,
                                        columnNumber: 25
                                    }, this)
                                ]
                            }, void 0, true, {
                                fileName: "[project]/app/components/SwapUI.tsx",
                                lineNumber: 22,
                                columnNumber: 21
                            }, this)
                        }, void 0, false, {
                            fileName: "[project]/app/components/SwapUI.tsx",
                            lineNumber: 21,
                            columnNumber: 17
                        }, this)
                    ]
                }, void 0, true, {
                    fileName: "[project]/app/components/SwapUI.tsx",
                    lineNumber: 14,
                    columnNumber: 13
                }, this)
            ]
        }, void 0, true, {
            fileName: "[project]/app/components/SwapUI.tsx",
            lineNumber: 9,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/SwapUI.tsx",
        lineNumber: 8,
        columnNumber: 12
    }, this);
}
_s(SwapUI, "noyoWeq85NooiarmvbACBTHl0Uw=");
_c = SwapUI;
function LimitButton({ type, setType }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "",
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "Limit"
        }, void 0, false, {
            fileName: "[project]/app/components/SwapUI.tsx",
            lineNumber: 51,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/SwapUI.tsx",
        lineNumber: 50,
        columnNumber: 12
    }, this);
}
_c1 = LimitButton;
function MarketButton({ type, setType }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-col cursor-pointer justify-center py-2",
        onClick: ()=>setType('market'),
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
            children: "Market"
        }, void 0, false, {
            fileName: "[project]/app/components/SwapUI.tsx",
            lineNumber: 59,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/SwapUI.tsx",
        lineNumber: 58,
        columnNumber: 12
    }, this);
}
_c2 = MarketButton;
function BuyButton({ activeTab, setActiveTab }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            children: "Buy"
        }, void 0, false, {
            fileName: "[project]/app/components/SwapUI.tsx",
            lineNumber: 67,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/SwapUI.tsx",
        lineNumber: 66,
        columnNumber: 12
    }, this);
}
_c3 = BuyButton;
function SellButton({ activeTab, setActiveTab }) {
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("p", {
            children: "Sell"
        }, void 0, false, {
            fileName: "[project]/app/components/SwapUI.tsx",
            lineNumber: 75,
            columnNumber: 9
        }, this)
    }, void 0, false, {
        fileName: "[project]/app/components/SwapUI.tsx",
        lineNumber: 74,
        columnNumber: 12
    }, this);
}
_c4 = SellButton;
var _c, _c1, _c2, _c3, _c4;
__turbopack_refresh__.register(_c, "SwapUI");
__turbopack_refresh__.register(_c1, "LimitButton");
__turbopack_refresh__.register(_c2, "MarketButton");
__turbopack_refresh__.register(_c3, "BuyButton");
__turbopack_refresh__.register(_c4, "SellButton");
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
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$TradeView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/components/TradeView.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$depth$2f$Depth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/components/depth/Depth.tsx [app-client] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SwapUI$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__ = __turbopack_import__("[project]/app/components/SwapUI.tsx [app-client] (ecmascript)");
;
var _s = __turbopack_refresh__.signature();
"use client";
;
;
;
;
;
function Page() {
    _s();
    const { market } = (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$navigation$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["useParams"])();
    return /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
        className: "flex flex-roow flex-1",
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
                        children: [
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$TradeView$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["TradeView"], {
                                    market: market
                                }, void 0, false, {
                                    fileName: "[project]/app/trade/[market]/page.tsx",
                                    lineNumber: 18,
                                    columnNumber: 21
                                }, this)
                            }, void 0, false, {
                                fileName: "[project]/app/trade/[market]/page.tsx",
                                lineNumber: 17,
                                columnNumber: 17
                            }, this),
                            /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])("div", {
                                children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$depth$2f$Depth$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["Depth"], {
                                    market: market
                                }, void 0, false, {
                                    fileName: "[project]/app/trade/[market]/page.tsx",
                                    lineNumber: 21,
                                    columnNumber: 21
                                }, this)
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
                    children: /*#__PURE__*/ (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$dist$2f$compiled$2f$react$2f$jsx$2d$dev$2d$runtime$2e$js__$5b$app$2d$client$5d$__$28$ecmascript$29$__["jsxDEV"])(__TURBOPACK__imported__module__$5b$project$5d2f$app$2f$components$2f$SwapUI$2e$tsx__$5b$app$2d$client$5d$__$28$ecmascript$29$__["SwapUI"], {
                        market: market
                    }, void 0, false, {
                        fileName: "[project]/app/trade/[market]/page.tsx",
                        lineNumber: 27,
                        columnNumber: 17
                    }, this)
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

//# sourceMappingURL=app_738951._.js.map