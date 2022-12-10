const fs = require("fs");
const net = require("net");
const path = require("path");
const { homedir } = require("os");
const prompt = require("prompt-sync")();

const port = 3334;
const host = "127.0.0.1";

let datalength = 0;

// base directory
const basedir = homedir();
// Container for current directories files and folders
let ItemsInDir = { Dir: [], Files: [] };
// current directory
let curdir = basedir;
let filename;

function Listdir(_dir) {
  try {
    const dirs = fs
      .readdirSync(_dir, { withFileTypes: true })
      .filter((item) => {
        if (item.isDirectory()) {
          ItemsInDir["Dir"].push(item.name);
        } else {
          ItemsInDir["Files"].push(item.name);
        }
      });
  } catch (err) {
    console.error(err);
  }

  console.log(ItemsInDir);
  ItemsInDir["Dir"] = [];
  ItemsInDir["Files"] = [];
}

function fileStreamHandler(client) {
  const fileStream = fs.createReadStream(path.join(curdir, filename));
  fileStream.pipe(client, { end: false });
  fileStream.on("end", () => {
    GetUserInput();
  });

  fileStream.on("error", (err) => {
    console.log("[x]  No such file in directory [x]");
    GetUserInput();
  });
}
function commandHandler(_command) {
  const init = _command.split(" ");

  if (init[0] == "cd") {
    // Directories
    console.log(init);
    try {
      // Checking if path is a directory
      if (fs.lstatSync(path.join(curdir, init[1])).isDirectory()) {
        curdir = path.join(curdir, init[1]);
        console.clear();
        console.log(`Current Dir: ${curdir}`);
        Listdir(curdir);
        GetUserInput();
      }
    } catch (err) {
      console.log("NOT A DIRECTORY");
      GetUserInput();
    }
    //
  } else if (init[0] == "send") {
    // Sending filename
    console.log("[+] Sending file");
    client.write("fname " + init[1]);
    filename = init[1];
  } else if (init[0] == "ls") {
    console.clear();
    console.log(`Current Dir: ${curdir}`);
    Listdir(curdir);
    GetUserInput();
  } else if (init[0] == "clear") {
    console.clear();
    GetUserInput();
  } else if (init[0] == "exit") {
    client.destroy();
  } else {
    console.log("[x] That is not a command [x]");
    GetUserInput();
  }
}

function GetUserInput() {
  let command = prompt("@command:");

  commandHandler(command);
}

const client = new net.Socket();

client.connect(port, host, () => {
  console.log("connected");
  GetUserInput();
});

client.on("data", (data) => {
  let msg = data.toString();

  if (msg == "200") {
    fileStreamHandler(client);
  }
});

client.on("close", () => {
  console.log("Connection closed");
});
