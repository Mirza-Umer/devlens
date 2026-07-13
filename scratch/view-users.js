const { Client } = require('pg');

const client = new Client({
  user: 'postgres',
  host: 'localhost',
  database: 'devlens-db',
  password: 'POSTGRES',
  port: 5432
});

async function main() {
  await client.connect();
  const res = await client.query('SELECT id, name, email, "ipAddress", city, country FROM "user"');
  console.log(res.rows);
  await client.end();
}

main().catch(console.error);
