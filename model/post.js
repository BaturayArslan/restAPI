const mongodb = require("mongodb");
const { getDb } = require("../util/database");

const defaultValues = {
  createdAt: new Date(),
};

class Post {
  constructor(params) {
    Object.assign(this, params);
  }

  save() {
    const db = getDb();
    Object.filter = (obj, predicate) =>
      Object.assign(
        ...Object.keys(obj)
          .filter((key) => predicate(obj[key]))
          .map((key) => ({ [key]: obj[key] }))
      );
    const tmp = Object.filter(this, (value) => value);

    if (this._id) {
      // UPDATE OPP
      return db
        .collection("posts")
        .updateOne({ _id: new mongodb.ObjectID(this._id) }, { $set: tmp });
    }
    // save new record
    Object.assign(this, defaultValues);
    return db.collection("posts").insertOne(this);
  }

  static find(param) {
    const db = getDb();
    const option = param || new Object();
    return db.collection("posts").find(option);
  }

  static delete(postId) {
    const db = getDb();
    return db
      .collection("posts")
      .deleteOne({ _id: new mongodb.ObjectID(postId) });
  }

  static count() {
    const db = getDb();

    return db.collection("posts").countDocuments({});
  }
}

module.exports = Post;
