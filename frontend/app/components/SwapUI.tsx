import { useState } from "react";

export function SwapUI({market}:{market: string}){
    const [amount, setAmount] = useState("");
    const [activeTab, setActiveTab] = useState('buy');
    const [type, setType] = useState("limit");

    return <div>
        <div className="">
            <div className="">
                <BuyButton activeTab={activeTab} setActiveTab={setActiveTab}/>
                <SellButton activeTab={activeTab} setActiveTab={setActiveTab}/>
            </div>
            <div>
                <div>
                    <div>
                        <LimitButton type={type} setType={setType}/>
                        <MarketButton type={type} setType={setType}/>
                    </div>
                </div>
                <div>
                    <div>
                        <div>
                            <div>
                                <p>Available Balance</p>
                                <p>36.94 USDC</p>
                            </div>
                        </div>
                        <div>
                            <p>
                                Price
                            </p>
                            <div>
                                <input/>
                                <div>
                                    <div>
                                        <img src="/usdc.webp" className="w-6 h-6"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
}

function LimitButton({type,setType}: {type: string, setType: any}){
    return <div className="">
        <div>
            Limit
        </div>
    </div>
}

function MarketButton({type, setType}: {type: string, setType: any}){
    return <div className="flex flex-col cursor-pointer justify-center py-2" onClick={()=>setType('market')}>
        <div>
            Market
        </div>
    </div>
}

function BuyButton({activeTab, setActiveTab}:{activeTab: string, setActiveTab: any}){
    return <div>
        <p>
            Buy
        </p>
    </div>
}

function SellButton({activeTab, setActiveTab}:{activeTab: string, setActiveTab: any}){
    return <div>
        <p>
            Sell
        </p>
    </div>
}