const express = require('express');
const cors = require('cors');
const https = require('https');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.static('.'));

// Read token from env — set AIRTABLE_TOKEN in Railway dashboard
const envToken = process.env["AIRTABLE" + "_TOKEN"] || "";
const BASE_ID = 'appGaPVwbfe2f97Tx';
const P_TABLE = 'tbl9AkfH2fzOMsJmP';
const G_TABLE = 'tbl0yfD59tBOsbBRJ';

function fetchAll(table, res) {
  let all = [];
  function page(offset) {
    let url = `https://api.airtable.com/v0/${BASE_ID}/${table}?maxRecords=1000`;
    if (offset) url += `&offset=${offset}`;
    https.get(url, { headers: { 'Authorization': `Bearer ${envToken}` } }, (resp) => {
      let d = '';
      resp.on('data', c => d += c);
      resp.on('end', () => {
        try {
          const json = JSON.parse(d);
          all = all.concat(json.records || []);
          if (json.offset) page(json.offset);
          else res.json({ total: all.length, records: all });
        } catch(e) {
          res.status(500).json({ error: 'Parse failed' });
        }
      });
    }).on('error', e => res.status(500).json({ error: e.message }));
  }
  page(null);
}

app.get('/api/projectors', (req, res) => fetchAll(P_TABLE, res));
app.get('/api/grip', (req, res) => fetchAll(G_TABLE, res));
app.get('/api/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3000;
app.listen(PORT, '0.0.0.0', () => console.log(`LIGHTPREP on ${PORT}`));
