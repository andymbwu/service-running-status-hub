var express = require("express");
var fs = require('fs');
var router = express.Router();

let healthCheckTemplate = fs.readFileSync(`${__dirname}/../views/statuschart.ejs`).toString('utf-8');
/* GET home page. */
router.get("/", function(req, res, next) {
    res.render("index", {
        title: "Service Statuses",
        healthCheckTemplate: healthCheckTemplate
    });
});

/* GET Test  page. */
router.get("/testpage", function(req, res) {
  res.render("testpage", { title: "Test Page" });
});

router.get('/status', function(req, res) {
    res.render('status', {});
});

module.exports = router;
