const mongodb = require("mongodb");
const { getDb } = require("../util/database");

let defaultValues = {
  posts: [],
  status: "brand new",
};

class User {
  constructor(params) {
    Object.assign(this, params);
  }

  static find(param) {
    const db = getDb();
    const option = param || new Object();
    return db.collection("users").find(option).toArray();
  }

  save() {
    const db = getDb();
    if (this._id) {
      return db
        .collection("users")
        .updateOne({ _id: new mongodb.ObjectID(this._id) }, { $set: this });
    } else {
      Object.assign(this, defaultValues);
      return db.collection("users").insertOne(this);
    }
  }

  static addPost(props) {
    const db = getDb();
    const { userId } = props;
    const { postId } = props;
    let creator = props.creator;
    return User.find({ _id: new mongodb.ObjectID(userId) })
      .then((user) => {
        const userWithFunc = new User(user[0]);
        const updatedPost = [...userWithFunc.posts];
        updatedPost.push(postId);
        userWithFunc.posts = updatedPost;
        return userWithFunc.save();
      })
      .then((result) => {
        return result;
      });
  }

  static delProToUser(props) {
    const { postId, userId } = props;
    User.find({ _id: new mongodb.ObjectID(userId) })
      .then((user) => {
        const userWithFunc = new User(user[0]);
        console.log(postId);
        const index = userWithFunc.posts.indexOf(postId);
        console.log(typeof userWithFunc.posts[0]);
        console.log(index);
        userWithFunc.posts.splice(index, 1);
        return userWithFunc.save();
      })
      .then((result) => {
        return result;
      });
  }
}

module.exports = User;
