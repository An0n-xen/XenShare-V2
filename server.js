const net = require("net");
const fs = require("fs");
const prompt = require("prompt-sync")();

const port = 3334;
const host = "0.0.0.0";
const server = net.createServer();

// fileStream
let fileStream = "";

function recieveFileData(sock) {
  sock.on("data", (data) => {
    let msg = data.toString().split(" ");
    if (msg[0] == "fname") {
      fileStream = fs.WriteStream(msg[1]);
      console.log("fname recieved");
      // Sending success to client
      sock.write("200");
    } else {
      fileStream.write(data);
    }
  });
}

server.on("connection", (sock) => {
  console.log(
    "Connected to IP: " + sock.remoteAddress + " PORT: " + sock.remotePort
  );

  recieveFileData(sock);
});

server.listen(port, host, () => {
  console.log("TCP Server is running on port " + port + ".");
});
