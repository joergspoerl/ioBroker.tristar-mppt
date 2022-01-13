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
        this.toSendQueue = [];
    }
    async write(adapterConfig) {
        console.log("TristarMpptTCPModbus write", JSON.stringify(this.toSendQueue));
        this.connect(adapterConfig, async (client) => {
            while (this.toSendQueue.length > 0) {
                const item = this.toSendQueue.pop();
                const response = await client.writeSingleRegister(item === null || item === void 0 ? void 0 : item.register, item === null || item === void 0 ? void 0 : item.value);
                console.log("response writeSingleRegister", JSON.stringify(response));
            }
            // const tristarHoldingRegister = await client.readHoldingRegisters(88, 89)
            // console.log("read back:", tristarHoldingRegister)
        });
    }
    async read(adapterConfig) {
        console.log("TristarMpptTCPModbus read", JSON.stringify(this.toSendQueue));
        this.connect(adapterConfig, async (client) => {
            const tristarHoldingRegister = await client.readHoldingRegisters(0, 90);
            // transform in older format
            // const hr = { register: (tristarHoldingRegister.response as any)._body.valuesAsArray};
            const hr = tristarHoldingRegister.response._body.valuesAsArray;
            await this.tristarData.update(hr, adapterConfig);
        });
    }
    async connect(adapterConfig, callback) {
        const config = adapterConfig;
        return new Promise((resolve, reject) => {
            console.log("connect to host: ", config.hostname);
            console.log("connect to unitId: ", config.unitId);
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            // create a modbus client
            const netSocket = new net.Socket();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
            const client = new modbus.client.TCP(netSocket, config.unitId);
            netSocket.connect({
                "host": config.hostname,
                "port": config.port,
                // 'autoReconnect': true,
                // 'reconnectTimeout': 4000,
                // 'timeout': 8000,
            });
            netSocket.on("connect", async function () {
                console.log("connected ...");
                // call modbus command
                try {
                    console.log("before call ");
                    await callback(client);
                    console.log("after call ");
                    netSocket.end();
                    console.log("netSocket end ");
                    resolve(self.tristarData);
                    console.log("after resolve ");
                }
                catch (Exception) {
                    console.log("ERROR in callback", Exception);
                    netSocket.end();
                    reject(Exception);
                }
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