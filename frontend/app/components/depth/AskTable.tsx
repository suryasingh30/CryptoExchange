export const AskTable = ({asks}: {asks: [string,string][]}) => {

    let currentotal = 0;
    const relevantAsk = asks.slice(0,15);
    // relevantAsk.reverse();

    let askWithTotal: [string, string, number][] = [];
    for(let i=0; i<relevantAsk.length; i++)
    {
        const [price, quantity] = relevantAsk[i];
        askWithTotal.push([price, quantity, currentotal+=Number(quantity)]);
    }
    const maxTotal = relevantAsk.reduce((acc, [_,quantity]) => acc + Number(quantity), 0);

    askWithTotal.reverse();

    return <div>
        {askWithTotal.map(([price, quantity, total]) => <Ask
            price={price}quantity={quantity} total={total} maxTotal={maxTotal} key={`${price}-${quantity}`}
        ></Ask>)}
    </div>
}

const Ask = ({price, quantity, total, maxTotal}: {price: string, quantity: string, total: number, maxTotal: number}) => {
    return <div
        style={{
            display: "flex",
            position: "relative",
            width: "100%",
            backgroundColor: "transparent",
            overflow: "hidden",
        }}>
        <div
            style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: `${(total * 100)/maxTotal}%`,
                height: "100%",
                background: "rgba(228,75,68,0.325)",
                transition: "width 0.3s ease-in-out"
            }}>
        </div>
        <div className="flex justify-between text-xs w-full">
            <div>
                {price}
            </div>
            <div>
                {quantity}
            </div>
            <div>
                {total?.toFixed(2)}
            </div>
        </div>
    </div>
} 