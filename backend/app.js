const express = require('express')
const app = express()
const port = 8000

app.get('/healthcheck', (req, res) => {
  res.send(`Backend is up! Server time is ${new Date().toString()}`)
})

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})