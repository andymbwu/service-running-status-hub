var express = require('express');
var router = express.Router();

var reportHandler = require('../lib/report-handler');

router.post('/report', function(req, res, next) {
    reportHandler.handle(req.body);

    res.set('content-type', 'application/json');
    res.send(JSON.stringify({
        'received': true
    }));
});

module.exports = router;
