
// create an empty modbus client
var ModbusRTU = require("modbus-serial");
var client = new ModbusRTU();

// open connection to a tcp line
client.connectTCP("TSMPPT10480676.home.arpa", { port: 502 });
client.setID(1);
// client.open(() => {
//     console.log("opened")
//     // client.writeCoil(20, true)

// })

    //     read the values of 10 registers starting at address 0
    // // on device number 1. and log the values to the console.

    // function (err, data) {
    //     if (!err) {
    //         console.log(data.data);
    //     } else {
    //         console.log(err);
    //     }
    // }
    setInterval(async function () {
        try {
            const sr = await client.readHoldingRegisters(0, 6);    
            console.log(sr)

            const V_PU = sr.data[0] + sr.data[1] / Math.pow(2, 16);
            const I_PU = sr.data[2] + sr.data[3] / Math.pow(2, 16);
            console.log("V_PU: ", V_PU)
            console.log("I_PU: ", I_PU)


            // const maxCurrent = 60;
            // const wr1 = await client.writeRegister(88, Math.floor(maxCurrent / 80 / Math.pow(2, -15)));    
            // console.log(wr1)

            // const maxVoltage = 500;
            // const wr2 = await client.writeRegister(89, Math.floor(maxVoltage / V_PU / Math.pow(2, -15)));    
            // console.log(wr2)

            // const wr1 = await client.writeRegister(88, 45534);    
            // console.log(wr1)

            // const wr2 = await client.writeRegister(89, 45534);    
            // console.log(wr2)

            // const wr = await client.writeRegister(89, 0);    
            // console.log(wr)

            // const w1 = await client.writeCoil(255, true)
            // console.log(w1)


            // const w1 = await client.writeCoil(20, true)
            // console.log(w1)
            // const w2 = await client.writeCoil(21, true)
            // console.log(w2)
            const r = await client.readHoldingRegisters(88, 2);    
            console.log(r)
        } catch (Exception) {
            client.close()
            console.log(Exception)

            // open connection to a tcp line
client.connectTCP("TSMPPT10480676.home.arpa", { port: 502 });
client.setID(1);

        }
    }, 1000);
