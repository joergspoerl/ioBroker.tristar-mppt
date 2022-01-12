export interface TristarMetaEntry {
	descr: string,
	unit: string;
	role: ioBrokerRole;
	readFunc: (tristarModbusData: TristarModbusData) => TristarPropertyType;
	value: TristarPropertyType
}

export type TristarPropertyType = number | string | boolean | null; // entspricht ioBroker.StateValue
export type TristarHoldingRegisterArray = Array<number>

export type ioBrokerRole = "state" | "value.current" | "value.voltage" | "value" | "value.temperature"

export class TristarModbusData {
	hr : TristarHoldingRegisterArray;
	scale : TristarScale;

	constructor(hr: TristarHoldingRegisterArray) {
		this.hr = hr;
		this.scale = new TristarScale(hr)
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

// helper function to convert signed value to integer
function signedToInteger(value: number): number {
	if ((value & 0x8000) > 0) {
		value = value - 0x10000;
	}
	return value;
}

function round (value: number): number {
	if (!isNaN(value)) {
		return Math.round ( value * 100) / 100;
	}
	return 0;
}

function to32bitNumber (hi: number, lo: number) : number {
	return (hi << 16) + lo
}

export const faultsTextArray = [
	"overcurrent",
	"FETs shorted",
	"software bug",
	"battery HVD",
	"array HVD",
	"settings switch changed",
	"custom settings edit",
	"RTS shorted",
	"RTS disconnected",
	"EEPROM retry limit",
	"Reserved",
	"Slave Control Timeout",
	"Fault 13",
	"Fault 14",
	"Fault 15",
	"Fault 16",
]

function resolveFaultsBitfield (value: number) : Array<string> {
	const r : Array<string> = [];
	for (let i = 0;i<16;i++) {
		if ((value & 0b00000001) === 1) r.push(faultsTextArray[i])
		value = value >> 1
	}
	return r
}


export interface IChargeStates {
	[index: number]:string
}
export const charge_states : IChargeStates = {
	0 : "START",
	1 : "NIGHT_CHECK",
	2 : "DISCONNECT",
	3 : "NIGHT",
	4 : "FAULT",
	5 : "MPPT",
	6 : "ABSORPTION",
	7 : "FLOAT",
	8 : "EQUALIZE",
	9 : "SLAVE",
}


export class TristarModel {


 	"adc.vb_f_med":    TristarMetaEntry = {
		descr: "Battery voltage, filtered",
		unit:  "V",
		role:  "value.voltage",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v),
		value: 0,
	};
	// adc_vbterm_f:    metaEntry,
	// adc_vbs_f:       metaEntry,
	// adc_va_f:        metaEntry,
	// adc_ib_f_shadow: metaEntry
	// adc_ia_f_shadow: metaEntry,
	// adc_p12_f:       metaEntry,
	// adc_p3_f:        metaEntry,
	// adc_pmeter_f:    metaEntry,
	// adc_p18_f:       metaEntry,
	// adc_v_ref:       metaEntry,

	// ------------------------------------------------------------------------------------------

	"temp.HS":    TristarMetaEntry = {
		descr: "Heatsink temperature C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[35],
		value: 0,
	};
	"temp.RTS":    TristarMetaEntry = {
		descr: "RTS temperature (0x80 = disconnect)  C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[36],
		value: 0,
	};
	"temp.BATT":    TristarMetaEntry = {
		descr: "Battery regulation temperature C √ -127 to + 127",
		role:  "value.temperature",
		unit:  "°C",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[37],
		value: 0,
	};

	// ------------------------------------------------------------------------------------------

	"batt.V":    TristarMetaEntry = {
		descr: "Battery voltage",
		role:  "value.voltage",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v),
		value: 0,
	};

	"batt.SensedV":    TristarMetaEntry = {
		descr: "Battery sensed voltage",
		role:  "value.voltage",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[26]) * tmd.scale.v),
		value: 0,
	};

	"batt.A":    TristarMetaEntry = {
		descr: "Battery charge current",
		role:  "value.current",
		unit:  "A",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[28]) * tmd.scale.i),
		value: 0,
	};
	"batt.OutPower":    TristarMetaEntry = {
		descr: "Output power",
		role:  "value",
		unit:  "W",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[58]) * tmd.scale.p),
		value: 0,
	};
	"batt.Vmin":    TristarMetaEntry = {
		descr: "Minimum battery voltage",
		role:  "value.voltage",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[40]) * tmd.scale.v),
		value: 0,
	};
	"batt.Vmax":    TristarMetaEntry = {
		descr: "Maximal battery voltage",
		role:  "value.voltage",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[41]) * tmd.scale.v),
		value: 0,
	};
	"batt.Vf1m":    TristarMetaEntry = {
		descr: "Battery voltage, filtered(τ ≈ 1min)",
		role:  "value.voltage",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[38]) * tmd.scale.v),
		value: 0,
	};

	"batt.Af1m":    TristarMetaEntry = {
		descr: "Charging current, filtered(τ ≈ 1min)",
		role:  "value.current",
		unit:  "I",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[39]) * tmd.scale.i),
		value: 0,
	};

	// ------------------------------------------------------------------------------------------

	"solar.V":    TristarMetaEntry = {
		descr: "Array voltage",
		role:  "value.voltage",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[27]) * tmd.scale.v),
		value: 0,
	};

	"solar.I":    TristarMetaEntry = {
		descr: "Array current",
		role:  "value.current",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[29]) * tmd.scale.i),
		value: 0,
	};

	"solar.InPower":    TristarMetaEntry = {
		descr: "Input power",
		role:  "value",
		unit:  "W",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[59]) * tmd.scale.p),
		value: 0,
	};

	"state.charge":    TristarMetaEntry = {
		descr: "charge state",
		role:  "state",
		unit:  "",
		readFunc:  (tmd: TristarModbusData) => 0, //charge_states[tmd.hr[50]],
		value: 0,
	};
	"state.hourmeter":    TristarMetaEntry = {
		descr: "hourmeter",
		role:  "state",
		unit:  "h",
		readFunc:  (tmd: TristarModbusData) => to32bitNumber(tmd.hr[42], tmd.hr[43]),
		value: 0,
	};


	"state.faults":    TristarMetaEntry = {
		descr: "all Controller faults bitfield",
		role:  "state",
		unit:  "",
		readFunc:  (tmd: TristarModbusData) => JSON.stringify(resolveFaultsBitfield(tmd.hr[44])),
		value: 0,
	};


	"state.dip":    TristarMetaEntry = {
		descr: "all DIP switch positions bitfield",
		role:  "state",
		unit:  "",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[48],
		value: 0,
	};

	"state.led":    TristarMetaEntry = {
		descr: "State of LED indications",
		role:  "state",
		unit:  "",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[49],
		value: 0,
	};

	"today.batt.Vmin":    TristarMetaEntry = {
		descr: "battery minimal voltage",
		role:  "value.voltage",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[64]) * tmd.scale.v),
		value: 0,
	};

	"today.batt.Vmax":    TristarMetaEntry = {
		descr: "battery maximal voltage",
		role:  "value.voltage",
		unit:  "V",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[65]) * tmd.scale.v),
		value: 0,
	};
	"today.batt.Imax":    TristarMetaEntry = {
		descr: "battery maximal current",
		role:  "value.current",
		unit:  "A",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[65]) * tmd.scale.i),
		value: 0,
	};
	"today.Ahc":    TristarMetaEntry = {
		descr: "Amper hours",
		role:  "state",
		unit:  "Ah",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[67] * 0.1,
		value: 0,
	};

	"today.Whc":    TristarMetaEntry = {
		descr: "watt hours",
		role:  "state",
		unit:  "Wh",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[68],
		value: 0,
	};

	"today.flags":    TristarMetaEntry = {
		descr: "flags",
		role:  "state",
		unit:  "",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[69],
		value: 0,
	};

	"today.batt.Pmax":    TristarMetaEntry = {
		descr: "maximal power output",
		role:  "value",
		unit:  "W",
		readFunc:  (tmd: TristarModbusData) => round(signedToInteger(tmd.hr[70]) * tmd.scale.p),
		value: 0,
	};

	"today.batt.Tmin":    TristarMetaEntry = {
		descr: "minimal battery temperature",
		role:  "value.temperature",
		unit:  "°C",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[71],
		value: 0,
	};
	"today.batt.Tmax":    TristarMetaEntry = {
		descr: "maximal battery temperature",
		role:  "value.temperature",
		unit:  "°C",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[72],
		value: 0,
	};

	"today.fault":    TristarMetaEntry = {
		descr: "fault",
		role:  "state",
		unit:  "",
		readFunc:  (tmd: TristarModbusData) => tmd.hr[73],
		value: 0,
	};

	update(hr: TristarHoldingRegisterArray): void {
		const tmd = new TristarModbusData(hr);

		for (const [, value] of Object.entries(this)) {
			const v = value as TristarMetaEntry;
			if (typeof v.readFunc === "function" ) {
				v.value = v.readFunc(tmd)
			}
			// console.log("update - " + key + JSON.stringify(value))
		}
	}
}
export class TristarMpptMeta
{

	adc = {
		// Filtered ADC
		adc_vb_f_med:    { descr: "Battery voltage, filtered",       unit: "V" },
		adc_vbterm_f:    { descr: "Batt.Terminal voltage, filtered", unit: "V" },
		adc_vbs_f:       { descr: "Battery Sense voltage, filtered", unit: "V" },
		adc_va_f:        { descr: "Array voltage, filtered",         unit: "V" },
		adc_ib_f_shadow: { descr: "Battery current, filtered",       unit: "V" },
		adc_ia_f_shadow: { descr: "Array current, filtered",         unit: "A" },
		adc_p12_f:       { descr: "12 volt supply, filtered",        unit: "V" },
		adc_p3_f:        { descr: "3 volt supply, filtered",         unit: "V" },
		adc_pmeter_f:    { descr: "MeterBus voltage, filtered",      unit: "V" },
		adc_p18_f:       { descr: "1.8 volt supply, filtered",       unit: "V" },
		adc_v_ref:       { descr: "reference voltage",               unit: "V" }
	}


	batt = {
		statenum:     { descr: "State number",            unit: ""  },
	}

	today = {
		// Logger – Today’s values
		vb_min_daily:   { descr: "battery minimal voltage",   unit: "V"  },
		vb_max_daily:   { descr: "battery maximal voltage",   unit: "V"  },
		va_max_daily:   { descr: "battery maximal current",   unit: "A"  },
		Ahc_daily:      { descr: "Amper hours",               unit: "Ah" },
		whc_daily:      { descr: "watt hours",                unit: "Wh" },
		flags_daily:    { descr: "flags",                     unit: ""   },
		Pout_max_daily: { descr: "max power output",          unit: "W"  },
		Tb_min_daily:   { descr: "min",                       unit: ""   },
		Tb_max_daily:   { descr: "max",                       unit: ""   },
		fault_daily:    { descr: "fault",                     unit: "W"  },
	}

	state = {
		adc_vb_f_1m: { descr: "Battery voltage, filtered(τ ≈ 1min) V √ n·V_PU·2 - 15", unit: "V" },
		adc_ib_f_1m: { descr: "Charging current, filtered(τ ≈       1min)    A √ n·I_PU·2 - 15", unit: "A" },
		vb_min: { descr: "Minimum battery voltage V √ n·V_PU·2 - 15", unit: "V" },
		vb_max: { descr: "Minimum battery voltage V √ n·V_PU·2 - 15", unit: "V" },
		hourmeter_HI: { descr: "hourmeter, HI word h", unit: "h" },
		hourmeter_LO: { descr: "hourmeter, LO word", unit: "h" },
		fault: { descr: "all Controller faults bitfield", unit: "" },
		alarm_HI: { descr: "alarm bitfield – HI word", unit: "bits" },
		alarm_LO: { descr: "alarm bitfield – LO word", unit: "bits" },
		dip: { descr: "all DIP switch positions bitfield", unit: "bits" },
		led: { descr: "State of LED indications", unit: "" }
	}
}