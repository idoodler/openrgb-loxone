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
    start();
}

// The actual start of the application
async function start() {
    const rgbClient = new Client("Loxone", open_rgb_port, open_rgb_host);
    //await rgbClient.connect();

    /*net.createServer(function(sock) {
        console.log("TCP socket is listening listening for colors...");
        sock.on("data", function(data) {
            console.log(`${sock.remoteAddress} sent ${data}`);
        });
    }).listen(listening_port, "0.0.0.0");*/

    const ammount = await clientInformation.getControllerCount(),
        violet = {
            red: 138,
            green: 43,
            blue: 226
        };
    let devices = [];
    for (let deviceId = 0; deviceId < ammount; deviceId++) {
        let device = await rgbClient.updateLeds(deviceId, Array(device.colors.length).fill(violet));
        await rgbClient.updateLeds(deviceId, Array(device.colors.length).fill(violet));
    }

    await rgbClient.disconnect();
};