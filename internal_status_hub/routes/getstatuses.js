var express = require('express');
const findAll = require('../lib/find_all.js');
var router = express.Router();

const seed = Math.floor(Math.random() * 10000000000000000);

router.get('/service_data', function(req, res, next) {
    findAll.find_all(function(err, docs) {
        if (err) throw err;

        res.set('content-type', 'application/json');
        res.send(JSON.stringify({
            version: seed,
            foo: 'bar',
            docs: docs
        }));
    });
});

module.exports = router;
