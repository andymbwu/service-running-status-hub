const rules = require('./rules.js')
const request = require('request')
const pollHandler = require('./poll-handler');
const db = require('./db');

let pollers = {};

function startPolling() {
    for (let rule of rules.getAllPollingRules()) {
        pollers[rule.id] = setInterval(function() {
            console.log(`[POLLER] [${rule['display-name']}] ${rule.method} ${rule.url}`);
            request({
                url: rule.url,
                method: rule.method,
                agentOptions: {
                    rejectUnauthorized: false // self signed certs
                }
            }, function(error, response, body) {
                try {
                    pollHandler.handle(rule, error, response, body);
                } catch (e) {
                    console.error(`[POLLER] [${rule['display-name']}] EXCEPTION`);
                    console.error(e);
                    db.writeStatus(rule, false);
                }
            });
        }, rule.interval);
    }
}

module.exports = {
    startPolling: startPolling
};
