const db = require("./db/database");
const query = require("./db/query");

// Create Database
var database = db.createDatabase("newDatabase");

// Create collection
database.submit(
    query.createCollection("newCollection"),
    (err, success) => {
        database.submit(
            query.insertInto("newCollection", {
                "fieldA": "Hello",
                "fieldB": {
                    "fieldBA": 1,
                    "fieldBB": true
                }
            }),
            (err, id) => {

            }
        );
    }
);

// // Update document
// database.submit(query
//     .update("fieldA", "fieldB")
//     .in("newCollection")
//     .values({
//         "fieldA": "World",
//         "fieldB": {
//             "newField": false
//         }
//     })
// );

// // Select document
// database.submit(query
//     .selectAll()
//     .where({
//         "index": 1
//     })
// );

// // Delete document
// database.submit(query
//     .deleteFrom("newCollection")
//     .where({
//         "index": 1
//     })
// );