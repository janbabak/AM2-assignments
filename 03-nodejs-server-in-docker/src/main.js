let http = require('http');

const port = 8080;

const server = http.createServer((req, res) => {
    res.end(`Hello ${req.url.slice(1)}\n`);
});

server.listen(port, function () {
    console.log(`Server running at http://localhost:${port}/`);
});

