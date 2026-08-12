import "dotenv/config";
import mongoose from "mongoose";

try {
    console.log("Connecting to MongoDB Atlas...");

    const connection = await mongoose.connect(
        process.env.MONGODB_URI,
        {
            serverSelectionTimeoutMS: 15000,
            family: 4,
        }
    );

    console.log("CONNECTED");
    console.log(
        "Database:",
        connection.connection.db.databaseName
    );
    console.log(
        "Host:",
        connection.connection.host
    );

    await mongoose.disconnect();

} catch (error) {

    console.error("CONNECTION FAILED");
    console.error(error);

}