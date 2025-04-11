import {Client} from 'pg';

const client = new Client({
    user: 'surya',
    host: 'localhost',
    database: 'my_database',
    password: 'babu',
    port: 5432
});

client.connnect();

async function refreshViews(){

    await client.query('REFRESH MATERIALIZED VIEW klines_1m');
    await client.query('REFRESH MATERIALIZED VIEW klines_1h');
    await client.query('REFRESH MATERIALIZED VIEW klines_1w');

    console.log("Materialized views refreshed successfully");
}

refreshViews().catch(console.error);

setInterval(() => {
    refreshViews()
}, 1000 * 10);