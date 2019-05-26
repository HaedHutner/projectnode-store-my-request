const db = require("./db/database");
const query = require("./db/query");

// Create Database
var database = db.createDatabase("resources/newDatabase");

// Select document
database.submit(query
    .selectFrom("newCollection")
    .where({
        "fieldA": "Aschoo",
        "fieldB": {
            "fieldBB": true
        }
    }),
    (err, result) => {
        console.log(err);
        console.log(JSON.stringify(result));
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