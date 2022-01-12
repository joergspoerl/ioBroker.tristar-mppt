"use strict";
/* eslint-disable @typescript-eslint/no-var-requires */
// create a tcp modbus client
const Modbus = require("jsmodbus");
const net = require("net");
const netSocket = new net.Socket();
const client = new Modbus.client.TCP(netSocket);
const options = {
    host: "192.168.10.109",
    port: 502
};
netSocket.on("connect", function () {
    client
        .readHoldingRegisters(0, 80)
        .then(function (resp) {
        console.log(resp.response._body);
        netSocket.end();
    })
        .catch(function () {
        console.error(
        // eslint-disable-next-line prefer-rest-params
        require("util").inspect(arguments, {
            depth: null
        }));
        netSocket.end();
    });
});
netSocket.on("error", console.error);
netSocket.connect(options);
//# sourceMappingURL=example.js.map