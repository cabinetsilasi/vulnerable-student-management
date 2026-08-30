const fs = require('fs');
const path = require('path');

function loadEnv() {
  const envPaths = [
    path.join(__dirname, '../.env.local'),
    path.join(__dirname, '../.env')
  ];
  for (const envPath of envPaths) {
    if (fs.existsSync(envPath)) {
      const content = fs.readFileSync(envPath, 'utf8');
      content.split('\n').forEach(line => {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const parts = trimmed.split('=');
          const key = parts[0].trim();
          let val = parts.slice(1).join('=').trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
            val = val.slice(1, -1);
          }
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      });
    }
  }
}

loadEnv();

async function syncSchema() {
  const token = process.env.SUPABASE_ACCESS_TOKEN;
  const projectUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";

  let projectRef = "cnoivurnmmjrpzdtomkm";
  if (projectUrl.includes(".supabase.co")) {
    const match = projectUrl.match(/https:\/\/([^.]+)\.supabase\.co/);
    if (match && match[1]) projectRef = match[1];
  }

  if (!token || token.includes("your-token")) {
    console.error("❌ SUPABASE_ACCESS_TOKEN nu este definit în .env.local.");
    process.exit(1);
  }

  const sql = fs.readFileSync(path.join(__dirname, '../schema.sql'), 'utf8');

  console.log(`Se transmite schema.sql către Supabase Management API (proiect: ${projectRef})...`);

  const endpoints = [
    `https://api.supabase.com/v1/projects/${projectRef}/database/query`,
    `https://api.supabase.com/v1/projects/${projectRef}/sql`
  ];

  for (const url of endpoints) {
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ query: sql })
      });

      const data = await res.json();
      if (res.ok) {
        console.log("🎉 SCHEMA A FOST EXECUTATĂ ȘI SINCRONIZATĂ CU SUCCES ÎN SUPABASE!");
        return;
      } else {
        console.log(`Endpoint ${url} response:`, data);
      }
    } catch (err) {
      console.error("Error connecting to endpoint:", err);
    }
  }
}

syncSchema();
