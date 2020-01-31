const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = 'mongodb://localhost:27017';

function find_all(callback) {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {

        if (err) throw err;
    
        const db = client.db("pason_statushub_db");
    
    	let HoursAgo = new Date(Date.now() - (1000 * 60 * 60 * 100));
        db.collection('logs').find({date_time: {$gte: HoursAgo}}).sort({date_time: -1}).toArray().then((docs) => {
            console.log(docs[0])
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
