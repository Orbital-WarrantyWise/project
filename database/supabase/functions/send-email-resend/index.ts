import { createClient } from '@supabase/supabase-js'
import type { Database } from './database.types.ts'

console.log(`Function "send-email-resend" up and running!`)

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY')
if (!RESEND_API_KEY) throw new Error("RESEND_API_KEY is not defined")

const handler = async (_request: Request): Promise<Response> => {
  const supabaseClient = createClient<Database>(Deno.env.get('SUPABASE_URL') ?? '', Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '')
  const today = new Date()
  const todayDate = today.toISOString().substring(0, 10)
  today.setDate(today.getDate() + 7)
  const weekLater = today.toISOString().substring(0, 10)

  const { data, error } = await supabaseClient.from('warranties').select().gte('expiration_date', todayDate).lte('expiration_date', weekLater)
  if (error) throw error

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${RESEND_API_KEY}`,
    },
    body: JSON.stringify({
      from: 'onboarding@resend.dev',
      to: 'delivered@resend.dev',
      subject: 'hello world',
      html: '<strong>it works!</strong>',
    }),
  })

  const result = await res.json()

  return new Response(JSON.stringify(result), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

Deno.serve(handler)
