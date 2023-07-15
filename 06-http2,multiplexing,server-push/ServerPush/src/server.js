//inspiration https://www.voidcanvas.com/http2-server-push/

const http2 = require('http2');
const fs = require('fs');
const mime = require("mime");
const path = require('path');
const stream = require("stream");

const {HTTP2_HEADER_PATH} = http2.constants;

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

// server static file
function serveFile(filePath, stream) {
    const file = getFileAndHeaders(filePath)
    if (!file) {
        return false
    }
    stream.respondWithFD(file.descriptor, file.headers)
    stream.on("close", () => fs.closeSync(file.descriptor))
    stream.end();
}

// The files are pushed to stream here
function push(filePath, stream) {
    const file = getFileAndHeaders(filePath)
    if (!file) {
        return false;
    }
    stream.pushStream({":path": path}, (err, pushStream) => {
        if (err) {
            console.log(err)
        }
        pushStream.respondWithFD(file.descriptor, file.headers)
        stream.end()
    });
}

// Request handler
function onRequest(req, res) {
    const reqPath = req.path === '/' || !req.path ? '/index.html' : req.path;
    //
    // // Push with index.html
    if (reqPath === '/index.html') {
        push('/public/script.js', res.stream);
        push('/public/style.css', res.stream);
    } else {
        console.log("requiring non index.html")
    }

    if (!serveFile('/public' + reqPath, res.stream)) {
        res.statusCode = 404
    }
    res.end()
}

// creating a http2 server
const server = http2.createSecureServer({
    cert: fs.readFileSync(path.join(__dirname, '/certificate.crt')),
    key: fs.readFileSync(path.join(__dirname, '/privateKey.key'))
}, onRequest);


server.on('error', (err) => console.error(err));

server.listen(8443);