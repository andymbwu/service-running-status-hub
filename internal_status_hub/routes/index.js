var express = require('express');
var router = express.Router();

const rules = require('../lib/rules.json');

console.log(rules);

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Pason Internal Status Page', rules: rules });
});

/* GET Test  page. */
router.get('/testpage', function(req, res) {
  res.render('testpage', { title: 'Test Page' });
});

router.get('/status', function(req, res) {
  res.render('status', {});
});

module.exports = router;
