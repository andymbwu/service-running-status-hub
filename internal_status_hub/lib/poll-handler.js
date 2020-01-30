const db = require('./db.js');
const evaluate = require('./evaluate.js');

function handle(rule, error, response, body) {
    if (error) {
        db.writeStatus(rule, false);
        return;
    }

    let health = evaluate(rule.evaluation, body, response);

    db.writeStatus(rule, health);
}

module.exports = {
    handle: handle
};
