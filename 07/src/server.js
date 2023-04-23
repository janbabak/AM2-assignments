// tutorial on medium: https://medium.com/geekculture/understanding-server-sent-events-with-node-js-37cfc7aaa7b

const http = require("http");
const fs = require("fs");

const serverPort = 8080;
const data =
	"Lorem, ipsum dolor sit amet consectetur adipisicing elit. Ullam perspiciatis eius vitae, repellendus laudantium perferendis sit aliquid soluta, eveniet beatae mollitia iste dolorem cum odit quas. Tenetur omnis illum unde!".split(
		" "
	);
let nextChunkId = 0; // id of chunk, which will be send next

const requestListener = function (req, res) {
    //server sent event message
	if (req.url === "/sse") {
		res.statusCode = 200;
		res.setHeader("Cache-Control", "no-cache");
		res.setHeader("connection", "keep-alive");
		res.setHeader("Content-Type", "text/event-stream");

		let interval = setInterval(() => {
			//If all data has been sent, stop
			if (nextChunkId >= data.length) {
				clearInterval(interval)
			}
			res.write(`id: ${nextChunkId}\ndata: ${data[nextChunkId]}\n\n`);
			nextChunkId++;
		}, 2000);
	}   
    // return index.html
    else {
		fs.readFile("./index.html", function (err, data) {
			if (err) {
				res.statusCode = 500;
				res.end("Error getting index.html");
			} else {
				res.statusCode = 200;
				res.setHeader("Content-Type", "text/html");
				res.end(data);
			}
		});
	}
};

const server = http.createServer(requestListener);
server.listen(serverPort, () => {
	console.log(`Server running at http://localhost:${serverPort}/`);
});
