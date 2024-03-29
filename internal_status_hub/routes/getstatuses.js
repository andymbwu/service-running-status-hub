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
                console.log("Rule doesn't exist in rules.json");
                continue;
            }
            services[rule.parent] = services[rule.parent] || {};
            services[rule.parent][rule.id] = services[rule.parent][rule.id] || {
                rule: rule,
                checks: []
            };
            services[rule.parent][rule.id].checks.push({
                time: new Date(doc.date_time).getTime(),
                healthy: doc.response,
                message: doc.message || null
            });
        }

        res.set('content-type', 'application/json');
        res.set('access-control-allow-origin', '*');
        res.send(JSON.stringify({
            version: seed,
            foo: 'bar',
            services: services,
            categories: rules.getCategoryDisplayNames()
        }));
    });
});

module.exports = router;
