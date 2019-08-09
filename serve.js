const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

https.createServer(
    {
        key: fs.readFileSync('encryption/private.key'),
        cert: fs.readFileSync('encryption/certificate.crt'),
    },
    app,
)
.listen(3001, console.err);