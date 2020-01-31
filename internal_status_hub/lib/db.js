var MongoClient = require('mongodb').MongoClient;
//27017 is the port that MongoDB listens to by default
var url = "mongodb://localhost:27017/";

function writeStatus(rule, healthy, message) {
    message = message || '';
    var curr_time = new Date();
    console.log(`[DB] [${rule.parent}::${rule['display-name']}] ${healthy ? '\x1b[32mOK' : '\x1b[31mNOT OK'}\x1b[0m`);
    //Write to DB
    MongoClient.connect(url, function(err, db) {
        if (err) throw err;
        var dbo = db.db("pason_statushub_db");
        var myobj = {
                    "type":rule.type, 
                    "service_id":rule.id,
                    "response":healthy,
                    "date_time":curr_time,
                    "interval":rule.interval,
                    "message":message
                    };
        dbo.collection("logs").insertOne(myobj, function(err, res) {
          if (err) throw err;
          console.log("Response logged");
          db.close();
        });
      });
}

module.exports = {
    writeStatus: writeStatus
};
