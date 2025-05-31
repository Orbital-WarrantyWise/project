require('dotenv').config()

const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_ANON_KEY);

const express = require('express')
const cors = require('cors');
const app = express()
const port = 8000

app.use(cors({ origin: process.env.FRONTEND_BASE_URL })); // Prevent CORS errors
app.use(express.json()); // Ensure req recieved is in json

app.post("/warranty", async (req, res) => {
  console.log("Recieved Body", req.body);
  const { data, error } = await supabase.from("warranties").insert(req.body); // Supabase returns error not err lol
  console.log("Supabase Response", data, error);
  if (error) {
    return res.status(400).json({
      "success": false,
      "error": error
    });
  }
  res.status(200).json({
    "success": true
  })
});

app.get("/warranty", async (req, res) => {
  console.log("Recieved Body", req.body);
  const { data, error } = await supabase.from("warranties").select(); // Supabase returns error not err lol
  console.log("Supabase Response", data, error);
  if (error) {
    return res.status(400).json({
      "success": false,
      "error": error
    });
  }
  res.status(200).json({
    "success": true,
    "data": data
  })
});



app.get('/healthcheck', (req, res) => {
  res.json({
    "success": true,
    "message": `Backend is up! Server time is ${new Date().toString()}`
  })
})

app.listen(port, () => {
  console.log(`Backend listening on port ${port}`)
})