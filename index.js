const fs = require("graceful-fs");
const dotenv = require("dotenv").config();
const Web3 = require("web3");
const web3 = new Web3("https://cloudflare-eth.com");
const StreamArray = require("stream-json/streamers/StreamArray");
const path = require("path");
const jsonStream = StreamArray.withParser();
const readline = require("readline");

const nullAddress = "0x0000000000000000000000000000000000000000";
const re = /^[A-Za-z]+$/;

const delay = (ms) => new Promise((res) => setTimeout(res, ms));

const appendToFile = (path, data) => {
  fs.appendFile(path, data, function (err) {
    if (err) {
      console.log(err);
    }
  });
};

// read from TXT:

const readDir = async (num) => {
  fs.readdir(__dirname + "/domains", async (err, files) => {
    if (err) console.log(err);
    else {
      files = files.filter((s) => s.includes(".txt"));

      const fileStream = fs.createReadStream(`./domains/${files[num]}`);

      const rl = readline.createInterface({
        input: fileStream,
        crlfDelay: Infinity,
      });

      for await (const line of rl) {
        let domain = line;
        await delay(500);
        web3.eth.ens.getOwner(`${domain}.eth`).then(function (contract) {
          if (contract === nullAddress) {
            appendToFile(`./new_ens/${domain.length}_ens.txt`, `${domain}\n`);
          }
          console.log(`${domain} checked`);
        });
        if (line === "ENDENDEND") {
          readDir(num + 1);
        }
      }
    }
  });
};

readDir(0);
