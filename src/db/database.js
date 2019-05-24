const fs = require("fs");
const query = require("./query");

exports.createDatabase = (name) => {
    return new Database(name);
}

exports.terminateDatabase = (database) => {
    database.terminate();
}

class Database {

    constructor(rootFolder) {
        this.rootFolder = rootFolder;
        this.queryQueue = [];

        // If the database ( folder ) already exists, don't override it
        if (!fs.existsSync(rootFolder)) {
            fs.mkdirSync(rootFolder);
        }
    }

    getCollectionFile(collectionName) {
        return this.rootFolder + "/" + collectionName + ".json";
    }

    /**
     * Creates a new collection ( file ) in the database ( root folder ).
     * If the collection already exists, it will not be overridden, but this will be considered an erroneous call and the result will be false.
     * @param {query.CreateCollectionQuery} createCollectionQuery Query to create the new collection
     * @param {Function} callback The callback to execute once this operation is completed.
     * - Should accept 2 parameters, one for an error, and another for the result ( a boolean ).
     * - If the operation was successful, the error will be null and the result will be true.
     * - If the operation was erroneous, the error will be non-null and the result will be false.
     */
    create(createCollectionQuery, callback) {
        const collectionFile = this.getCollectionFile(createCollectionQuery.collectionName);
        fs.exists(collectionFile, (exists) => {
            if (!exists) {
                fs.writeFileSync(collectionFile, JSON.stringify({
                    nextIndex: 0,
                    documents: []
                }));
            } else {
                callback(new query.QueryException("Collection '" + createCollectionQuery.collectionName + "' already exists."), false);
                return;
            }

            callback(null, true);
        });
    }

    /**
     * Inserts a document ( object ) into an already-existing collection ( file ).
     * @param {query.InsertQuery} insertQuery Query to insert a new document in an existing collection
     * @param {Function} callback The callback to execute once this operation is completed.
     * - Should accept 2 parameters, one for an error, and another for the result ( an integer ).
     * - If the operation was successful, the error will be null and the result will be the id of the newly inserted object.
     * - If the operation was erroneous, the error will be non-null and the result will be -1.
     */
    insert(insertQuery, callback) {
        const collection = insertQuery.collection;
        const collectionFile = this.getCollectionFile(collection);

        fs.exists(collectionFile, (exists) => {
            if (!exists) {
                callback(new query.QueryException("Collection '" + collection + "' does not exist."), null);
                return;
            }

            try {
                // Read collection data
                const data = fs.readFileSync(collectionFile);

                // Parse the json in the file to an object
                const collectionObject = JSON.parse(data);

                // Get the object that will be inserted
                const objectToInsert = insertQuery.object;

                // Create an index for it
                objectToInsert._index = collectionObject.nextIndex;

                // Iterate the next index to be used in the collection
                collectionObject.nextIndex++;

                // Push the object into the collection
                collectionObject.documents.push(objectToInsert);

                // Use the same "thread" to also write the changes to the collection
                fs.writeFileSync(collectionFile, JSON.stringify(collectionObject));

                callback(null, objectToInsert._index);
            } catch (e) {
                callback(e, -1);
                return;
            }
        });
    }

    /**
     * Selects documents ( objects ) from an already-existing collection ( file ).
     * @param {query.SelectQuery} selectQuery Query to select multiple ( or a single ) document(s) from an existing collection.
     * @param {Function} callback The callback to execute once this operation is completed.
     * - Should accept 2 parameters, one for an error, and another for the result ( an array of objects ).
     * - If the operation was successful, the error will be null and the result will be the array of objects that were found using the select query.
     * - If the operation was erroneous, the error will be non-null and the result will be an empty array.
     */
    select(selectQuery, callback) {
        console.log("Will select: " + JSON.stringify(selectQuery));
    }

    /**
     * Updates documents ( objects ) in an already-existing collection ( file ).
     * @param {query.UpdateQuery} updateQuery Query to update multiple ( or a single ) document(s) in an existing collection.
     * @param {Function} callback The callback to execute once this operation is completed.
     * - Should accept 2 parameters, one for an error, and another for the result ( an integer ).
     * - If the operation was successful, the error will be null and the result will be the number of affected documents.
     * - If the operation was erroneous, the error will be non-null and the result will be -1.
     */
    update(updateQuery, callback) {
        console.log("Will update: " + JSON.stringify(updateQuery));
    }

    /**
     * Deletes documents ( objects ) from an already-existing collection ( file ).
     * @param {query.DeleteQuery} deleteQuery Query to delete multiple ( or a single ) document(s) in an existing collection.
     * @param {Function} callback The callback to execute once this operation is completed.
     * - Should accept 2 parameters, one for an error, and another for the result ( an integer ).
     * - If the operation was successful, the error will be null and the result will be the number of deleted documents.
     * - If the operation was erroneous, the error will be non-null and the result will be -1.
     */
    delete(deleteQuery, callback) {
        console.log("Will delete: " + JSON.stringify(deleteQuery));
    }

    /**
     * Execute a query with an expected result
     * @param {*} q A query
     * @param {Function<query.QueryException,*>} callback The callback that is executed once this query has returned a result.
     * @param {Function} callback The callback to execute once this operation is completed.
     * - Should accept 2 parameters, one for an error, and another for the result ( see documentation for each database method ).
     */
    submit(q, callback) {
        if (q instanceof query.SelectQueryBuilder) {
            q = q.build();
        }

        if (q instanceof query.UpdateQueryBuilder) {
            q = q.build();
        }

        if (q instanceof query.DeleteQueryBuilder) {
            q = q.build();
        }

        if (q instanceof query.CreateCollectionQuery) {
            this.create(q, callback);
            return;
        }

        if (q instanceof query.InsertQuery) {
            this.insert(q, callback);
            return;
        }

        if (q instanceof query.UpdateQuery) {
            this.update(q, callback);
            return;
        }

        if (q instanceof query.DeleteQuery) {
            this.delete(q, callback);
            return;
        }

        if (q instanceof query.SelectQuery) {
            this.select(q, callback);
            return;
        }

        callback(new query.QueryException("Unknown query type: " + q.constructor.name), null);
    }
}

exports.Database = Database;