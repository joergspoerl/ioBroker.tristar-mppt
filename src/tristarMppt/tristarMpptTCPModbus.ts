// Tristar MODBUS

import { TristarHoldingRegisterArray, TristarModel, TristarWriteSingleHoldingRegister } from "./tristarMpptModel";

/* eslint-disable @typescript-eslint/no-var-requires */
// create a tcp modbus client
const modbus = require("jsmodbus");
const net = require("net");

export class TristarMpptTCPModbus {
	tristarData = new TristarModel();
	toSendQueue : Array<TristarWriteSingleHoldingRegister> = []

	async write(adapterConfig: ioBroker.AdapterConfig): Promise<void> {
		console.log("TristarMpptTCPModbus write", JSON.stringify(this.toSendQueue))

		this.connect(adapterConfig, async (client) => {
			while(this.toSendQueue.length > 0) {
				const item = this.toSendQueue.pop()
				const response = await client.writeSingleRegister(item?.register, item?.value)
				console.log("response writeSingleRegister", JSON.stringify(response))
			}
			// const tristarHoldingRegister = await client.readHoldingRegisters(88, 89)
			// console.log("read back:", tristarHoldingRegister)
		})
	}

	async read(adapterConfig: ioBroker.AdapterConfig): Promise<void> {
		console.log("TristarMpptTCPModbus read", JSON.stringify(this.toSendQueue))

		this.connect(adapterConfig, async (client) => {

			const tristarHoldingRegister = await client.readHoldingRegisters(0, 90)

			// transform in older format
			// const hr = { register: (tristarHoldingRegister.response as any)._body.valuesAsArray};
			const hr = (tristarHoldingRegister.response as any)._body.valuesAsArray as TristarHoldingRegisterArray

			await this.tristarData.update(hr, adapterConfig)
		})
	}

	async connect(adapterConfig: ioBroker.AdapterConfig, callback: (client: any) => Promise<void>): Promise<any> {
		const config = adapterConfig
		return new Promise<any> ( (resolve, reject) => {
			console.log("connect to host: ", config.hostname)
			console.log("connect to unitId: ", config.unitId)

			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const self = this;

			// create a modbus client
			const netSocket = new net.Socket()
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			const client = new modbus.client.TCP(netSocket, config.unitId);

			netSocket.connect( {
				"host": config.hostname, //192.168.1.32 TSMPPT10480676
				"port": config.port,
				// 'autoReconnect': true,
				// 'reconnectTimeout': 4000,
				// 'timeout': 8000,
			}
			)

			netSocket.on("connect", async function () {
				console.log("connected ...")

				// call modbus command
				try {
					console.log("before call ")
					await callback(client)
					console.log("after call ")
					netSocket.end();
					console.log("netSocket end ")
					resolve(self.tristarData);
					console.log("after resolve ")
				}

				catch (Exception)  {
					console.log("ERROR in callback", Exception)
					netSocket.end();
					reject(Exception);
				}


			});


			netSocket.on("error", function (err: any) {
				console.log(err);
				reject(err);

			})

		})

	}


}