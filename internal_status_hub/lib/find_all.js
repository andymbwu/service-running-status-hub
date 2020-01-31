const mongo = require('mongodb');
const MongoClient = mongo.MongoClient;
const url = 'mongodb://localhost:27017';

function find_all() {
    MongoClient.connect(url, { useNewUrlParser: true }, (err, client) => {

        if (err) throw err;
    
        const db = client.db("testdb");
    
        db.collection('logs').find({}).toArray().then((docs) => {
    
            console.log(docs);
    
        }).catch((err) => {
    
            console.log(err);
        }).finally(() => {
    
            client.close();
        });
    });
}

module.exports = {
    find_all: find_all
};
