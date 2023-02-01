const { ArgumentParser } = require("argparse"),
    { name, version, description } = require("./package.json"),
    net = require('net'),
    Q = require("q"),
    { Client, utils } = require("openrgb-sdk"),
    chalk = require("chalk"),
    fadeColor  = require("color-fade"),
    parser = new ArgumentParser({
        description
    });

const OFF_MODES = [
        "Off"
    ],
    STATIC_MODES = [
        "Static",
        "Direct"
    ];

// Setup all the CLI param stuff 
parser.add_argument("-v", "--version", {
    action: "version", version: version
});
parser.add_argument("--listening-port", {
    help: "The port to listen for Loxone TCP commands. E.g.: 7777"
});
parser.add_argument("--open-rgb-host", {
    help: "The host OpenRGB runs on. E.g.: localhost"
});
parser.add_argument("--open-rgb-port", {
    help: "The port OpenRGB runs on. E.g.: 6742"
});
let args = parser.parse_args();

[
    "LISTENING_PORT",
    "OPEN_RGB_HOST",
    "OPEN_RGB_PORT"
].forEach((envVar) => {
    if (process.env[envVar]) {
        args[envVar.toLowerCase()] = process.env[envVar];
    }
});

// Verify all required arguments have been passed
if (!args.listening_port || !args.open_rgb_host || !args.open_rgb_port) {
    parser.print_help();
} else {
    net.createServer((sock) => {
        sock.on("data", (buffer) => {
            try {
                let rgbClientPrms = getRGBClient(),
                    lxColor = parseInt(buffer.toString()),
                    color = {
                        red: 0,
                        green: 0,
                        blue: 0
                    },
                    isOff = false;
                // Intermediate step in getting the RGB value from the Loxone RGB Value
                color.bluePercent = (lxColor/1000000) | 0;
                color.greenPercent = ((lxColor - color.bluePercent * 1000000) / 1000) | 0;
                color.redPercent = (lxColor - color.bluePercent * 1000000 - color.greenPercent * 1000) | 0;

                // These are the real RGB Values
                color.blue = (2.55 * color.bluePercent) | 0;
                color.green = (2.55 * color.greenPercent) | 0;
                color.red = (2.55 * color.redPercent) | 0;
                delete color.bluePercent;
                delete color.greenPercent;
                delete color.redPercent;

                isOff = !color.blue && !color.green && !color.red;
            
                // Thats the color we are setting
                if (chalk.supportsColor) {
                    console.log(`Received ${chalk.bgRgb(color.red, color.green, color.blue)("   ")} from: ${sock.remoteAddress}`);
                } else {
                    console.log(`Received rgb(${color.red},${color.green},${color.blue}) from: ${sock.remoteAddress}`);
                }

                rgbClientPrms.done((rgbClient) => {
                    if (!rgbClient.isConnected) {
                        console.warn(`OpenRGB not connected, maybe offline?`);
                        rgbClient.disconnect();
                        return;
                    }
                    return rgbClient.getControllerCount().then((ammount) => {
                        let prms = [];
                        for (let deviceId = 0; deviceId < ammount; deviceId++) {
                            prms.push(rgbClient.getControllerData(deviceId).then((device) => {
                                let newMode,
                                    colorsToSet = Array(device.colors.length).fill(color);

                                // Get the correct mode for the color
                                device.modes.forEach((mode) => {
                                    if (isOff && OFF_MODES.includes(mode.name)) {
                                        newMode = mode;
                                    } else if (JSON.stringify(device.colors) !== JSON.stringify(colorsToSet) && STATIC_MODES.includes(mode.name)) {
                                        newMode = mode;
                                    }
                                });
                                // Only send something if we need to, don't overwhelm OpenRGB
                                if (newMode) {
                                    rgbClient.updateMode(deviceId, newMode.id).then(() => {
                                        rgbClient.updateLeds(deviceId, colorsToSet);
                                    }, () => {
                                        console.log(`Failed setting mode for ${device.name}`);
                                    });

                                    /*fadeColor(rgbToHex(device.colors[0]), rgbToHex(colorsToSet[0]), 10).then(function(fadeColors) {
                                        
                                        fadeColors.forEach(function(fadeStep) {
                                            rgbClient.updateMode(deviceId, newMode.id).then(() => {
                                                rgbClient.updateLeds(deviceId, colorsToSet.fill(utils.hexColor(fadeStep)));
                                            }, () => {
                                                console.log(`Failed setting mode for ${device.name}`);
                                            });
                                        });
                                    });*/
                                }
                            }));
                        }
                        return Q.all(prms);
                    });
                }, (e) => {
                    console.warn(`Couldn't establish a connection to OpenRGB: ${e.message}`);
                });
            } catch (e) {
                console.warn("Couldn't interprete lxColorValue, ignore...");
            }
        });
    }).listen(args.listening_port, "0.0.0.0");
}

/**
 * Ensures we always have a client
 * @returns {Client}
 */
function getRGBClient() {
    let defer = Q.defer();
    if (!this._rgbClient) {
        try {
            this._rgbClient = new Client(name, args.open_rgb_port, args.open_rgb_host);
            this._rgbClient.on("disconnect", () => {
                this._rgbClient.disconnect();
                delete this._rgbClient;
            });
            this._rgbClient.on("error", () => {
                this._rgbClient.disconnect();
                delete this._rgbClient;
            });
            defer.resolve(this._rgbClient.connect().then(() => {
                return this._rgbClient;
            }, (e) => {
                this._rgbClient.disconnect();
                delete this._rgbClient;
                throw e;
            }));
        } catch (e) {
            console.warn(`Couldn't establish a connection to OpenRGB: ${e.message}`);
        }
    } else {
        defer.resolve(this._rgbClient);
    }
    return defer.promise;
}

function rgbToHex(colorObj) {
    return "#" + ((1 << 24) + (colorObj.red << 16) + (colorObj.green << 8) + colorObj.blue).toString(16).slice(1);
}