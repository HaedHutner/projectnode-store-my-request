const db = require("./db/database");
const query = require("./db/query");

// Create Database
var database = db.createDatabase("resources/newDatabase");

// // Select document
// database.submit(query
//     .selectFrom("newCollection")
//     .where({
//         "fieldA": "Aschoo",
//         "fieldB": {
//             "fieldBB": true
//         }
//     }),
//     (err, result) => {
//         console.log(err);
//         console.log(JSON.stringify(result));
//     }
// );

database.submit(
    query.insertInto("newCollection", {
        stringKey: "asdf",
        intKey: Math.floor(100 * Math.random())
    }), (err, result) => {
        if (err) console.log(err);
    }
);

database.submit(
    query.selectFrom("newCollection").where({
        intKey: 12
    }),
    (err, result) => {
        if (err) console.log(err);

        console.log(JSON.stringify(result));
    }
)

database.submit(
    query.update("newCollection").to({
        stringKey: "qwerty"
    }).where({
        intKey: 12
    }),
    (err, result) => {
        if (err) console.log(err);

        console.log(result);
    }
);

database.submit(
    query.deleteFrom("newCollection").where({
        intKey: 14
    }),
    (err, result) => {
        console.log(result);
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