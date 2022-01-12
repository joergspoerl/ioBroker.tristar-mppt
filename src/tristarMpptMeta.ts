export interface metaEntry {
	descr: string,
	unit: string
}

export interface TristarMetaAdc {
	adc_vb_f_med:    metaEntry,
	adc_vbterm_f:    metaEntry,
	adc_vbs_f:       metaEntry,
	adc_va_f:        metaEntry,
	adc_ib_f_shadow: metaEntry
	adc_ia_f_shadow: metaEntry,
	adc_p12_f:       metaEntry,
	adc_p3_f:        metaEntry,
	adc_pmeter_f:    metaEntry,
	adc_p18_f:       metaEntry,
	adc_v_ref:       metaEntry,
}


// export interface metaTemp {
// 	T_hs:       metaEntry,
// 	T_rts:      metaEntry,
// 	T_batt:     metaEntry,
// }



// export interface metaBatt {
// 	battsV:       metaEntry,
// 	battsSensedV:      metaEntry,
// 	battsI:     metaEntry,
// 	arrayV:     metaEntry,
// 	arrayI:     metaEntry,
// 	statenum:     metaEntry,
// 	hsTemp:     metaEntry,
// 	rtsTemp:     metaEntry,
// 	outPower:     metaEntry,
// 	inPower:     metaEntry,
// //	:     metaEntry,
// }


export class TristarMpptMeta
{

	adc : TristarMetaAdc = {
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

	temp = {
		// Temperatures
		T_hs:   { descr: "Heatsink temperature C √ -127 to + 127",                 unit: "°C" },
		T_rts:  { descr: "RTS temperature (0x80 = disconnect)  C √ -127 to + 127", unit: "°C" },
		T_batt: { descr: "Battery regulation temperature C √ -127 to + 127",       unit: "°C" },
	}

	batt = {
		// battery sense voltage, filtered
		battsV:       { descr: "Battery voltage",         unit: "V" },
		battsSensedV: { descr: "Battery sensed voltage",  unit: "V" },
		battsI:       { descr: "Battery charge current",  unit: "A" },
		arrayV:       { descr: "Array voltage",           unit: "V" },
		arrayI:       { descr: "Array current",           unit: "A" },
		statenum:     { descr: "State number",            unit: ""  },
		hsTemp:       { descr: "hs temperature",          unit: "°C"},
		rtsTemp:      { descr: "rts temperature",         unit: "°C"},
		outPower:     { descr: "Output power",            unit: "W" },
		inPower:      { descr: "Input power",             unit: "W" },
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