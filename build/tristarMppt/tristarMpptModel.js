"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TristarMpptMeta = exports.TristarModel = exports.charge_states = exports.TristarScale = exports.TristarModbusData = void 0;
class TristarModbusData {
    constructor(hr) {
        this.hr = hr;
        this.scale = new TristarScale(hr);
    }
}
exports.TristarModbusData = TristarModbusData;
class TristarScale {
    constructor(hr) {
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
exports.TristarScale = TristarScale;
// helper function to convert signed value to integer
function signedToInteger(value) {
    if ((value & 0x8000) > 0) {
        value = value - 0x10000;
    }
    return value;
}
function round(value) {
    if (!isNaN(value)) {
        return Math.round(value * 100) / 100;
    }
    return 0;
}
function to32bitNumber(hi, lo) {
    return (hi << 16) + lo;
}
exports.charge_states = {
    0: "START",
    1: "NIGHT_CHECK",
    2: "DISCONNECT",
    3: "NIGHT",
    4: "FAULT",
    5: "MPPT",
    6: "ABSORPTION",
    7: "FLOAT",
    8: "EQUALIZE",
    9: "SLAVE",
};
class TristarModel {
    constructor() {
        this["adc.vb_f_med"] = {
            descr: "Battery voltage, filtered",
            unit: "V",
            role: "value.voltage",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v),
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
        this["temp.HS"] = {
            descr: "Heatsink temperature C √ -127 to + 127",
            role: "value.temperature",
            unit: "°C",
            readFunc: (tmd) => tmd.hr[35],
            value: 0,
        };
        this["temp.RTS"] = {
            descr: "RTS temperature (0x80 = disconnect)  C √ -127 to + 127",
            role: "value.temperature",
            unit: "°C",
            readFunc: (tmd) => tmd.hr[36],
            value: 0,
        };
        this["temp.BATT"] = {
            descr: "Battery regulation temperature C √ -127 to + 127",
            role: "value.temperature",
            unit: "°C",
            readFunc: (tmd) => tmd.hr[37],
            value: 0,
        };
        // ------------------------------------------------------------------------------------------
        this["batt.V"] = {
            descr: "Battery voltage",
            role: "value.voltage",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v),
            value: 0,
        };
        this["batt.SensedV"] = {
            descr: "Battery sensed voltage",
            role: "value.voltage",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[26]) * tmd.scale.v),
            value: 0,
        };
        this["batt.A"] = {
            descr: "Battery charge current",
            role: "value.current",
            unit: "A",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[28]) * tmd.scale.i),
            value: 0,
        };
        this["batt.OutPower"] = {
            descr: "Output power",
            role: "value",
            unit: "W",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[58]) * tmd.scale.p),
            value: 0,
        };
        this["batt.Vmin"] = {
            descr: "Minimum battery voltage",
            role: "value.voltage",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[40]) * tmd.scale.v),
            value: 0,
        };
        this["batt.Vmax"] = {
            descr: "Maximal battery voltage",
            role: "value.voltage",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[41]) * tmd.scale.v),
            value: 0,
        };
        this["batt.Vf1m"] = {
            descr: "Battery voltage, filtered(τ ≈ 1min)",
            role: "value.voltage",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[38]) * tmd.scale.v),
            value: 0,
        };
        this["batt.Af1m"] = {
            descr: "Charging current, filtered(τ ≈ 1min)",
            role: "value.current",
            unit: "I",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[39]) * tmd.scale.i),
            value: 0,
        };
        // ------------------------------------------------------------------------------------------
        this["solar.V"] = {
            descr: "Array voltage",
            role: "value.voltage",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[27]) * tmd.scale.v),
            value: 0,
        };
        this["solar.I"] = {
            descr: "Array current",
            role: "value.current",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[29]) * tmd.scale.i),
            value: 0,
        };
        this["solar.InPower"] = {
            descr: "Input power",
            role: "value",
            unit: "W",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[59]) * tmd.scale.p),
            value: 0,
        };
        this["state.charge"] = {
            descr: "charge state",
            role: "state",
            unit: "",
            readFunc: (tmd) => exports.charge_states[tmd.hr[50]],
            value: 0,
        };
        this["state.hourmeter"] = {
            descr: "hourmeter",
            role: "state",
            unit: "h",
            readFunc: (tmd) => to32bitNumber(tmd.hr[42], tmd.hr[43]),
            value: 0,
        };
        this["state.faults"] = {
            descr: "all Controller faults bitfield",
            role: "state",
            unit: "",
            readFunc: (tmd) => tmd.hr[44],
            value: 0,
        };
        this["state.alarm_HI"] = {
            descr: "alarm bitfield – HI word",
            role: "state",
            unit: "",
            readFunc: (tmd) => tmd.hr[46],
            value: 0,
        };
        this["state.alarm_LO"] = {
            descr: "alarm bitfield – LO word",
            role: "state",
            unit: "",
            readFunc: (tmd) => tmd.hr[47],
            value: 0,
        };
        this["state.dip"] = {
            descr: "all DIP switch positions bitfield",
            role: "state",
            unit: "",
            readFunc: (tmd) => tmd.hr[48],
            value: 0,
        };
        this["state.led"] = {
            descr: "State of LED indications",
            role: "state",
            unit: "",
            readFunc: (tmd) => tmd.hr[49],
            value: 0,
        };
        this["today.batt.Vmin"] = {
            descr: "battery minimal voltage",
            role: "value.voltage",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[64]) * tmd.scale.v),
            value: 0,
        };
        this["today.batt.Vmax"] = {
            descr: "battery maximal voltage",
            role: "value.voltage",
            unit: "V",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[65]) * tmd.scale.v),
            value: 0,
        };
        this["today.batt.Imax"] = {
            descr: "battery maximal current",
            role: "value.current",
            unit: "A",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[65]) * tmd.scale.i),
            value: 0,
        };
        this["today.Ahc"] = {
            descr: "Amper hours",
            role: "state",
            unit: "Ah",
            readFunc: (tmd) => tmd.hr[67] * 0.1,
            value: 0,
        };
        this["today.Whc"] = {
            descr: "watt hours",
            role: "state",
            unit: "Wh",
            readFunc: (tmd) => tmd.hr[68],
            value: 0,
        };
        this["today.flags"] = {
            descr: "flags",
            role: "state",
            unit: "",
            readFunc: (tmd) => tmd.hr[69],
            value: 0,
        };
        this["today.batt.Pmax"] = {
            descr: "maximal power output",
            role: "value",
            unit: "W",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[70]) * tmd.scale.p),
            value: 0,
        };
        this["today.batt.Tmin"] = {
            descr: "minimal battery temperature",
            role: "value.temperature",
            unit: "°C",
            readFunc: (tmd) => tmd.hr[71],
            value: 0,
        };
        this["today.batt.Tmax"] = {
            descr: "maximal battery temperature",
            role: "value.temperature",
            unit: "°C",
            readFunc: (tmd) => tmd.hr[72],
            value: 0,
        };
        this["today.fault"] = {
            descr: "fault",
            role: "state",
            unit: "",
            readFunc: (tmd) => tmd.hr[73],
            value: 0,
        };
    }
    update(hr) {
        const tmd = new TristarModbusData(hr);
        for (const [, value] of Object.entries(this)) {
            const v = value;
            if (typeof v.readFunc === "function") {
                v.value = v.readFunc(tmd);
            }
            // console.log("update - " + key + JSON.stringify(value))
        }
    }
}
exports.TristarModel = TristarModel;
class TristarMpptMeta {
    constructor() {
        this.adc = {
            // Filtered ADC
            adc_vb_f_med: { descr: "Battery voltage, filtered", unit: "V" },
            adc_vbterm_f: { descr: "Batt.Terminal voltage, filtered", unit: "V" },
            adc_vbs_f: { descr: "Battery Sense voltage, filtered", unit: "V" },
            adc_va_f: { descr: "Array voltage, filtered", unit: "V" },
            adc_ib_f_shadow: { descr: "Battery current, filtered", unit: "V" },
            adc_ia_f_shadow: { descr: "Array current, filtered", unit: "A" },
            adc_p12_f: { descr: "12 volt supply, filtered", unit: "V" },
            adc_p3_f: { descr: "3 volt supply, filtered", unit: "V" },
            adc_pmeter_f: { descr: "MeterBus voltage, filtered", unit: "V" },
            adc_p18_f: { descr: "1.8 volt supply, filtered", unit: "V" },
            adc_v_ref: { descr: "reference voltage", unit: "V" }
        };
        this.batt = {
            statenum: { descr: "State number", unit: "" },
        };
        this.today = {
            // Logger – Today’s values
            vb_min_daily: { descr: "battery minimal voltage", unit: "V" },
            vb_max_daily: { descr: "battery maximal voltage", unit: "V" },
            va_max_daily: { descr: "battery maximal current", unit: "A" },
            Ahc_daily: { descr: "Amper hours", unit: "Ah" },
            whc_daily: { descr: "watt hours", unit: "Wh" },
            flags_daily: { descr: "flags", unit: "" },
            Pout_max_daily: { descr: "max power output", unit: "W" },
            Tb_min_daily: { descr: "min", unit: "" },
            Tb_max_daily: { descr: "max", unit: "" },
            fault_daily: { descr: "fault", unit: "W" },
        };
        this.state = {
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
        };
    }
}
exports.TristarMpptMeta = TristarMpptMeta;
//# sourceMappingURL=tristarMpptModel.js.map