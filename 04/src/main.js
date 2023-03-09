let http = require("http");
let redis = require("redis");

const serverPort = 8080;
const redisPort = 6379;
const redisUrl = `redis://redis-server:${redisPort}`;

// redis client
let client = redis.createClient({ url: redisUrl });

client.connect();

client.on("connect", function () {
	console.log("Redis client connected");
});

client.on("error", function (err) {
	console.log("Something went wrong " + err);
});

//parse person name from url
function getPersonName(url) {
	url = url.slice(1);
	url = url.slice(url.indexOf("/") + 1);
	url = url.slice(0, url.indexOf("/"));
	return url;
}

// http server
const server = http.createServer((req, res) => {
	// res.end(`Hello ${req.url.slice(1)}\n`);

	// initialize the body to get the data asynchronously
	req.body = "";

	// get the data of the body
	req.on("data", (chunk) => {
		req.body += chunk;
	});

	//all data
	req.on("end", async () => {
		//get value from redis
		if ((id = req.url.match("^/person/.*/address$"))) {
			if (req.method == "GET") {
				const key = getPersonName(req.url);

				res.setHeader("Content-Type", "application/json");
				res.setHeader("Access-Control-Allow-Origin", "*");

				try {
					const value = await client.get(key);

					if (value === null) {
						res.statusCode = 404;
						res.end();
						return;
					}

					res.statusCode = 200;
					res.end(
						JSON.stringify({
							key: key,
							value: value,
						})
					);
				} catch (e) {
					console.log(e.message);
					res.statusCode = 500;
					res.end(e.message);
				}
			}
		}

		//save value to redis
		if ((id = req.url.match("^/person/.*/address$"))) {
			if (req.method == "OPTIONS") {
				res.writeHead(200, {
					"Access-Control-Allow-Origin": "*",
					"Access-Control-Allow-Methods": "POST",
					"Access-Control-Allow-Headers": "Content-Type",
				});
				res.end();
			} else if (req.method == "POST") {
				const key = getPersonName(req.url);
				const value = JSON.parse(req.body).address;

				res.setHeader("Content-Type", "application/json");
				res.setHeader("Access-Control-Allow-Origin", "*");

				try {
					await client.set(key, value, redis.print);

					res.statusCode = 201;
					res.end(
						JSON.stringify({
							key: key,
							value: value,
						})
					);
				} catch (e) {
					console.log("error while inserting: " + e);
					res.statusCode = 500;
					res.end(e);
				}
			}
		}
	});
});

server.listen(serverPort, function () {
	console.log(`Server running at http://localhost:${serverPort}/`);
});
