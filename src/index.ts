import express from "express";
import cors from "cors";
import http from "http";

import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import mongoose from "mongoose";
import Friend from "./db/Friends.js";
import Todo, { todoScheme } from "./db/Todos.js";
import "dotenv/config";

const app = express();
const httpServer = http.createServer(app);
const typeDefs = `#graphql
    scalar GraphQLDateTime

    input TodoInput {
        id:ID
        ownerId: Int
        task: String
        urgency: Int
        importance: Int
    }
    type Todo {
        id:ID
        ownerId: Int
        task: String
        urgency: Int
        importance: Int
        createAt: GraphQLDateTime
        updatedAt: GraphQLDateTime
        taskId: Int
    }
    type Mutation {
        createTask(input: TodoInput ): Todo
        removeTask(id: ID): Todo
        updateTask(input: TodoInput): Todo
    }
    type User {
            firstName: String
            lastName: String
            tel: String
            avatar: String
            nationality: String
            gender: Gender
            description: String
            email: String
            todos:[Todo]!
        }
    type Query{
        getUser : [User]!
        getTodoList : [Todo]!
    }
    enum Gender{
        MALE
        FEMALE
        OTHER
    }
`;

const resolvers = {
  Query: {
    getTodoList: async () => {
      return new Promise(async (res, rej) => {
        try {
          const todos = await Todo.find();
          res(todos);
        } catch (err) {
          rej(err);
        }
      });
    },
    getUser: async () => {
      return new Promise(async (res, rej) => {
        try {
          const friends = await Friend.aggregate([
            {
              $lookup: {
                from: "todos",
                localField: "userId",
                foreignField: "ownerId",
                as: "todos",
              },
            },
          ]).exec();
          res(friends);
        } catch (error) {
          rej(error);
        }
      });
    },
  },
  Mutation: {
    updateTask: (root, { input }) => {
      console.log("@@what is this", root);
      const { id, task, urgency, importance } = input;
      console.log("@@", id, task);
      return new Promise(async (res, rej) => {
        const filter = {
          _id: id,
        };
        const update = {
          task,
          urgency,
          importance,
        };
        try {
          const updated = await Todo.findOneAndUpdate(filter, update);
          console.log("@@@@updated??", updated);
          res(updated);
        } catch (error) {
          rej(error);
        }
      });
    },
    removeTask: (root, { taskId, id }) => {
      return new Promise(async (res, rej) => {
        try {
          const filter = {
            _id: id,
          };
          // const removedItem = Todo.find({ where: {taskId: taskId} });
          const deletedItem = await Todo.findOneAndDelete(filter);
          console.log("@@ has it been found? ", deletedItem);
          res(deletedItem);
        } catch (err) {
          rej(err);
        }
      });
    },
    createTask: (root, { input }) => {
      const { ownerId, task, urgency, importance } = input;
      const newTodo = new Todo({ ownerId, task, urgency, importance });
      newTodo.id = newTodo._id;
      return new Promise((res, rej) => {
        newTodo
          .save()
          .then((success) => res(success))
          .catch((fail) => rej(fail));
      });
    },
  },
};

const apolloServer = new ApolloServer({ resolvers, typeDefs });
await apolloServer.start();

mongoose
  .connect(process.env.DB_HOST)
  .then((res) => {
    console.log("mongodb is connected successfully");
  })
  .catch((rej) => {
    console.log("db is not connected");
  });

app.use(
  "/graphql",
  cors(),
  express.json(),
  express.urlencoded({ extended: false }),
  expressMiddleware(apolloServer)
);

await new Promise((res, rej) => {
  if (res) {
    console.log(`The server is running on the port ${process.env.PORT}`);
    return httpServer.listen({ port: process.env.PORT }, res as any);
  }
});
