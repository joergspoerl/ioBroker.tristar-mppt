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
        this.sendHoldingRegisterQueue = [];
        this.sendCoilQueue = [];
    }
    async updateTristarData(hr, config) {
        const tmd = new tristarMpptModel_1.TristarModbusData(hr, config);
        this.tristarScale = tmd.scale;
        for (const [, value] of Object.entries(this.tristarData)) {
            const v = value;
            if (typeof v.readRegister === "function") {
                v.valueOld = v.value;
                v.value = v.readRegister(tmd);
            }
            // console.log("update - " + key + JSON.stringify(value))
        }
    }
    async writeHoldingRegister(adapterConfig) {
        // console.log("TristarMpptTCPModbus writeHoldingRegister " + JSON.stringify(this.sendHoldingRegisterQueue))
        await this.connect(adapterConfig, async (client) => {
            while (this.sendHoldingRegisterQueue.length > 0) {
                const item = this.sendHoldingRegisterQueue.pop();
                const response = await client.writeSingleRegister(item === null || item === void 0 ? void 0 : item.register, item === null || item === void 0 ? void 0 : item.value);
                console.log("response writeSingleRegister " + JSON.stringify(response));
            }
        });
    }
    async readHoldingRegister(adapterConfig) {
        // console.log("TristarMpptTCPModbus readHoldingRegister ***************")
        await this.connect(adapterConfig, async (client) => {
            const tristarHoldingRegister = await client.readHoldingRegisters(0, 90);
            // console.log("tristarHoldingRegister" + JSON.stringify(tristarHoldingRegister))
            // transform in older format
            // const hr = { register: (tristarHoldingRegister.response as any)._body.valuesAsArray};
            const hr = tristarHoldingRegister.response._body.valuesAsArray;
            await this.updateTristarData(hr, adapterConfig);
        });
    }
    async writeCoil(adapterConfig) {
        // console.log("TristarMpptTCPModbus writeCoil " + JSON.stringify(this.sendCoilQueue))
        await this.connect(adapterConfig, async (client) => {
            while (this.sendCoilQueue.length > 0) {
                const item = this.sendCoilQueue.pop();
                const response = await client.writeSingleCoil(item === null || item === void 0 ? void 0 : item.register, (item === null || item === void 0 ? void 0 : item.value) == 1 ? true : false);
                console.log("response writeCoil " + JSON.stringify(response));
            }
        });
    }
    async connect(adapterConfig, callback) {
        const config = adapterConfig;
        return new Promise((resolve, reject) => {
            console.log("connect to host: " + config.hostname);
            console.log("connect to unitId: " + config.unitId);
            // eslint-disable-next-line @typescript-eslint/no-this-alias
            const self = this;
            try {
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
                        await callback(client);
                        netSocket.end();
                        resolve(self.tristarData);
                    }
                    catch (Exception) {
                        console.log("ERROR in callback" + JSON.stringify(Exception));
                        netSocket.end();
                        reject(Exception);
                    }
                });
                netSocket.on("error", function (err) {
                    console.log("netSocket ERROR" + JSON.stringify(err));
                    reject(err);
                });
            }
            catch (Exception) {
                console.log("ERROR in connect" + JSON.stringify(Exception));
                reject(Exception);
            }
        });
    }
}
exports.TristarMpptTCPModbus = TristarMpptTCPModbus;
//# sourceMappingURL=tristarMpptTCPModbus.js.map