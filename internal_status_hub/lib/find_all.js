const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = 'mongodb://localhost:27017';

function find_all(callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {

        if (err) throw err;
    
        const db = client.db("pason_statushub_db");
    
        db.collection('logs').find({}).sort({date_time: -1}).toArray().then((docs) => {
            client.close();
    
            callback(null, docs);
    
        }).catch((err) => {
            client.close();
    
            callback(err);
        });
    });
}

module.exports = {
    find_all: find_all
};
