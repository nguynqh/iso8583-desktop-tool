# README

## Live Development

To run in live development mode, run `wails dev` in the project directory. This will run a Vite development
server that will provide very fast hot reload of your frontend changes. If you want to develop in a browser
and have access to your Go methods, there is also a dev server that runs on http://localhost:34115. Connect
to this in your browser, and you can call your Go code from devtools.

## Building

To build a redistributable, production mode package, use `wails build`.

## Demo site (Cloudflare Host)

https://iso8583-desktop-tool.pages.dev/

```
iso8583-desktop-tool
├─ app.go
├─ build
├─ frontend
├─ go.mod
├─ go.sum
├─ main.go
├─ README.md
└─ wails.json

```
