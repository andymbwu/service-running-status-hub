var express = require("express");
var router = express.Router();

/* GET home page. */
router.get("/", function(req, res, next) {
  res.render("index", { title: "Express" });
});

/* GET Test  page. */
router.get("/testpage", function(req, res) {
  res.render("testpage", { title: "Test Page" });
});

module.exports = router;
