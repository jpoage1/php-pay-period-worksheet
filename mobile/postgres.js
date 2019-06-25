const { Pool, Client } = require('pg')

const pool = new Pool({
  user: 'mobile',
  host: '127.0.0.1',
  database: 'MobileApps',
  password: 's00p3r.s3cr37',
  port: 3211,
})

pool.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  pool.end()
})

const client = new Client({
  user: 'dbuser',
  host: 'database.server.com',
  database: 'mydb',
  password: 'secretpassword',
  port: 3211,
})
client.connect()

client.query('SELECT NOW()', (err, res) => {
  console.log(err, res)
  client.end()
})