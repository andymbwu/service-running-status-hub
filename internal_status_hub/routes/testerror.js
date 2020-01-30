var express = require('express');
var router = express.Router();

router.get('/testerror', function(req, res, next) {
    throw new Error('this is a test error');
});

module.exports = router;
