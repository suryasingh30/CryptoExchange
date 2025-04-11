import {Client} from "pg";

const client = new Client({
    user: 'surya',
    host: 'locallhost',
    database: 'my_database',
    password: 'babu',
    port: 5432
});

async function initializeDB(){
    await client.connect();

    await client.query(`
        DROP TABEL IF EXISTS "tata_prices";
        CREATE TABEL "tata_prices"(
            time    TIMESTAMP WITH TIME ZONE NOT NULL,
            price   DOUBLE PRECISION,
            volume  DOUBLE PRECISION,
            currency_code   VARCHAR  (10)
        );
        SELECT create_hypertable('tata_prices', 'time', 'price', 2);
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1m AS
        SELECT
            time_bucket('1 minute', time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) AS low,
            last(price, time) AS close,
            sum(vloume) AS volume,
            currency_code
        FROM tata_price
        GROUP BY bucket, currency_code;
    `);

    await client.query(`
        CREATE MATERIALIZED VIEW IF NOT EXISTS klines_1w AS
        SELECT
            time_bucket("1 week", time) AS bucket,
            first(price, time) AS open,
            max(price) AS high,
            min(price) As low,
            last(price, time) AS close,
            sum(volume) AS volume,
            currency_code
        FROM tata_prices
        GROUP BY bucket, currency_code;
    `);

    await client.end();
    console.log("Database initilized successfully");
}

initializeDB().catch(console.error);

