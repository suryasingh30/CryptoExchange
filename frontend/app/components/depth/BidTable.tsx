export const BidTable = ({bids}: {bids: [string, string][]}) => {
    let currentotal = 0;
    const releventBids = bids.slice(0,15);
    const bidsWithTotal: [string,string,number][] = releventBids.map(([price, quantity]) => [price, quantity, currentotal+=Number(quantity)]);
    const maxTotal = releventBids.reduce((acc, [_, quantity]) => acc + Number(quantity), 0);

    return <div>
        {bidsWithTotal.map(([price, quantity, total]) => <Bid
            price={price} quantity={quantity} total={total} maxTotal={maxTotal}
        >
        </Bid>) }
    </div>
}

const Bid = ({price, quantity, total, maxTotal} : {price: string, quantity: string, total: number, maxTotal:  number}) => {
    return (
        <div style={{
            display: "flex",
            position: "relative",
            width: "100%",
            background: "ttransport",
            overflow: "hidden"
        }}>
            <div
                style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${(100 * total) / maxTotal}%`,
                height: "100%",
                background: "rgba(1, 167, 129, 0.325)",
                transition: "width 0.3s ease-in-out",
                }}
            ></div>
            <div className={`flex justify-between text-xs w-full`}>
                <div>
                    {price}
                </div>
                <div>
                    {quantity}
                </div>
                <div>
                    {total.toFixed(2)}
                </div>
            </div>
        </div>
    )
}