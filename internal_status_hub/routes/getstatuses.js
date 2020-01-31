var express = require('express');
const db = require('../lib/db.js');
var router = express.Router();

router.get('/service_data', function(req, res, next) {
    // db.getalldata
    res.set('content-type', 'application/json');
    res.send(JSON.stringify({
        foo: 'bar'
    }));
});

module.exports = router;
