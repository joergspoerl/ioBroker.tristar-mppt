// Tristar MODBUS

/* eslint-disable @typescript-eslint/no-var-requires */
// create a tcp modbus client
const modbus = require("jsmodbus");
const net = require("net");

export class TristarMpptCon {
	data: any;
	hostname = ""

	unitId = 1;

	tristarHoldingRegister = {};

	// constructor(tristar_address: string) {
	// 	this.tristar_address = tristar_address
	// }


	async connectAndRequest(hostname: string): Promise<any> {

		return new Promise<any> ( (resolve, reject) => {
			this.hostname = hostname;
			console.log("connect to host: ", hostname)

			// eslint-disable-next-line @typescript-eslint/no-this-alias
			const self = this;

			// create a modbus client
			const netSocket = new net.Socket()
			const client = new modbus.client.TCP(netSocket, self.unitId);
			console.log("client: ", client)

			netSocket.connect( {
				"host": this.hostname, //192.168.1.32 TSMPPT10480676
				"port": 502,
				// 'autoReconnect': true,
				// 'reconnectTimeout': 4000,
				// 'timeout': 8000,
			}
			)

			netSocket.on("connect", function () {
				console.log("connected ...")
				client.readHoldingRegisters(0, 80).then(function (tristarHoldingRegister:any) {


					// transform in older format
					const hr = { register: (tristarHoldingRegister.response as any)._body.valuesAsArray};

					const values = self.readTristar(hr);
					self.data = values;

					console.log("tristarMpptData: ", self.data)
					netSocket.end();
					resolve(self.data);

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


	readTristar(hr:any) {

		// for all indexes, subtract 1 from what's in the manual

		// scaling values
		const V_PU_hi = hr.register[0];
		const V_PU_lo = hr.register[1];

		const V_PU = V_PU_hi + V_PU_lo / Math.pow(2, 16);

		const v_scale = V_PU * Math.pow(2, -15);

		return {



			adc: {
				// Filtered ADC
				adc_vb_f_med:    this.signedToInteger(hr.register[24]) * v_scale,
				adc_vbterm_f:    hr.register[25] * v_scale,
				adc_vbs_f:       hr.register[26] * v_scale,
				adc_va_f:        hr.register[27] * v_scale,
				adc_ib_f_shadow: hr.register[28] * v_scale,
				adc_ia_f_shadow: hr.register[29] * v_scale,
				adc_p12_f:       hr.register[30] * 18.612 * Math.pow(2, -15),
				adc_p3_f:        hr.register[31] * 6.6 * Math.pow(2, -15),
				adc_pmeter_f:    hr.register[32] * 18.612 * Math.pow(2, -15),
				adc_p18_f:       hr.register[33] * 3 * Math.pow(2, -15),
				adc_v_ref:       hr.register[34] * 3 * Math.pow(2, -15),
			},



		}
		// dipswitches = bin(rr.registers[48])[::-1][:-2].zfill(8)

		//console.log("DATA", self.data)
	}


	roundObj (obj: any): number {
		for(const i in obj) {
			if(obj.hasOwnProperty(i)){
				//console.log("-", obj[i])
				if (!isNaN(obj[i])) {
					obj[i] = Math.round(obj[i] * 100) / 100;
				}
				if (typeof obj[i] === "object") {
					this.roundObj(obj[i]);
				}
			}
		}
		return obj;
	}

	// helper function to convert signed value to integer
	signedToInteger(value: number): number {
		if ((value & 0x8000) > 0) {
			value = value - 0x10000;
		}
		return value;
	}

}