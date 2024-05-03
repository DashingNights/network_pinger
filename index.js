const exec = require("child_process").exec;
const fs = require("node:fs");
const config = require("./config");
const online_list = new Set();
const unreachable_list = new Set();
const offline_list = new Set();
let ip_list = [];

const now = new Date();
const outfilename = `${now.getFullYear()}${padNumber(now.getMonth() + 1)}${padNumber(now.getDate())}_${padNumber(now.getHours())}${padNumber(now.getMinutes())}${padNumber(now.getSeconds())}.txt`;

function padNumber(num) {
	return num.toString().padStart(2, "0");
}

function createList() {
	for (let i in config.ip_subnet_pre) {
		for (let j = config.ip_range[i].start; j <= config.ip_range[i].end; j++) {
			if (config.excluded_IP.includes(config.ip_subnet_pre[i] + j)) {
				continue;
			} else {
				ip_list.push(config.ip_subnet_pre[i] + j);
			}
		}
	}
	console.log("IP list created.");
	return ip_list;
}

ip_list = createList();

function pingList() {
	return new Promise((resolve) => {
		let pendingPings = ip_list.length;

		ip_list.forEach((e) => {
			const startTime = new Date().getTime();

			exec(`ping /n 2 ${e}`, (err, stdout, stderr) => {
				// console.log(stdout);
				const endTime = new Date().getTime();
				const elapsedTime = endTime - startTime;

				if (err) {
					return;
				}

				if (stdout) {
					const lines = stdout.split("\n");
					if (lines.filter((line) => line.includes(`bytes=32`)).length > 0) {
						fs.appendFile(`./${outfilename}`, `Online: ${e}\r\n`, (err) => {
							if (err) {
								console.error(err);
							} else {
								online_list.add(e);
								console.log(`IP ${e} is online. Check output file for more info.`);
							}
						});
					} else {
						const lines = stdout.split("\n");
							if (lines.filter((line) => line.includes("Destination host unreachable.")).length > 0) {
							console.log(e + " might be online!");
							unreachable_list.add(e);
							fs.appendFile(`./${outfilename}`, `MIGHT be Online: ${e}\r\n`, (err) => {
								if (err) {
									console.error(err);
								}
							});
						}
					}
				} 
				pendingPings--;
				if (pendingPings === 0) {
					resolve();
				}
			});
		});
	});
}

function compareList() {

	ip_list.forEach((e) => {
		if (!online_list.has(e) && !unreachable_list.has(e)) {
			offline_list.add(e);
			fs.appendFile(`./${outfilename}`, `Offline: ${e}\r\n`, (err) => {
				if (err) {
					console.error(err);
				}
			});
			console.log(`IP ${e} is offline. Check output file for more info.`);
		}
	});
	console.log("Comparison done.");
}

function compileOutputData() {
	console.log("Online IPs: ", online_list.size);
	fs.appendFile(`./${outfilename}`, `Online IPs: ${online_list.size}\r\n`, (err) => {
		if (err) {
			console.error(err);
		}
	});
	var offline_count = ip_list.length - online_list.size - unreachable_list.size;
	console.log("Offline IPs: ", offline_count);
	fs.appendFile(`./${outfilename}`, `Offline IPs: `+ offline_count +"\r\n", (err) => {
		if (err) {
			console.error(err);
		}
	});
	console.log("Unreachable IPs: ", unreachable_list.size);
	fs.appendFile(`./${outfilename}`, `Unreachable IPs: ${unreachable_list.size}\r\n`, (err) => {
		if (err) {
			console.error(err);
		}
	});
	console.log("Scanned IPs: ", ip_list.length);
	fs.appendFile(`./${outfilename}`, `Scanned IPs: ${ip_list.length}\r\n`, (err) => {
		if (err) {
			console.error(err);
		}
	});
	console.log("Output file: ", outfilename);
	console.log("IP(s) ignored: ", config.excluded_IP);
	fs.appendFile(`./${outfilename}`, `Excluded IPs: ${config.excluded_IP}`, (err) => {
		if (err) {
			console.error(err);
		}
	});
	
}

pingList();
setTimeout(function () {
	compareList();
		setTimeout(function () {
			compileOutputData();
		}, 5000);
}, config.try_timing);
