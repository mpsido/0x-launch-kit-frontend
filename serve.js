const express = require('express');
const path = require('path');
const fs = require('fs');
const https = require('https');
const app = express();

app.use(express.static(path.join(__dirname, 'build')));

app.get('/', function(req, res) {
  res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

console.log("REACT_APP_RELAYER_URL:", process.env.REACT_APP_RELAYER_URL);
console.log("REACT_APP_DEFAULT_BASE_PATH:", process.env.REACT_APP_DEFAULT_BASE_PATH);
console.log("REACT_APP_THEME_NAME:", process.env.REACT_APP_THEME_NAME);
console.log("REACT_APP_NETWORK_ID:", process.env.REACT_APP_NETWORK_ID);
https.createServer(
    {
        key: fs.readFileSync('encryption/private.key'),
        cert: fs.readFileSync('encryption/certificate.crt'),
    },
    app,
)
.listen(3001, console.err);