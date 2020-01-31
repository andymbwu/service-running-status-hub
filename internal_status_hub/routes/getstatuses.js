var express = require('express');
const findAll = require('../lib/find_all.js');
const rules = require('../lib/rules.js');
var router = express.Router();


const seed = Math.floor(Math.random() * 10000000000000000);

router.get('/service_data', function(req, res, next) {
    findAll.find_all(function(err, docs) {
        if (err) throw err;

        let services = {};
        for (let doc of docs) {
            let rule = rules.getRuleByID(doc.service_id);
            if (!rule) {
                // rule no longer here?
                continue;
            }
            services[rule.parent] = services[rule.parent] || {};
            services[rule.parent][rule.id] = services[rule.parent][rule.id] || {
                rule: rule,
                checks: []
            };
            if (services[rule.parent][rule.id].checks.length > 5) {
                continue;
            }
            services[rule.parent][rule.id].checks.push({
                time: new Date(doc.date_time).getTime(),
                healthy: doc.response
            });
        }

        res.set('content-type', 'application/json');
        res.send(JSON.stringify({
            version: seed,
            foo: 'bar',
            services: services
        }));
    });
});

module.exports = router;
