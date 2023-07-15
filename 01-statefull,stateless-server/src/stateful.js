let net = require('net');

//database
let orders = {}
let idGenerator = 0;

//state
let activeOrderId = null

const server = net.createServer(function (c) {

    console.log('socket opened');

    c.setEncoding('utf8');

    c.on('end', function () {
        console.log('connection/socket closed');
    });

    c.on('data', function (data) {
        data = data.trim().split(" ");

        switch (data[0]) {
            case 'open':
                if (activeOrderId != null) {
                    c.write(`before opening new order, process ${activeOrderId}\r\n`)
                    break;
                }
                activeOrderId = idGenerator
                idGenerator++
                orders[activeOrderId] = []
                c.write(`opened order ${activeOrderId}\r\n`)
                break
            case 'add':
                if (activeOrderId == null) {
                    c.write('order not opened\r\n')
                    break
                }
                if (!data[1]) {
                    c.write("missing item name\r\n")
                    break;
                }
                orders[activeOrderId].push(data[1])
                c.write(`added ${data[1]} to order ${activeOrderId}\r\n`)
                break
            case 'process':
                if (activeOrderId == null) {
                    c.write('order not opened\r\n')
                    break
                }
                c.write(`processed order ${activeOrderId}\r\n`)
                activeOrderId = null;
                break
            default:
                c.write('unknown command\n')
        }
    });
});

server.listen(8124, function () { // start server (port 8124)
    console.log('server started');
});