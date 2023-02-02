# OpenRGB Client for Loxone

---

Control your OpenRGB devices with a Loxone LightController

# Usage
Run this on a device which is always up and running (I intended it for a Raspberry Pi)

# Features
- Easy to use
- Live color preview in terminal (if supported)
 - ![alt text][liveColorPreview]
- Automatic recovery if the PC is offline

# How will you run it?
<details><summary>Node.js</summary><p>

## Using Node.js
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
</p></details>

<details><summary>Docker</summary><p>

## Using Docker
You can also run this using Docker, you have to build it yourself tho.

# Build it
- Clone or download this repo
- enter the directory
- execute `docker build . -t idoodler/openrgbloxone` to install all dependencies

# Run it
`docker run -p 7777:7777 -e PORT=7777 -e OPEN_RGB_HOST=192.168.0.173 -e OPEN_RGB_PORT=6742 --name openrgbLoxone idoodler/openrgbloxone`

## Mandatory environmental variables
- `PORT`
- `OPEN_RGB_HOST`
- `OPEN_RGB_PORT`
</p></details>

---
Requires the following Loxone Library Plugin

[![alt text][worksWithLoxone]](https://library.loxone.com/detail/openrgb-824/overview)

[worksWithLoxone]: ./assets/worksWithLoxone.svg "Works With Loxone"
[liveColorPreview]: ./assets/liveColorPreview.png "Live Color Preview"
