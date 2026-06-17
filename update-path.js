const { Client } = require('pg');
const client = new Client({ user: 'postgres', host: 'localhost', database: 'devlens-db', password: 'POSTGRES', port: 5432 });
client.connect().then(() => {
  return client.query("UPDATE project SET path = 'c:/Users/Work/devlens' WHERE id = 1");
}).then(() => {
  console.log('Updated');
  client.end();
}).catch(console.error);
