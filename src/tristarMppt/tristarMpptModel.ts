import { byteString, charge_states, ledState, resolveAlarmBitfield, resolveFaultsBitfield, round, signedToInteger, to32bitNumber } from "./tristarMpptUtil";

export interface TristarDataEntry {
	descr: string,
	unit: string;
	role: ioBrokerRole;
	type: ioBroker.CommonType //'number' | 'string' | 'boolean' | 'array' | 'object' | 'mixed' | 'file'
	readRegister?: (tristarModbusData: TristarModbusData) => TristarPropertyType;
	writeRegister?: (twd: TristarWriteData) => TristarWriteSingleHoldingRegister;
	writeCoil?: (twd: TristarWriteData) => TristarWriteSingleCoil
	value: TristarPropertyType;
	valueOld?: TristarPropertyType;
}

export type TristarPropertyType = number | string | boolean | null; // entspricht ioBroker.StateValue
export type TristarHoldingRegisterArray = Array<number>

export interface TristarWriteData  {
	value: TristarPropertyType,
	scale: TristarScale

}
export interface TristarWriteSingleHoldingRegister {
	register: number;
	value: number
}

export interface TristarWriteSingleCoil {
	register: number;
	value: number
}
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
	[key: string]: TristarDataEntry

 	"adc.vb_f_med":    TristarDataEntry = {
		descr: "Battery voltage, filtered",
		unit:  "V",
		role:  "value.voltage",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v, 2),
		value: 0,
	};

	// ------------------------------------------------------------------------------------------

	"temp.HS":    TristarDataEntry = {
		descr: "Heatsink temperature C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[35],
		value: 0,
	};
	"temp.RTS":    TristarDataEntry = {
		descr: "RTS temperature (0x80 = disconnect)  C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[36],
		value: 0,
	};
	"temp.BATT":    TristarDataEntry = {
		descr: "Battery regulation temperature C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[37],
		value: 0,
	};

	// ------------------------------------------------------------------------------------------

	"batt.V":    TristarDataEntry = {
		descr: "Battery voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v, 2),
		value: 0,
	};

	"batt.SensedV":    TristarDataEntry = {
		descr: "Battery sensed voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[26]) * tmd.scale.v, 1),
		value: 0,
	};

	"batt.A":    TristarDataEntry = {
		descr: "Battery charge current",
		role:  "value.current",
		unit:  "A",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[28]) * tmd.scale.i, 2),
		value: 0,
	};
	"batt.OutPower":    TristarDataEntry = {
		descr: "Output power",
		role:  "value",
		unit:  "W",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[58]) * tmd.scale.p, 2),
		value: 0,
	};
	"batt.Vmin":    TristarDataEntry = {
		descr: "Minimum battery voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[40]) * tmd.scale.v, 2),
		value: 0,
	};
	"batt.Vmax":    TristarDataEntry = {
		descr: "Maximal battery voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[41]) * tmd.scale.v, 2),
		value: 0,
	};
	"batt.Vf1m":    TristarDataEntry = {
		descr: "Battery voltage, filtered(τ ≈ 1min)",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[38]) * tmd.scale.v, 2),
		value: 0,
	};

	"batt.Af1m":    TristarDataEntry = {
		descr: "Charging current, filtered(τ ≈ 1min)",
		role:  "value.current",
		unit:  "I",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[39]) * tmd.scale.i, 2),
		value: 0,
	};
	"batt.Vtarget":    TristarDataEntry = {
		descr: "Voltage to which the battery will be charged at any given time. This value changes with each chargestage and is temperature compensated",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[51]) * tmd.scale.v, 2),
		value: 0,
	};

	// ------------------------------------------------------------------------------------------

	"solar.V":    TristarDataEntry = {
		descr: "Array voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[27]) * tmd.scale.v, 2),
		value: 0,
	};

	"solar.I":    TristarDataEntry = {
		descr: "Array current",
		role:  "value.current",
		unit:  "A",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[29]) * tmd.scale.i, 2),
		value: 0,
	};

	"solar.InPower":    TristarDataEntry = {
		descr: "Input power",
		role:  "value",
		unit:  "W",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[59]) * tmd.scale.p, 0),
		value: 0,
	};

	"solar.InPowerPercent":    TristarDataEntry = {
		descr: "Input power percent of watt peak",
		role:  "value",
		unit:  "%",
		type: "number",
		readRegister:  (tmd: TristarModbusData) =>  round( signedToInteger(tmd.hr[59]) * tmd.scale.p / (tmd.config.installedWP / 100), 1),
		value: 0,
	};

	"state.charge":    TristarDataEntry = {
		descr: "charge state",
		role:  "state",
		unit:  "",
		type: "string",
		readRegister:  (tmd: TristarModbusData) => charge_states[tmd.hr[50]],
		value: 0,
	};
	"state.hourmeter":    TristarDataEntry = {
		descr: "hourmeter",
		role:  "state",
		unit:  "h",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => to32bitNumber(tmd.hr[42], tmd.hr[43]),
		value: 0,
	};
	"state.kWhTotal":    TristarDataEntry = {
		descr: "Reports total solar kilowatt-hours",
		role:  "state",
		unit:  "kWh",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[57],
		value: 0,
	};

	"state.kWhResetable":    TristarDataEntry = {
		descr: "Reports total solar kilowatt-hours since last ah/kWh reset",
		role:  "state",
		unit:  "kWh",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[56],
		value: 0,
	};

	"state.faults":    TristarDataEntry = {
		descr: "all Controller faults bitfield",
		role:  "state",
		unit:  "",
		type: "array",
		readRegister:  (tmd: TristarModbusData) => JSON.stringify(resolveFaultsBitfield(tmd.hr[44])),
		value: 0,
	};


	"state.dip":    TristarDataEntry = {
		descr: "all DIP switch positions bitfield",
		role:  "state",
		unit:  "",
		type: "string",
		readRegister:  (tmd: TristarModbusData) => byteString(tmd.hr[48]),
		value: 0,
	};

	"state.led":    TristarDataEntry = {
		descr: "State of LED indications",
		role:  "state",
		unit:  "",
		type: "string",
		readRegister:  (tmd: TristarModbusData) =>tmd.hr[49],
		value: 0,
	};

	"state.ledText":    TristarDataEntry = {
		descr: "State of LED indications",
		role:  "state",
		unit:  "",
		type: "string",
		readRegister:  (tmd: TristarModbusData) => ledState[tmd.hr[49]] ,
		value: 0,
	};

	"state.alarm":    TristarDataEntry = {
		descr: "State of LED indications",
		role:  "state",
		unit:  "",
		type: "array",
		readRegister:  (tmd: TristarModbusData) => JSON.stringify(resolveAlarmBitfield(to32bitNumber(tmd.hr[46],tmd.hr[47]))) ,
		value: 0,
	};


	"today.batt.Vmin":    TristarDataEntry = {
		descr: "battery minimal voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[64]) * tmd.scale.v, 2),
		value: 0,
	};

	"today.batt.Vmax":    TristarDataEntry = {
		descr: "battery maximal voltage",
		role:  "value.voltage",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[65]) * tmd.scale.v, 2),
		value: 0,
	};
	"today.batt.Imax":    TristarDataEntry = {
		descr: "battery maximal current",
		role:  "value.current",
		unit:  "A",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[65]) * tmd.scale.i, 2),
		value: 0,
	};
	"today.Ahc":    TristarDataEntry = {
		descr: "Amper hours",
		role:  "state",
		unit:  "Ah",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[67] * 0.1,
		value: 0,
	};

	"today.Whc":    TristarDataEntry = {
		descr: "watt hours",
		role:  "state",
		unit:  "Wh",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[68],
		value: 0,
	};

	"today.flags":    TristarDataEntry = {
		descr: "flags",
		role:  "state",
		unit:  "",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[69],
		value: 0,
	};

	"today.batt.Pmax":    TristarDataEntry = {
		descr: "maximal power output",
		role:  "value",
		unit:  "W",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[70]) * tmd.scale.p, 0),
		value: 0,
	};

	"today.batt.Tmin":    TristarDataEntry = {
		descr: "minimal battery temperature",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[71],
		value: 0,
	};
	"today.batt.Tmax":    TristarDataEntry = {
		descr: "maximal battery temperature",
		role:  "value.temperature",
		unit:  "°C",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[72],
		value: 0,
	};

	"today.fault":    TristarDataEntry = {
		descr: "fault",
		role:  "state",
		unit:  "",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => tmd.hr[73],
		value: 0,
	};

	"control.IbattRefSlave":    TristarDataEntry = {
		descr: "Write a current value to this register to override the battery regulation.",
		role:  "state",
		unit:  "I",
		type: "number",
		readRegister:  (tmd: TristarModbusData) =>  round(tmd.hr[88] * tmd.scale.i * Math.pow(2, -15), 2),
		writeRegister: (twd: TristarWriteData) => {return { register : 88, value : Math.floor(twd.value as number / twd.scale.i / Math.pow(2, -15)) }} ,
		value: 0,
	};
	"control.VbattRefSlave":    TristarDataEntry = {
		descr: "Write a voltage value to this register to override the battery regulation.",
		role:  "state",
		unit:  "V",
		type: "number",
		readRegister:  (tmd: TristarModbusData) => round(tmd.hr[89] * tmd.scale.v * Math.pow(2, -15), 2),
		writeRegister: (twd: TristarWriteData) => {return { register : 89, value : Math.floor(twd.value as number / twd.scale.v / Math.pow(2, -15))  }} ,
		value: 0,
	};

	"control.ClearFaults":    TristarDataEntry = {
		descr: "Clear faults (funktion ?)",
		role:  "state",
		unit:  "Coil",
		type: "boolean",
		writeCoil: (twd: TristarWriteData) => {return { register : 20, value : twd.value as number  }},
		value: false,
		valueOld: false
	};

	"control.ClearAlarm":    TristarDataEntry = {
		descr: "Clear alarms (funktion ?)",
		role:  "state",
		unit:  "Coil",
		type: "boolean",
		writeCoil: (twd: TristarWriteData) => {return { register : 21, value : twd.value as number  }},
		value: false,
		valueOld: false
	};

	"control.Reset":    TristarDataEntry = {
		descr: "Reset control (respond and then reset?)",
		role:  "state",
		unit:  "Coil",
		type: "boolean",
		writeCoil: (twd: TristarWriteData) => {return { register : 255, value : twd.value as number  }},
		value: false,
		valueOld: false
	};

}
