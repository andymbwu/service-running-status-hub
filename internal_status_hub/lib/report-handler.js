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


    try {
        evaluate(rule.evaluation, body);
    } catch (e) {
        db.writeStatus(rule, false, e.message);
        return;
    }
    db.writeStatus(rule, true);
}


module.exports = {
    handle: handle
};

