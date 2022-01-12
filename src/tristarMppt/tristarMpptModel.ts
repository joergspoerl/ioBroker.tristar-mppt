import { byteString, charge_states, ledState, resolveAlarmBitfield, resolveFaultsBitfield, round, signedToInteger, to32bitNumber } from "./tristarMpptUtil";

export interface TristarMetaEntry {
	descr: string,
	unit: string;
	role: ioBrokerRole;
	type: ioBroker.CommonType //'number' | 'string' | 'boolean' | 'array' | 'object' | 'mixed' | 'file'
	readFunc: (tristarModbusData: TristarModbusData) => TristarPropertyType;
	writeFunc?: (value: TristarPropertyType) => void;
	value: TristarPropertyType
}

export type TristarPropertyType = number | string | boolean | null; // entspricht ioBroker.StateValue
export type TristarHoldingRegisterArray = Array<number>

export type ioBrokerRole = "state" | "value.current" | "value.voltage" | "value" | "value.temperature"

export class TristarModbusData {
	hr : TristarHoldingRegisterArray;
	scale : TristarScale;
	config: ioBroker.AdapterConfig;

	constructor(hr: TristarHoldingRegisterArray, config: ioBroker.AdapterConfig) {
		this.hr = hr;
		this.scale = new TristarScale(hr);
		this.config = config;
	}
}

export class TristarScale {
	v : number;
	i : number;
	p : number;
	constructor(hr: TristarHoldingRegisterArray) {
		const V_PU_hi = hr[0];
		const V_PU_lo = hr[1];
		const I_PU_hi = hr[2];
		const I_PU_lo = hr[3];

		const V_PU = V_PU_hi + V_PU_lo / Math.pow(2, 16);
		const I_PU = I_PU_hi + I_PU_lo / Math.pow(2, 16);

		this.v = V_PU * Math.pow(2, -15);
		this.i = I_PU * Math.pow(2, -15);
		this.p = V_PU * I_PU * Math.pow(2, -17);

	}

}

export class TristarModel {


 	"adc.vb_f_med":    TristarMetaEntry = {
		descr: "Battery voltage, filtered",
		unit:  "V",
		role:  "value.voltage",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v, 2),
		value: 0,
	};

	// ------------------------------------------------------------------------------------------

	"temp.HS":    TristarMetaEntry = {
		descr: "Heatsink temperature C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[35],
		value: 0,
	};
	"temp.RTS":    TristarMetaEntry = {
		descr: "RTS temperature (0x80 = disconnect)  C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[36],
		value: 0,
	};
	"temp.BATT":    TristarMetaEntry = {
		descr: "Battery regulation temperature C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[37],
		value: 0,
	};

	// ------------------------------------------------------------------------------------------

	"batt.V":    TristarMetaEntry = {
		descr: "Battery voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v, 2),
		value: 0,
	};

	"batt.SensedV":    TristarMetaEntry = {
		descr: "Battery sensed voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[26]) * tmd.scale.v, 2),
		value: 0,
	};

	"batt.A":    TristarMetaEntry = {
		descr: "Battery charge current",
		role:  "value.current",
		unit:  "A",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[28]) * tmd.scale.i, 2),
		value: 0,
	};
	"batt.OutPower":    TristarMetaEntry = {
		descr: "Output power",
		role:  "value",
		unit:  "W",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[58]) * tmd.scale.p, 2),
		value: 0,
	};
	"batt.Vmin":    TristarMetaEntry = {
		descr: "Minimum battery voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[40]) * tmd.scale.v, 2),
		value: 0,
	};
	"batt.Vmax":    TristarMetaEntry = {
		descr: "Maximal battery voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[41]) * tmd.scale.v, 2),
		value: 0,
	};
	"batt.Vf1m":    TristarMetaEntry = {
		descr: "Battery voltage, filtered(τ ≈ 1min)",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[38]) * tmd.scale.v, 2),
		value: 0,
	};

	"batt.Af1m":    TristarMetaEntry = {
		descr: "Charging current, filtered(τ ≈ 1min)",
		role:  "value.current",
		unit:  "I",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[39]) * tmd.scale.i, 2),
		value: 0,
	};

	// ------------------------------------------------------------------------------------------

	"solar.V":    TristarMetaEntry = {
		descr: "Array voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[27]) * tmd.scale.v, 2),
		value: 0,
	};

	"solar.I":    TristarMetaEntry = {
		descr: "Array current",
		role:  "value.current",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[29]) * tmd.scale.i, 2),
		value: 0,
	};

	"solar.InPower":    TristarMetaEntry = {
		descr: "Input power",
		role:  "value",
		unit:  "W",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[59]) * tmd.scale.p, 0),
		value: 0,
	};

	"solar.InPowerPercent":    TristarMetaEntry = {
		descr: "Input power",
		role:  "value",
		unit:  "%",
		type: "number",
		readFunc:  (tmd: TristarModbusData) =>  round(tmd.config.installedWP / 100 * signedToInteger(tmd.hr[59]) * tmd.scale.p, 0),
		value: 0,
	};

	"state.charge":    TristarMetaEntry = {
		descr: "charge state",
		role:  "state",
		unit:  "",
		type: "string",
		readFunc:  (tmd: TristarModbusData) => charge_states[tmd.hr[50]],
		value: 0,
	};
	"state.hourmeter":    TristarMetaEntry = {
		descr: "hourmeter",
		role:  "state",
		unit:  "h",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => to32bitNumber(tmd.hr[42], tmd.hr[43]),
		value: 0,
	};


	"state.faults":    TristarMetaEntry = {
		descr: "all Controller faults bitfield",
		role:  "state",
		unit:  "",
		type: "array",
		readFunc:  (tmd: TristarModbusData) => JSON.stringify(resolveFaultsBitfield(tmd.hr[44])),
		value: 0,
	};


	"state.dip":    TristarMetaEntry = {
		descr: "all DIP switch positions bitfield",
		role:  "state",
		unit:  "",
		type: "string",
		readFunc:  (tmd: TristarModbusData) => byteString(tmd.hr[48]),
		value: 0,
	};

	"state.led":    TristarMetaEntry = {
		descr: "State of LED indications",
		role:  "state",
		unit:  "",
		type: "string",
		readFunc:  (tmd: TristarModbusData) => ledState[tmd.hr[49]] ,
		value: 0,
	};

	"state.alarm":    TristarMetaEntry = {
		descr: "State of LED indications",
		role:  "state",
		unit:  "",
		type: "array",
		readFunc:  (tmd: TristarModbusData) => JSON.stringify(resolveAlarmBitfield(to32bitNumber(tmd.hr[46],tmd.hr[47]))) ,
		value: 0,
	};


	"today.batt.Vmin":    TristarMetaEntry = {
		descr: "battery minimal voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[64]) * tmd.scale.v, 2),
		value: 0,
	};

	"today.batt.Vmax":    TristarMetaEntry = {
		descr: "battery maximal voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[65]) * tmd.scale.v, 2),
		value: 0,
	};
	"today.batt.Imax":    TristarMetaEntry = {
		descr: "battery maximal current",
		role:  "value.current",
		unit:  "A",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[65]) * tmd.scale.i, 2),
		value: 0,
	};
	"today.Ahc":    TristarMetaEntry = {
		descr: "Amper hours",
		role:  "state",
		unit:  "Ah",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[67] * 0.1,
		value: 0,
	};

	"today.Whc":    TristarMetaEntry = {
		descr: "watt hours",
		role:  "state",
		unit:  "Wh",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[68],
		value: 0,
	};

	"today.flags":    TristarMetaEntry = {
		descr: "flags",
		role:  "state",
		unit:  "",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[69],
		value: 0,
	};

	"today.batt.Pmax":    TristarMetaEntry = {
		descr: "maximal power output",
		role:  "value",
		unit:  "W",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[70]) * tmd.scale.p, 0),
		value: 0,
	};

	"today.batt.Tmin":    TristarMetaEntry = {
		descr: "minimal battery temperature",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[71],
		value: 0,
	};
	"today.batt.Tmax":    TristarMetaEntry = {
		descr: "maximal battery temperature",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[72],
		value: 0,
	};

	"today.fault":    TristarMetaEntry = {
		descr: "fault",
		role:  "state",
		unit:  "",
		type: "number",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[73],
		value: 0,
	};

	update(hr: TristarHoldingRegisterArray, config: ioBroker.AdapterConfig): void {
		const tmd = new TristarModbusData(hr, config);

		for (const [, value] of Object.entries(this)) {
			const v = value as TristarMetaEntry;
			if (typeof v.readFunc === "function" ) {
				v.value = v.readFunc(tmd)
			}
			// console.log("update - " + key + JSON.stringify(value))
		}
	}
}
