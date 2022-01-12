"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TristarModel = exports.ledState = exports.charge_states = exports.alarmTextArray = exports.faultsTextArray = exports.TristarScale = exports.TristarModbusData = void 0;
class TristarModbusData {
    constructor(hr, config) {
        this.hr = hr;
        this.scale = new TristarScale(hr);
        this.config = config;
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
function round(value, decimals) {
    const d = Math.pow(10, decimals);
    if (!isNaN(value)) {
        return Math.round(value * d) / d;
    }
    return 0;
}
function to32bitNumber(hi, lo) {
    return (hi << 16) + lo;
}
exports.faultsTextArray = [
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
];
function resolveFaultsBitfield(value) {
    const r = [];
    for (let i = 0; i < 16; i++) {
        if ((value & 0b00000001) === 1)
            r.push(exports.faultsTextArray[i]);
        value = value >> 1;
    }
    return r;
}
exports.alarmTextArray = [
    "RTS open",
    "RTS shorted",
    "RTS disconnected",
    "Heatsink temp sensor open",
    "Heatsink temp sensor shorted",
    "High temperature current limit",
    "Current limit",
    "Current offset",
    "Battery sense out of range",
    "Battery sense disconnected",
    "Uncalibrated",
    "RTS miswire",
    "High voltage disconnect",
    "Undefined",
    "system miswire",
    "MOSFET open",
    "P12 voltage off",
    "High input voltage current limit",
    "ADC input max",
    "Controller was reset",
    "Alarm 21",
    "Alarm 22",
    "Alarm 23",
    "Alarm 24",
];
function resolveAlarmBitfield(value) {
    const r = [];
    for (let i = 0; i < 24; i++) {
        if ((value & 0b00000001) === 1)
            r.push(exports.alarmTextArray[i]);
        value = value >> 1;
    }
    return r;
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
exports.ledState = {
    0: "LED_START",
    1: "LED_START2",
    2: "LED_BRANCH",
    3: "FAST GREEN BLINK",
    4: "SLOW GREEN BLINK",
    5: "GREEN BLINK, 1HZ",
    6: "GREEN_LED",
    7: "UNDEFINED",
    8: "YELLOW_LED",
    9: "UNDEFINED",
    10: "BLINK_RED_LED",
    11: "RED_LED",
    12: "R-Y-G ERROR",
    13: "R/Y-G ERROR",
    14: "R/G-Y ERROR",
    15: "R-Y ERROR (HTD)",
    16: "R-G ERROR (HVD)",
    17: "R/Y-G/Y ERROR",
    18: "G/Y/R ERROR",
    19: "G/Y/R x 2",
};
function byteString(n) {
    if (n < 0 || n > 255 || n % 1 !== 0) {
        throw new Error(n + " does not fit in a byte");
    }
    return ("000000000" + n.toString(2)).substr(-8);
}
class TristarModel {
    constructor() {
        this["adc.vb_f_med"] = {
            descr: "Battery voltage, filtered",
            unit: "V",
            role: "value.voltage",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v, 2),
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
            type: "number",
            readFunc: (tmd) => tmd.hr[35],
            value: 0,
        };
        this["temp.RTS"] = {
            descr: "RTS temperature (0x80 = disconnect)  C √ -127 to + 127",
            role: "value.temperature",
            unit: "°C",
            type: "number",
            readFunc: (tmd) => tmd.hr[36],
            value: 0,
        };
        this["temp.BATT"] = {
            descr: "Battery regulation temperature C √ -127 to + 127",
            role: "value.temperature",
            unit: "°C",
            type: "number",
            readFunc: (tmd) => tmd.hr[37],
            value: 0,
        };
        // ------------------------------------------------------------------------------------------
        this["batt.V"] = {
            descr: "Battery voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[24]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.SensedV"] = {
            descr: "Battery sensed voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[26]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.A"] = {
            descr: "Battery charge current",
            role: "value.current",
            unit: "A",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[28]) * tmd.scale.i, 2),
            value: 0,
        };
        this["batt.OutPower"] = {
            descr: "Output power",
            role: "value",
            unit: "W",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[58]) * tmd.scale.p, 2),
            value: 0,
        };
        this["batt.Vmin"] = {
            descr: "Minimum battery voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[40]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.Vmax"] = {
            descr: "Maximal battery voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[41]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.Vf1m"] = {
            descr: "Battery voltage, filtered(τ ≈ 1min)",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[38]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.Af1m"] = {
            descr: "Charging current, filtered(τ ≈ 1min)",
            role: "value.current",
            unit: "I",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[39]) * tmd.scale.i, 2),
            value: 0,
        };
        // ------------------------------------------------------------------------------------------
        this["solar.V"] = {
            descr: "Array voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[27]) * tmd.scale.v, 2),
            value: 0,
        };
        this["solar.I"] = {
            descr: "Array current",
            role: "value.current",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[29]) * tmd.scale.i, 2),
            value: 0,
        };
        this["solar.InPower"] = {
            descr: "Input power",
            role: "value",
            unit: "W",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[59]) * tmd.scale.p, 0),
            value: 0,
        };
        this["solar.InPowerPercent"] = {
            descr: "Input power",
            role: "value",
            unit: "%",
            type: "number",
            readFunc: (tmd) => round(tmd.config.installedWP / 100 * signedToInteger(tmd.hr[59]) * tmd.scale.p, 0),
            value: 0,
        };
        this["state.charge"] = {
            descr: "charge state",
            role: "state",
            unit: "",
            type: "string",
            readFunc: (tmd) => exports.charge_states[tmd.hr[50]],
            value: 0,
        };
        this["state.hourmeter"] = {
            descr: "hourmeter",
            role: "state",
            unit: "h",
            type: "number",
            readFunc: (tmd) => to32bitNumber(tmd.hr[42], tmd.hr[43]),
            value: 0,
        };
        this["state.faults"] = {
            descr: "all Controller faults bitfield",
            role: "state",
            unit: "",
            type: "array",
            readFunc: (tmd) => JSON.stringify(resolveFaultsBitfield(tmd.hr[44])),
            value: 0,
        };
        this["state.dip"] = {
            descr: "all DIP switch positions bitfield",
            role: "state",
            unit: "",
            type: "string",
            readFunc: (tmd) => byteString(tmd.hr[48]),
            value: 0,
        };
        this["state.led"] = {
            descr: "State of LED indications",
            role: "state",
            unit: "",
            type: "string",
            readFunc: (tmd) => exports.ledState[tmd.hr[49]],
            value: 0,
        };
        this["state.alarm"] = {
            descr: "State of LED indications",
            role: "state",
            unit: "",
            type: "array",
            readFunc: (tmd) => JSON.stringify(resolveAlarmBitfield(to32bitNumber(tmd.hr[46], tmd.hr[47]))),
            value: 0,
        };
        this["today.batt.Vmin"] = {
            descr: "battery minimal voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[64]) * tmd.scale.v, 2),
            value: 0,
        };
        this["today.batt.Vmax"] = {
            descr: "battery maximal voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[65]) * tmd.scale.v, 2),
            value: 0,
        };
        this["today.batt.Imax"] = {
            descr: "battery maximal current",
            role: "value.current",
            unit: "A",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[65]) * tmd.scale.i, 2),
            value: 0,
        };
        this["today.Ahc"] = {
            descr: "Amper hours",
            role: "state",
            unit: "Ah",
            type: "number",
            readFunc: (tmd) => tmd.hr[67] * 0.1,
            value: 0,
        };
        this["today.Whc"] = {
            descr: "watt hours",
            role: "state",
            unit: "Wh",
            type: "number",
            readFunc: (tmd) => tmd.hr[68],
            value: 0,
        };
        this["today.flags"] = {
            descr: "flags",
            role: "state",
            unit: "",
            type: "number",
            readFunc: (tmd) => tmd.hr[69],
            value: 0,
        };
        this["today.batt.Pmax"] = {
            descr: "maximal power output",
            role: "value",
            unit: "W",
            type: "number",
            readFunc: (tmd) => round(signedToInteger(tmd.hr[70]) * tmd.scale.p, 0),
            value: 0,
        };
        this["today.batt.Tmin"] = {
            descr: "minimal battery temperature",
            role: "value.temperature",
            unit: "°C",
            type: "number",
            readFunc: (tmd) => tmd.hr[71],
            value: 0,
        };
        this["today.batt.Tmax"] = {
            descr: "maximal battery temperature",
            role: "value.temperature",
            unit: "°C",
            type: "number",
            readFunc: (tmd) => tmd.hr[72],
            value: 0,
        };
        this["today.fault"] = {
            descr: "fault",
            role: "state",
            unit: "",
            type: "number",
            readFunc: (tmd) => tmd.hr[73],
            value: 0,
        };
    }
    update(hr, config) {
        const tmd = new TristarModbusData(hr, config);
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
//# sourceMappingURL=tristarMpptModel.js.map