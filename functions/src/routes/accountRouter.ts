import express from "express";
import { getClient } from "../db";
import Account from "../models/Account";
import { ObjectId } from "mongodb";
import LogInCreds from "../models/LogInCreds";

const accountRouter = express.Router();

const errorResponse = (error: any, res: any) => {
  console.error("FAIL", error);
  res.status(500).json({ message: "Internal Server Error" });
};

accountRouter.get("/check/:uid", async (req, res) => {
  const uid: string = req.params.uid;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Account>("accounts")
      .findOne({ uid });
    res.json(result);
  } catch (err) {
    errorResponse(err, res);
  }
});
accountRouter.get("/login", async (req, res) => {
  const { email, userName, password } = req.query;
  const search: LogInCreds = {
    password: password as string,
  };
  if (userName) {
    search.userName = userName as string;
  }
  if (email) {
    search.email = email as string;
  }

  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Account>("accounts")
      .findOne(search);
    if (result) {
      res.json(result);
    } else {
      res.json({ message: `not able to log in with: ${search}` });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});
accountRouter.post("/", async (req, res) => {
  const newAccount: Account = req.body;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Account>("accounts")
      .insertOne(newAccount);
    if (result.insertedId) {
      res.json(newAccount);
    } else {
      res.status(404).json({ message: "not added" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});
accountRouter.put("/:uid", async (req, res) => {
  const uid: string = req.params.uid;
  const updatedAccount = req.body;
  const id = updatedAccount._id;
  delete updatedAccount._id;
  try {
    const client = await getClient();
    const result = await client
      .db()
      .collection<Account>("accounts")
      .replaceOne({ uid }, updatedAccount);
    if (result.modifiedCount) {
      updatedAccount._id = new ObjectId(id);
      res.json(updatedAccount);
    } else {
      res.status(404).json({ message: "account not found" });
    }
  } catch (err) {
    errorResponse(err, res);
  }
});

export default accountRouter;
