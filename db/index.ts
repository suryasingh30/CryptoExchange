import {Client} from 'pg';
import { createClient } from 'redis';
import { DbMessage } from './types';

const  pgClient = new Client({
    user:'surya',
    host: 'localhost',
    database: 'my_database',
    password: 'babu',
    port: 5432
});
pgClient.connect();

async function main(){
    const redisClient = createClient();
    await redisClient.connect();
    console.log("connected to redis");

    while(true){
        const response = await redisClient.rPop("db_processor" as string)

        if(!response){

        }
        else{
            const data: DbMessage = JSON.parse(response);
            if(data.type === "TRADE_ADDED"){
                console.log("adding data");
                console.log(data);
                const price = data.data.price;
                const timestamp = new Date(data.data.timestamp);
                const query = 'INSERT INTO tata_price (time,price) VALUES ($1,$2)';
                const volume = data.data.quoteQuantity;
                const values = [timestamp, price];
                await pgClient.query(query, values);
            }
        }
    }
}

main();