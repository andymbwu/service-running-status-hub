const db = require('./db.js');
const evaluate = require('./evaluate.js');

function handle(rule, error, response, body) {
    if (error) {
        db.writeStatus(rule, false, error.message);
        return;
    }

    try {
        evaluate(rule.evaluation, body, response);
    } catch (e) {
        db.writeStatus(rule, false, e.message);
        return;
    }
    db.writeStatus(rule, true);
}

module.exports = {
    handle: handle
};
