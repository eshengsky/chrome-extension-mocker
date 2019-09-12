const http = require('http');
const fs = require('fs');
const path = require('path');
http.createServer((req, res) => {
    if (req.url === '/example/index1.html') {
        res.setHeader('content-type', 'text/html; charset=utf-8');
        fs.createReadStream(path.resolve(__dirname, './index1.html')).pipe(res);
    } else if (req.url === '/example/index2.html') {
        res.setHeader('content-type', 'text/html; charset=utf-8');
        fs.createReadStream(path.resolve(__dirname, './index2.html')).pipe(res);
    } else if (req.url.startsWith('/dist')) {
        res.setHeader('content-type', 'application/javascript; charset=utf-8');
        fs.createReadStream(path.resolve(__dirname, `..${req.url}`)).pipe(res);
    } else {
        res.end();
    }
}).listen(8369);
console.log('Demo page url: http://localhost:8369/example/index1.html');
