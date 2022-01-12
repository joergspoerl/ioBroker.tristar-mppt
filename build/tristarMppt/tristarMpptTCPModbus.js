"use strict";
// Tristar MODBUS
Object.defineProperty(exports, "__esModule", { value: true });
exports.TristarMpptTCPModbus = void 0;
const tristarMpptModel_1 = require("./tristarMpptModel");
/* eslint-disable @typescript-eslint/no-var-requires */
// create a tcp modbus client
const modbus = require("jsmodbus");
const net = require("net");
class TristarMpptTCPModbus {
    constructor() {
        this.tristarData = new tristarMpptModel_1.TristarModel();
    }
    async connectAndRequest(adapterConfig) {
        const config = adapterConfig;
        return new Promise((resolve, reject) => {
            console.log("connect to host: ", config.hostname);
            console.log("connect to unitId: ", config.unitId);
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            // create a modbus client
            const netSocket = new net.Socket();
            const client = new modbus.client.TCP(netSocket, config.unitId);
            netSocket.connect({
                "host": config.hostname,
                "port": config.port,
                // 'autoReconnect': true,
                // 'reconnectTimeout': 4000,
                // 'timeout': 8000,
            });
            netSocket.on("connect", function () {
                console.log("connected ...");
                client.readHoldingRegisters(0, 90).then(function (tristarHoldingRegister) {
                    // transform in older format
                    // const hr = { register: (tristarHoldingRegister.response as any)._body.valuesAsArray};
                    const hr = tristarHoldingRegister.response._body.valuesAsArray;
                    self.tristarData.update(hr, config);
                    //console.log("tristarMpptData: ", self.tristarData)
                    netSocket.end();
                    resolve(self.tristarData);
                }).catch((error) => {
                    console.log("ERROR in readHoldingRegisters", error);
                    netSocket.end();
                    reject(error);
                });
            });
            netSocket.on("error", function (err) {
                console.log(err);
                reject(err);
            });
        });
    }
}
exports.TristarMpptTCPModbus = TristarMpptTCPModbus;
//# sourceMappingURL=tristarMpptTCPModbus.js.map