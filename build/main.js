"use strict";
/*
 * Created with @iobroker/create-adapter v2.0.1
 */
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
Object.defineProperty(exports, "__esModule", { value: true });
// The adapter-core module gives you access to the core ioBroker functions
// you need to create an adapter
const utils = __importStar(require("@iobroker/adapter-core"));
const tristarMpptTCPModbus_1 = require("./tristarMppt/tristarMpptTCPModbus");
const tristarMpptUtil_1 = require("./tristarMppt/tristarMpptUtil");
// Load your modules here, e.g.:
// import * as fs from "fs";
class TristarMppt extends utils.Adapter {
    constructor(options = {}) {
        super({
            ...options,
            name: "tristar-mppt",
        });
        this.tristar = new tristarMpptTCPModbus_1.TristarMpptTCPModbus();
        this.mainLoopRunning = true;
        this.on("ready", this.onReady.bind(this));
        this.on("stateChange", this.onStateChange.bind(this));
        // this.on("objectChange", this.onObjectChange.bind(this));
        // this.on("message", this.onMessage.bind(this));
        this.on("unload", this.onUnload.bind(this));
    }
    /**
     * Is called when databases are connected and adapter received configuration.
     */
    async onReady() {
        // Initialize your adapter here
        // The adapters config (in the instance object everything under the attribute "native") is accessible via
        // this.config:
        this.log.info("config option1: " + this.config.option1);
        this.log.info("config option2: " + this.config.option2);
        await this.initObjects();
        /*
        For every state in the system there has to be also an object of type state
        Here a simple template for a boolean variable named "testVariable"
        Because every adapter instance uses its own unique namespace variable names can't collide with other adapters variables
        */
        await this.setObjectNotExistsAsync("testVariable", {
            type: "state",
            common: {
                name: "testVariable",
                type: "boolean",
                role: "indicator",
                read: true,
                write: true,
            },
            native: {},
        });
        // start main loop
        this.mainLoop();
        // In order to get state updates, you need to subscribe to them. The following line adds a subscription for our variable we have created above.
        this.subscribeStates("control.*");
        // You can also add a subscription for multiple states. The following line watches all states starting with "lights."
        // this.subscribeStates("lights.*");
        // Or, if you really must, you can also watch all states. Don't do this if you don't need to. Otherwise this will cause a lot of unnecessary load on the system:
        // this.subscribeStates("*");
        /*
            setState examples
            you will notice that each setState will cause the stateChange event to fire (because of above subscribeStates cmd)
        */
        // the variable testVariable is set to true as command (ack=false)
        await this.setStateAsync("testVariable", true);
        // same thing, but the value is flagged "ack"
        // ack should be always set to true if the value is received from or acknowledged from the target system
        await this.setStateAsync("testVariable", { val: true, ack: true });
        // same thing, but the state is deleted after 30s (getState will return null afterwards)
        await this.setStateAsync("testVariable", { val: true, ack: true, expire: 30 });
        // examples for the checkPassword/checkGroup functions
        let result = await this.checkPasswordAsync("admin", "iobroker");
        this.log.info("check user admin pw iobroker: " + result);
        result = await this.checkGroupAsync("admin", "admin");
        this.log.info("check group user admin group admin: " + result);
    }
    // eslint-disable-next-line @typescript-eslint/no-empty-function
    async initObjects() {
        for (const [key, value] of Object.entries(this.tristar.tristarData)) {
            const v = value;
            await this.setObjectNotExistsAsync(key, {
                type: "state",
                common: {
                    name: v.descr,
                    type: v.type,
                    role: "state",
                    read: true,
                    write: false,
                    unit: v.unit,
                },
                native: {},
            });
        }
    }
    async updateStates() {
        try {
            // this.log.debug("#########" + JSON.stringify(this.tristar));
            await this.tristar.readHoldingRegister(this.config);
            for (const [key, value] of Object.entries(this.tristar.tristarData)) {
                const v = value;
                if (v.value !== v.valueOld) {
                    this.log.debug("key     : " + key);
                    this.log.debug("value   : " + v.value);
                    this.log.debug("valueOld: " + v.valueOld);
                    await this.setStateAsync(key, {
                        val: v.value,
                        ack: true
                    });
                }
            }
        }
        catch (Exception) {
            this.log.error("ERROR updateStates in  tristar.readHoldingRegister: " + JSON.stringify(Exception));
        }
    }
    /**
     * Is called when adapter shuts down - callback has to be called under any circumstances!
     */
    onUnload(callback) {
        try {
            // Here you must clear all timeouts or intervals that may still be active
            // clearTimeout(timeout1);
            // clearTimeout(timeout2);
            // ...
            // clearInterval(interval1);
            this.mainLoopRunning = false;
            callback();
        }
        catch (e) {
            callback();
        }
    }
    // If you need to react to object changes, uncomment the following block and the corresponding line in the constructor.
    // You also need to subscribe to the objects with `this.subscribeObjects`, similar to `this.subscribeStates`.
    // /**
    //  * Is called if a subscribed object changes
    //  */
    // private onObjectChange(id: string, obj: ioBroker.Object | null | undefined): void {
    // 	if (obj) {
    // 		// The object was changed
    // 		this.log.info(`object ${id} changed: ${JSON.stringify(obj)}`);
    // 	} else {
    // 		// The object was deleted
    // 		this.log.info(`object ${id} deleted`);
    // 	}
    // }
    async mainLoop() {
        while (this.mainLoopRunning) {
            await this.updateStates();
            await this.sleep(this.config.interval * 1000);
        }
    }
    async sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    /**
     * Is called if a subscribed state changes
     */
    async onStateChange(id, state) {
        try {
            if (state) {
                // The state was changed
                this.log.info(`state ${id} changed: ${state.val} (ack = ${state.ack})`);
                if (this.tristar.tristarScale) {
                    const twd = {
                        value: 0,
                        scale: this.tristar.tristarScale
                    };
                    const v = this.tristar.tristarData[(0, tristarMpptUtil_1.splitIdFromAdapter)(id)];
                    this.log.debug("onStateChange" + JSON.stringify(v) + JSON.stringify(v.writeCoil));
                    if (v.writeRegister) {
                        twd.value = state.val;
                        const twshr = v.writeRegister(twd);
                        this.tristar.sendHoldingRegisterQueue.push(twshr);
                        await this.tristar.writeHoldingRegister(this.config);
                    }
                    else {
                        if (v.writeCoil) {
                            twd.value = state.val;
                            const twc = v.writeCoil(twd);
                            this.tristar.sendCoilQueue.push(twc);
                            await this.tristar.writeCoil(this.config);
                        }
                        else {
                            this.log.error("Model has nor function writeCoil or write Register !!! ");
                        }
                    }
                }
            }
            else {
                // The state was deleted
                this.log.info(`state ${id} deleted`);
            }
        }
        catch (Exception) {
            this.log.error("onStateChange" + JSON.stringify(Exception));
        }
    }
}
if (require.main !== module) {
    // Export the constructor in compact mode
    module.exports = (options) => new TristarMppt(options);
}
else {
    // otherwise start the instance directly
    (() => new TristarMppt())();
}
//# sourceMappingURL=main.js.map