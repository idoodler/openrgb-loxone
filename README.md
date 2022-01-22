# ❗This project is work in progress❗

# OpenRGB Client for Loxone

---

Control your OpenRGB devices with a Loxone LightController

# Usage
Run this on a device which is always up and running (I intended it for a Raspberry Pi)

# Requirements
- Node.js

## installation
- Clone or download this repo
- enter the directory
- execute `npm i` to install all dependencies

## Automatically keep this script allive
To archive this I am using `pm2`
- `npm i pm2 -g`
- enter this project directory
- `pm2 start index.js --name OpenRGBLoxone --watch -- --listening-port YOUR_PORT --open-rgb-host YOUR_OPEN_RGB_HOST --open-rgb-port YOUR_OPEN_RGB_PORT`
 - `--watch` will automatically restart the script whenever a file changes in the directory
- `pm2 startup`
 - Follow the commands output
- `pm2 save`

## Mandatory arguments
- `--listening-port`
- `--open-rgb-host`
- `--open-rgb-port`
> Check `-h` for more informations is required

Requires the following Loxone Library Plugin

[![alt text][worksWithLoxone]](https://library.loxone.com)

[worksWithLoxone]: ./assets/worksWithLoxone.svg "Works With Loxone"