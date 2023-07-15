//inspiration https://www.voidcanvas.com/http2-server-push/

const http1 = require('http');
const fs = require('fs');
const mime = require("mime");
const path = require('path');
const http = require("http");
const url = require('url');

// return file descriptor and computed headers
function getFileAndHeaders(filePath) {
    filePath = path.join(__dirname, filePath)
    let fileDescriptor
    try {
        fileDescriptor = fs.openSync(filePath)
    } catch {
        console.log("Can't open file: " + filePath)
        return false
    }
    if (!fileDescriptor) {
        return false
    }
    const fileStat = fs.fstatSync(fileDescriptor)
    const headers = {
        "content-type": mime.getType(filePath),
        "content-length": fileStat.size,
        "last-modified": fileStat.mtime.toUTCString()
    }
    return {
        "descriptor": fileDescriptor,
        "headers": headers
    }
}

// Request handler
function onRequest(req, res) {

    // parse URL
    const parsedUrl = url.parse(req.url)

    if (parsedUrl.path === "/") {
        parsedUrl.pathname = "/index.html"
        parsedUrl.path = "/index.html"
        parsedUrl.href = "/index.html"
    }
    // extract URL path
    let pathname = `./public${parsedUrl.pathname}`;
    // based on the URL path, extract the file extension. e.g. .js, .doc, ...
    let ext = path.parse(pathname).ext;
    // maps file extension to MIME typere
    const map = {
        '.ico': 'image/x-icon',
        '.html': 'text/html',
        '.js': 'text/javascript',
        '.json': 'application/json',
        '.css': 'text/css',
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.wav': 'audio/wav',
        '.mp3': 'audio/mpeg',
        '.svg': 'image/svg+xml',
        '.pdf': 'application/pdf',
        '.doc': 'application/msword'
    };

    fs.exists(pathname, function (exist) {
        if (!exist) {
            // if the file is not found, return 404
            res.statusCode = 404;
            res.end(`File ${pathname} not found!`);
            return;
        }

        // if is a directory search for index file matching the extension
        if (fs.statSync(pathname).isDirectory()) pathname += 'index' + ext;

        // read file from file system
        fs.readFile(pathname, function (err, data) {
            if (err) {
                res.statusCode = 500;
                res.end(`Error getting the file: ${err}.`);
            } else {
                // if the file is found, set Content-type and send data
                res.setHeader('Content-type', map[ext] || 'text/plain');
                res.end(data);
            }
        });
    });
}

// http server
const server = http.createServer(onRequest);

server.on('error', (err) => console.error(err));

server.listen(8080)