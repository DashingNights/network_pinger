const config = {
    ip_subnet_pre: {
        1: "192.168.111.", //to add more subnets, add a new key-value pair
        2: "192.168.112.",
    },
    ip_range: {
        1: {
            start: 1, //to turn off, set 0 and 0
            end: 255
        },
        2: {
            start: 1,
            end: 255
        },
    },
    excluded_IP: [""],

    try_timing: 30000, //ms, no change needed, 20k should be enough for 255*2 ips
}


module.exports = config;