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
        // readTristarOld(hr:any) {
        // 	// for all indexes, subtract 1 from what's in the manual
        // 	// scaling values
        // 	const V_PU_hi = hr.register[0];
        // 	const V_PU_lo = hr.register[1];
        // 	const I_PU_hi = hr.register[2];
        // 	const I_PU_lo = hr.register[3];
        // 	const V_PU = V_PU_hi + V_PU_lo / Math.pow(2, 16);
        // 	const I_PU = I_PU_hi + I_PU_lo / Math.pow(2, 16);
        // 	const v_scale = V_PU * Math.pow(2, -15);
        // 	const i_scale = I_PU * Math.pow(2, -15);
        // 	const p_scale = V_PU * I_PU * Math.pow(2, -17);
        // 	return {
        // 		scale: {
        // 			V_PU_hi: V_PU_hi,
        // 			V_PU_lo: V_PU_lo,
        // 			I_PU_hi: I_PU_hi,
        // 			I_PU_lo: I_PU_lo,
        // 			V_PU: V_PU,
        // 			v_scale: v_scale,
        // 			i_scale: i_scale,
        // 			p_scale: p_scale
        // 		},
        // 		adc: {
        // 			// Filtered ADC
        // 			adc_vb_f_med:    this.signedToInteger(hr.register[24]) * v_scale,
        // 			adc_vbterm_f:    hr.register[25] * v_scale,
        // 			adc_vbs_f:       hr.register[26] * v_scale,
        // 			adc_va_f:        hr.register[27] * v_scale,
        // 			adc_ib_f_shadow: hr.register[28] * v_scale,
        // 			adc_ia_f_shadow: hr.register[29] * v_scale,
        // 			adc_p12_f:       hr.register[30] * 18.612 * Math.pow(2, -15),
        // 			adc_p3_f:        hr.register[31] * 6.6 * Math.pow(2, -15),
        // 			adc_pmeter_f:    hr.register[32] * 18.612 * Math.pow(2, -15),
        // 			adc_p18_f:       hr.register[33] * 3 * Math.pow(2, -15),
        // 			adc_v_ref:       hr.register[34] * 3 * Math.pow(2, -15),
        // 		},
        // 		temp: {
        // 			// Temperatures
        // 			T_hs:   hr.register[35], // Heatsink temperature C √ -127 to + 127
        // 			T_rts:  hr.register[36], // RTS temperature (0x80 = disconnect)  C √ -127 to + 127
        // 			T_batt: hr.register[37], // Battery regulation temperature C √ -127 to + 127
        // 		},
        // 		state: {
        // 			// status
        // 			adc_vb_f_1m:  this.signedToInteger(hr.register[38]), // Battery voltage, filtered(τ ≈ 1min) V √ n·V_PU·2 - 15
        // 			adc_ib_f_1m:  this.signedToInteger(hr.register[39]), // Charging current, filtered(τ ≈       1min)    A √ n·I_PU·2 - 15
        // 			vb_min:       hr.register[40], // Minimum battery voltage V √ n·V_PU·2 - 15
        // 			vb_max:       hr.register[41], // Minimum battery voltage V √ n·V_PU·2 - 15
        // 			hourmeter_HI: hr.register[42], // hourmeter, HI word h -
        // 			hourmeter_LO: hr.register[43], // hourmeter, LO word h -
        // 			fault:        hr.register[44], // all Controller faults bitfield - -
        // 			alarm_HI:     hr.register[46], // alarm bitfield – HI word - -
        // 			alarm_LO:     hr.register[47], // alarm bitfield – LO word - -
        // 			dip:          hr.register[48], // all DIP switch positions bitfield - -
        // 			led:          hr.register[49], // State of LED indications - -
        // 		},
        // 		batt: {
        // 			// battery sense voltage, filtered
        // 			battsV:       this.signedToInteger(hr.register[24]) * v_scale,
        // 			battsSensedV: this.signedToInteger(hr.register[26]) * v_scale,
        // 			battsI:       this.signedToInteger(hr.register[28]) * i_scale,
        // 			arrayV:       this.signedToInteger(hr.register[27]) * v_scale,
        // 			arrayI:       this.signedToInteger(hr.register[29]) * i_scale,
        // 			statenum:     hr.register[50],
        // 			hsTemp:       hr.register[35],
        // 			rtsTemp:      hr.register[36],
        // 			outPower:     this.signedToInteger(hr.register[58]) * p_scale,
        // 			inPower:      this.signedToInteger(hr.register[59]) * p_scale,
        // 		},
        // 		today: {
        // 			// Logger – Today’s values
        // 			vb_min_daily:   hr.register[64] * v_scale,
        // 			vb_max_daily:   hr.register[65] * v_scale,
        // 			va_max_daily:   hr.register[66] * v_scale,
        // 			Ahc_daily:      hr.register[67] * 0.1,
        // 			whc_daily:      hr.register[68],
        // 			flags_daily:    hr.register[69],
        // 			Pout_max_daily: hr.register[70] * p_scale,
        // 			Tb_min_daily:   hr.register[71],
        // 			Tb_max_daily:   hr.register[72],
        // 			fault_daily:    hr.register[73],
        // 		}
        // 	}
        // 	// dipswitches = bin(rr.registers[48])[::-1][:-2].zfill(8)
        // 	//console.log("DATA", self.data)
        // }
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
                client.readHoldingRegisters(0, 80).then(function (tristarHoldingRegister) {
                    // transform in older format
                    // const hr = { register: (tristarHoldingRegister.response as any)._body.valuesAsArray};
                    const hr = tristarHoldingRegister.response._body.valuesAsArray;
                    self.tristarData.update(hr, config);
                    console.log("tristarMpptData: ", self.tristarData);
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