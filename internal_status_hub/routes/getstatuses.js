var express = require('express');
const db = require('../lib/db.js');
var router = express.Router();

const seed = Math.floor(Math.random() * 10000000000000000);

router.get('/service_data', function(req, res, next) {
    // db.getalldata
    res.set('content-type', 'application/json');
    res.send(JSON.stringify({
        version: seed,
        foo: 'bar'
    }));
});

module.exports = router;
