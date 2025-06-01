const { createClient } = require('@supabase/supabase-js');
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

async function authRequired(req, res, next) {
  console.log("Recieved Header", req.headers); // Note: All header keys are converted to lowercase
  const { data, error } = await supabase.auth.getUser(req.headers["supabase_access_token"]); // Supabase returns error not err lol
  console.log("Supabase Response", data, error);
  if (error) {
    return res.status(401).json({
      "success": false,
      "error": error
    });
  }
  req.middleware_data = {
    "user_id": data["user"]["id"]
  };
  next();
}

module.exports = { authRequired }
