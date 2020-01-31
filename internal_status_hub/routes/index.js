var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Pason Internal Status Page" });
});

/* GET Test  page. */
router.get("/testpage", function(req, res) {
  res.render("testpage", { title: "Test Page" });
});

router.get('/status', function(req, res) {
    res.render('status', {});
});

module.exports = router;
