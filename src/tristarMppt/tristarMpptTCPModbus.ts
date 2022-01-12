// Tristar MODBUS

import { TristarHoldingRegisterArray, TristarModel } from "./tristarMpptModel";

/* eslint-disable @typescript-eslint/no-var-requires */
// create a tcp modbus client
const modbus = require("jsmodbus");
const net = require("net");

export class TristarMpptTCPModbus {
	tristarData = new TristarModel();


	async connectAndRequest(adapterConfig: ioBroker.AdapterConfig): Promise<any> {
		const config = adapterConfig
		return new Promise<any> ( (resolve, reject) => {
			console.log("connect to host: ", config.hostname)
			console.log("connect to unitId: ", config.unitId)

			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const self = this;

			// create a modbus client
			const netSocket = new net.Socket()
			const client = new modbus.client.TCP(netSocket, config.unitId);

			netSocket.connect( {
				"host": config.hostname, //192.168.1.32 TSMPPT10480676
				"port": config.port,
				// 'autoReconnect': true,
				// 'reconnectTimeout': 4000,
				// 'timeout': 8000,
			}
			)

			netSocket.on("connect", function () {
				console.log("connected ...")
				client.readHoldingRegisters(0, 90).then(function (tristarHoldingRegister:any) {

					// transform in older format
					// const hr = { register: (tristarHoldingRegister.response as any)._body.valuesAsArray};
					const hr = (tristarHoldingRegister.response as any)._body.valuesAsArray as TristarHoldingRegisterArray

					self.tristarData.update(hr, config)

					//console.log("tristarMpptData: ", self.tristarData)
					netSocket.end();
					resolve(self.tristarData);

				}).catch ((error: any) => {
					console.log("ERROR in readHoldingRegisters", error)
					netSocket.end();
					reject(error);
				});


			});


			netSocket.on("error", function (err: any) {
				console.log(err);
				reject(err);

			})

		})

	}


}