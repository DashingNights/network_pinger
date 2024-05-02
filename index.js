const exec = require("child_process").exec;
const fs = require("node:fs");
const config = require("./config");
const online_list = new Set();
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
	return ip_list;
}

ip_list = createList();

function pingList() {
	return new Promise((resolve) => {
		let pendingPings = ip_list.length;

		ip_list.forEach((e) => {
			const startTime = new Date().getTime();

			exec(`ping -c ${config.ping_try_count} ${e}`, (err, stdout, stderr) => {
				const endTime = new Date().getTime();
				const elapsedTime = endTime - startTime;

				if (err) {
					return;
				}

				if (stdout && elapsedTime <= 10000) {
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
					const filteredLines = lines.filter((line) => !line.includes("Destination host unreachable."));

					if (filteredLines.length > 0) {
						console.log(e + " might be online!");
						online_list.add(e);
						fs.appendFile(`./${outfilename}`, `MIGHT be Online: ${e}\r\n`, (err) => {
							if (err) {
								console.error(err);
							}
						});
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
	const online_array = Array.from(online_list);
	const offline_list = ip_list.filter((e) => !online_array.includes(e));

	offline_list.forEach((e) => {
		fs.appendFile(`./${outfilename}`, `Offline: ${e}\r\n`, (err) => {
			console.log(`IP ${e} is offline. Check output file for more info.`);
			if (err) {
				console.error(err);
			}
		});
	});
}


pingList();
setTimeout(function () {
	compareList();
}, 15000);
