const http2 = require("http2");
const fs = require("fs");
const { HTTP2_HEADER_PATH } = http2.constants;

const serverPort = 8443;

const server = http2.createSecureServer({
	key: fs.readFileSync("localhost-privkey.pem"),
	cert: fs.readFileSync("localhost-cert.pem"),
});

server.on("error", (err) => console.error(err));

server.on("stream", (stream, headers) => {
	let url = headers[HTTP2_HEADER_PATH];
	console.log(url);

	// index.html
	if (url === "/" || url === "index.html") {
		const headers = {
			"content-type": "text/html",
			":status": 200,
		};
		stream.respondWithFile("index.html", headers);
	}

	// logo.png
	if (url === "/logo.png") {
		const headers = {
			"content-type": "image/png",
			":status": 200,
		};
		stream.respondWithFile("../images/logo.png", headers);
	}

    // style.css
	if (url === "/style.css") {
		const headers = {
			"content-type": "text/css",
			":status": 200,
		};
		stream.respondWithFile("style.css", headers);
	}

    // googleClient.js
	if (url === "/googleClient.js") {
		const headers = {
			"content-type": "application/javascript",
			":status": 200,
		};
		stream.respondWithFile("googleClient.js", headers);
	}

	// googleDriveFiles?code=.... or googleDriveFiles.html?code=....
	if (/google(\.html)?(\?code=.*)?/.test(url)) {
		const headers = {
			"content-type": "text/html",
			":status": 200,
		};
		stream.respondWithFile("googleDriveFiles.html", headers);
	}
});

server.listen(serverPort);
