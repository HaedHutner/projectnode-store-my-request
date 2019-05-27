exports.selectFrom = (collection) => {
    return new SelectQueryBuilder(collection);
}

exports.insertInto = (collection, object) => {
    return new InsertQuery(collection, object);
}

exports.update = (collection) => {
    return new UpdateQueryBuilder(collection);
}

exports.deleteAllFrom = (collection) => {
    return new DeleteQuery(collection, undefined);
}

exports.deleteFrom = (collection) => {
    return new DeleteQueryBuilder(collection);
}

exports.createCollection = (name) => {
    return new CreateCollectionQuery(name);
}

class CreateCollectionQuery {

    constructor(collectionName) {
        this._collectionName = collectionName;
    }

    get collectionName() {
        return this._collectionName;
    }

}

class SelectQuery {

    constructor(collection, filter) {
        this._collection = collection;
        this._filter = filter;
    }

    get collection() {
        return this._collection;
    }

    get filter() {
        return this._filter;
    }

}

class InsertQuery {

    constructor(collection, object) {
        this._collection = collection;
        this._object = object;
    }

    get collection() {
        return this._collection;
    }

    get object() {
        return this._object;
    }

}

class UpdateQuery {

    constructor(collection, filter, value) {
        this._collection = collection;
        this._filter = filter;
        this._value = value;
    }

    get collection() {
        return this._collection;
    }

    get filter() {
        return this._filter;
    }

    get value() {
        return this._value;
    }

}

class DeleteQuery {

    constructor(collection, filter) {
        this._collection = collection;
        this._filter = filter;
    }

    get collection() {
        return this._collection;
    }

    get filter() {
        return this._filter;
    }

}

class SelectQueryBuilder {

    constructor(collection) {
        this._collection = collection;
    }

    where(filter) {
        this._filter = filter;
        return new SelectQuery(this._collection, this._filter);
    }

    build() {
        return new SelectQuery(this._collection, this._filter);
    }

}

class UpdateQueryBuilder {

    constructor(collection) {
        this._collection = collection;
    }

    to(value) {
        this._value = value;
        return this;
    }

    where(filter) {
        this._filter = filter;
        return new UpdateQuery(this._collection, this._filter, this._value);
    }

    build() {
        return new UpdateQuery(this._collection, this._filter, this._value);
    }

}

class DeleteQueryBuilder {
    
    constructor(collection) {
        this._collection = collection;
    }

    where(filter) {
        this._filter = filter;
        return new DeleteQuery(this._collection, this._filter);
    }

    build() {
        return new DeleteQuery(this._collection, this._filter);
    }

}

class QueryException {
    constructor(message) {
        this._message = "Query Exception: " + message;
    }

    get message() {
        return this._message;
    }
}

exports.CreateCollectionQuery = CreateCollectionQuery;
exports.InsertQuery = InsertQuery;
exports.SelectQuery = SelectQuery;
exports.SelectQueryBuilder = SelectQueryBuilder;
exports.UpdateQuery = UpdateQuery;
exports.UpdateQueryBuilder = UpdateQueryBuilder;
exports.DeleteQuery = DeleteQuery;
exports.DeleteQueryBuilder = DeleteQueryBuilder;
exports.QueryException = QueryException;

