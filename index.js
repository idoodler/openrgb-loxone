const { createServer } = require("http");

const { ArgumentParser } = require("argparse"),
    { version, description } = require("./package.json"),
    net = require('net'),
    { Client, utils } = require("openrgb-sdk"),
    parser = new ArgumentParser({
        description: description
    });

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
const { listening_port, open_rgb_host, open_rgb_port } = parser.parse_args();

// Verify all required arguments have been passed
if (!listening_port || !open_rgb_host || !open_rgb_port) {
    parser.print_help()
} else {
    const rgbClient = new Client("Loxone", open_rgb_port, open_rgb_host);
    rgbClient.connect().then(function() {
        net.createServer(function(sock) {
            sock.on("data", function(buffer) {
                try {
                    let lxColor = parseInt(buffer.toString()),
                    color = {
                        red: 0,
                        green: 0,
                        blue: 0
                    };
                    color.bluePercent = (lxColor/1000000) | 0;
                    color.blue = 2.55 * color.bluePercent;
                    color.greenPercent = ((lxColor - color.bluePercent * 1000000) / 1000) | 0;
                    color.green = 2.55 * color.greenPercent;
                    color.redPercent = (lxColor - color.bluePercent * 1000000 - color.greenPercent * 1000) | 0;
                    color.red = 2.55 * color.redPercent;
                    rgbClient.getControllerCount().then((ammount) => {
                        for (let deviceId = 0; deviceId < ammount; deviceId++) {
                            rgbClient.getControllerData(deviceId).then((device) => {
                                rgbClient.updateLeds(deviceId, Array(device.colors.length).fill(color));
                            });
                        }
                    });
                } catch (e) {
                    console.warn("Couldn't interprete lxColorValue, ignore...");
                }
            });
        }).listen(listening_port, "0.0.0.0");
    });
}

function convertToRange(value, srcRange, dstRange){
    // value is outside source range return
    if (value < srcRange[0] || value > srcRange[1]){
      return NaN; 
    }
  
    var srcMax = srcRange[1] - srcRange[0],
        dstMax = dstRange[1] - dstRange[0],
        adjValue = value - srcRange[0];
  
    return (adjValue * dstMax / srcMax) + dstRange[0];
  
  }