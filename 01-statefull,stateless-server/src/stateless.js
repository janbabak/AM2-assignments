let net = require('net');

//database
let orders = {}
let idGenerator = 0;

//no state

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
                orders[idGenerator] = {
                    items: [],
                    state: 'opened'
                }
                c.write(`opened order ${idGenerator}\r\n`)
                idGenerator++
                break
            case 'add':
                if (data[1] === undefined || data[1] === null) {
                    c.write('provide order id\r\n')
                    break
                }
                if (!orders[data[1]]) {
                    c.write(`order ${data[1]} not exists\r\n`)
                    break
                }
                if (orders[data[1]].state !== 'opened') {
                    c.write(`order ${data[1]} is not opened\r\n`)
                    break
                }
                if (!data[2]) {
                    c.write("missing item name\r\n")
                    break;
                }
                orders[data[1]].items.push(data[2])
                c.write(`added ${data[2]} to order ${data[1]}\r\n`)
                break
            case 'process':
                if (data[1] === undefined || data[1] === null) {
                    c.write('provide order id\r\n')
                    break
                }
                if (!orders[data[1]]) {
                    c.write(`order ${data[1]} not exists\r\n`)
                    break
                }
                if (orders[data[1]].state !== 'opened') {
                    c.write(`order ${data[1]} is not opened\r\n`)
                    break
                }
                orders[data[1]].state = 'processed'
                c.write(`processed order ${data[1]}\r\n`)
                break
            default:
                c.write('unknown command\r\n')
        }
    });
});

server.listen(8124, function () { // start server (port 8124)
    console.log('server started');
});