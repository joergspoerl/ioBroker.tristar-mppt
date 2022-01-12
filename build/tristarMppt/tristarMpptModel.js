"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TristarModel = exports.TristarScale = exports.TristarModbusData = void 0;
const tristarMpptUtil_1 = require("./tristarMpptUtil");
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
class TristarModel {
    constructor() {
        this["adc.vb_f_med"] = {
            descr: "Battery voltage, filtered",
            unit: "V",
            role: "value.voltage",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[24]) * tmd.scale.v, 2),
            value: 0,
        };
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
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[24]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.SensedV"] = {
            descr: "Battery sensed voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[26]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.A"] = {
            descr: "Battery charge current",
            role: "value.current",
            unit: "A",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[28]) * tmd.scale.i, 2),
            value: 0,
        };
        this["batt.OutPower"] = {
            descr: "Output power",
            role: "value",
            unit: "W",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[58]) * tmd.scale.p, 2),
            value: 0,
        };
        this["batt.Vmin"] = {
            descr: "Minimum battery voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[40]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.Vmax"] = {
            descr: "Maximal battery voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[41]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.Vf1m"] = {
            descr: "Battery voltage, filtered(τ ≈ 1min)",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[38]) * tmd.scale.v, 2),
            value: 0,
        };
        this["batt.Af1m"] = {
            descr: "Charging current, filtered(τ ≈ 1min)",
            role: "value.current",
            unit: "I",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[39]) * tmd.scale.i, 2),
            value: 0,
        };
        // ------------------------------------------------------------------------------------------
        this["solar.V"] = {
            descr: "Array voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[27]) * tmd.scale.v, 2),
            value: 0,
        };
        this["solar.I"] = {
            descr: "Array current",
            role: "value.current",
            unit: "V",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[29]) * tmd.scale.i, 2),
            value: 0,
        };
        this["solar.InPower"] = {
            descr: "Input power",
            role: "value",
            unit: "W",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[59]) * tmd.scale.p, 0),
            value: 0,
        };
        this["solar.InPowerPercent"] = {
            descr: "Input power",
            role: "value",
            unit: "%",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)(tmd.config.installedWP / 100 * (0, tristarMpptUtil_1.signedToInteger)(tmd.hr[59]) * tmd.scale.p, 0),
            value: 0,
        };
        this["state.charge"] = {
            descr: "charge state",
            role: "state",
            unit: "",
            type: "string",
            readFunc: (tmd) => tristarMpptUtil_1.charge_states[tmd.hr[50]],
            value: 0,
        };
        this["state.hourmeter"] = {
            descr: "hourmeter",
            role: "state",
            unit: "h",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.to32bitNumber)(tmd.hr[42], tmd.hr[43]),
            value: 0,
        };
        this["state.faults"] = {
            descr: "all Controller faults bitfield",
            role: "state",
            unit: "",
            type: "array",
            readFunc: (tmd) => JSON.stringify((0, tristarMpptUtil_1.resolveFaultsBitfield)(tmd.hr[44])),
            value: 0,
        };
        this["state.dip"] = {
            descr: "all DIP switch positions bitfield",
            role: "state",
            unit: "",
            type: "string",
            readFunc: (tmd) => (0, tristarMpptUtil_1.byteString)(tmd.hr[48]),
            value: 0,
        };
        this["state.led"] = {
            descr: "State of LED indications",
            role: "state",
            unit: "",
            type: "string",
            readFunc: (tmd) => tristarMpptUtil_1.ledState[tmd.hr[49]],
            value: 0,
        };
        this["state.alarm"] = {
            descr: "State of LED indications",
            role: "state",
            unit: "",
            type: "array",
            readFunc: (tmd) => JSON.stringify((0, tristarMpptUtil_1.resolveAlarmBitfield)((0, tristarMpptUtil_1.to32bitNumber)(tmd.hr[46], tmd.hr[47]))),
            value: 0,
        };
        this["today.batt.Vmin"] = {
            descr: "battery minimal voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[64]) * tmd.scale.v, 2),
            value: 0,
        };
        this["today.batt.Vmax"] = {
            descr: "battery maximal voltage",
            role: "value.voltage",
            unit: "V",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[65]) * tmd.scale.v, 2),
            value: 0,
        };
        this["today.batt.Imax"] = {
            descr: "battery maximal current",
            role: "value.current",
            unit: "A",
            type: "number",
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[65]) * tmd.scale.i, 2),
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
            readFunc: (tmd) => (0, tristarMpptUtil_1.round)((0, tristarMpptUtil_1.signedToInteger)(tmd.hr[70]) * tmd.scale.p, 0),
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