const { ArgumentParser } = require("argparse"),
    { version, description } = require("./package.json"),
    net = require('net'),
    { Client } = require("openrgb-sdk"),
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
    parser.print_help();
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
                
                    // Thats the color we are setting
                    console.dir(color);

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