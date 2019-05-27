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
        return `${this.rootFolder}/${collectionName}.json`;
    }

    createEmptyCollection(collectionName) {
        const collectionFile = this.getCollectionFile(collectionName);
        fs.writeFileSync(collectionFile, JSON.stringify({
            nextIndex: 0,
            documents: []
        }));
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
                this.createEmptyCollection(collection);
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
        const collection = selectQuery.collection;
        const collectionFile = this.getCollectionFile(collection);

        fs.exists(collectionFile, (exists) => {
            if (!exists) {
                callback(new query.QueryException(`Collection ${collection} does not exist.`));
            } else {
                // Read collection data
                const data = fs.readFileSync(collectionFile);

                // Parse the json in the file to an object
                const collectionObject = JSON.parse(data);

                const result = [];

                // Optimize select by index
                // If an index field is found on the filter, get the document by its index and filter it to make sure it meets other criteria
                if (selectQuery.filter.index) {
                    const objectByIndex = collectionObject.documents[selectQuery.filter.index];

                    if (objectByIndex) {
                        result.push(collectionObject.documents[selectQuery.filter.index]);
                    }

                    callback(null, result);
                    return;
                }

                // Iterate over each document in the collection
                // Filter each one, and if the document matches the filter, add it to the result array
                collectionObject.documents.forEach((document) => {
                    if (this.filterDocument(document, selectQuery.filter)) {
                        result.push(document);
                    }
                });

                callback(null, result);
            }
        });
    }

    filterDocument(document, filter) {
        var result = true;

        for (const key in filter) {
            if (!result) {
                return false;
            }

            if (document[key]) {
                if (document[key].constructor == Object && filter[key].constructor == Object) {
                    result = this.filterDocument(document[key], filter[key]);
                } else {
                    result = document[key] === filter[key];
                }
            } else {
                result = false;
            }
        }

        return result;
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
        const collection = updateQuery.collection;
        const collectionFile = this.getCollectionFile(collection);
        fs.exists(collectionFile, (exists) => {
            if (!exists) {
                callback(new query.QueryException(`Collection ${collection} does not exist.`));
            } else {
                // Read collection data
                const data = fs.readFileSync(collectionFile);

                // Parse the json in the file to an object
                const collectionObject = JSON.parse(data);

                const result = [];

                // Optimize select by index
                // If an index field is found on the filter, get the document by its index and filter it to make sure it meets other criteria
                if (updateQuery.filter.index) {
                    const objectByIndex = collectionObject.documents[updateQuery.filter.index];

                    if (objectByIndex) {
                        for (var key in updateQuery.value) {
                            document[key] = updateQuery.value[key];
                        }
                        
                        affectedDocuments++;
                    }

                    callback(null, 1);
                    return;
                }

                var affectedDocuments = 0;

                // Iterate over each document in the collection
                // Filter each one, and if the document matches the filter, update it
                collectionObject.documents.forEach((document) => {
                    if (this.filterDocument(document, updateQuery.filter)) {
                        for (var key in updateQuery.value) {
                            document[key] = updateQuery.value[key];
                        }
                        
                        affectedDocuments++;
                    }
                });

                // Use the same "thread" to also write the changes to the collection
                fs.writeFileSync(collectionFile, JSON.stringify(collectionObject));

                callback(null, affectedDocuments);
            }
        });
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
        const collection = deleteQuery.collection;
        const collectionFile = this.getCollectionFile(collection);
        fs.exists(collectionFile, (exists) => {
            if (!exists) {
                callback(new query.QueryException(`Collection ${collection} does not exist.`));
            } else {
                // Read collection data
                const data = fs.readFileSync(collectionFile);

                // Parse the json in the file to an object
                const collectionObject = JSON.parse(data);

                // Iterate over each document in the collection
                // Filter each one, and if the document matches does not match filter, remove it
                collectionObject.documents = collectionObject.documents.filter(obj => !this.filterDocument(obj, deleteQuery.filter));

                // Use the same "thread" to also write the changes to the collection
                fs.writeFileSync(collectionFile, JSON.stringify(collectionObject));

                callback(null, 0);
            }
        });
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