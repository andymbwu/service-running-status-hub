const rules = require('./rules.js');
const evaluate = require('./evaluate.js');
const db = require('./db.js');

function handle(body) {
    if (!body.id) {
        throw new Error('POST body requires key: id');
    }

    let rule = rules.getRule('REPORTING', body);

    if (!rule) {
        throw new Error(`Rule not found: ${body.id}`);
    }


    let health = evaluate(rule.evaluation, body);

    db.writeStatus(rule, health);
}


module.exports = {
    handle: handle
};

