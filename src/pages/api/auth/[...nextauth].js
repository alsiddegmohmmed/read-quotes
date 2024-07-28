import NextAuth from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import { connectToDatabase } from "../../../../lib/mongodb.js";
import { MongoDBAdapter } from "@next-auth/mongodb-adapter";

const options = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    // Add more providers here
  ],
  adapter: MongoDBAdapter(connectToDatabase),
  session: {
    jwt: true,
  },
  callbacks: {
    async session(session, user) {
      session.userId = user.id;
      return session;
    },
    async jwt(token, user) {
      if (user) {
        token.id = user.id;
      }
      return token;
    },
  },
};

const authHandler = (req, res) => NextAuth(req, res, options);
export default authHandler;