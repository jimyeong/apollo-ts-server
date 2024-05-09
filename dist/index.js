import express from "express";
import cors from "cors";
import http from "http";
import { ApolloServer } from "@apollo/server";
import { expressMiddleware } from "@apollo/server/express4";
import mongoose from "mongoose";
import Friend from "./db/Friends.js";
import "dotenv/config";
const app = express();
const httpServer = http.createServer(app);
const resolvers = {
    Query: {
        getUser: async () => {
            return new Promise(async (res, rej) => {
                try {
                    const friends = await Friend.find();
                    console.log("@@friends", friends);
                    res(friends);
                }
                catch (error) {
                    rej(error);
                }
            });
            return [
                {
                    firstName: "JIMYEONG",
                    lastName: "JUNG",
                    tel: "+4407496927449",
                    avatar: "",
                    nationality: "korean",
                    gender: "MALE",
                    email: "idjjm92@gmail.com",
                },
            ];
        },
    },
};
const typeDefs = `#graphql
    type User {
            firstName: String
            lastName: String
            tel: String
            avatar: String
            nationality: String
            gender: Gender
            description: String
            email: String
        }
    type Query{
        getUser : [User]!
    }
    enum Gender{
        MALE
        FEMALE
        OTHER
    }
`;
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
app.use("/graphql", cors(), express.json(), express.urlencoded({ extended: false }), expressMiddleware(apolloServer));
await new Promise((res, rej) => {
    if (res) {
        console.log(`The server is running on the port ${process.env.PORT}`);
        return httpServer.listen({ port: process.env.PORT }, res);
    }
});
