import mongoose from "mongoose";

async function DBConnect() {
  try {
    const dbconnection = await mongoose.connect(`${process.env.MONGODB_URL}`);
    console.log(`MondoDb connected securely: ${dbconnection.connection.host}`);
  } catch (error) {
    console.log("mongodb faied to connect: ", error);
  }
}

export { DBConnect };
