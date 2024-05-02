const config = {
    ip_subnet_pre: {
        1: "192.168.111.", //to add more subnets, add a new key-value pair
        2: "192.168.112.",
    },
    ip_range: {
        1: {
            start: 0, //to turn off, set 0 and 0
            end: 0
        },
        2: {
            start: 1,
            end: 255
        },
    },
    ping_try_count: 1, //requests per ip
    excluded_IP: ["192.168.111.25",""],
}


module.exports = config;