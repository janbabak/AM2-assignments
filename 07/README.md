# HW7 - Server sent events

## Server

I have created a basic server that performs two tasks. The first task involves providing the HTML of the client.

```javascript
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
```

The second task is the server sent event. The server sends the familiar 'lorem ipsum' text word by word, with a 2-second interval. To accomplish this, I had to set the appropriate headers, add data to the response, and end the response with a double new line `\n\n`.

```javascript
if (req.url === "/sse") {
	res.statusCode = 200;
	res.setHeader("Cache-Control", "no-cache");
	res.setHeader("connection", "keep-alive");
	res.setHeader("Content-Type", "text/event-stream");

	let interval = setInterval(() => {
		//If all data has been sent, stop
		if (nextChunkId >= data.length) {
			clearInterval(interval);
		}
		res.write(`id: ${nextChunkId}\ndata: ${data[nextChunkId]}\n\n`);
		nextChunkId++;
	}, 2000);
}
```

## Client

The client is an HTML web application that connects to the server and adds received messages to the data displayed on the screen. Below is the code responsible for managing incoming messages.

```javascript
message = document.getElementById("message");
receivedData = "";

const sseSource = new EventSource("/sse");

sseSource.onmessage = (event) => {
	receivedData += event.data + " ";
	message.textContent = receivedData;
};
```
### Screenshot

![screenshot](./results/screenshot.png)

### Video

![screenshot](./results/video.mov)
