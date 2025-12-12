
import dotenv from 'dotenv';
dotenv.config();

console.log("Checking Environment Variables...");
if (process.env.GOOGLE_CLIENT_ID) {
    console.log("GOOGLE_CLIENT_ID: Present (Length: " + process.env.GOOGLE_CLIENT_ID.length + ")");
    console.log("GOOGLE_CLIENT_ID Starts with: " + process.env.GOOGLE_CLIENT_ID.substring(0, 5) + "...");
} else {
    console.error("GOOGLE_CLIENT_ID: MISSING");
}

if (process.env.GOOGLE_CLIENT_SECRET) {
    console.log("GOOGLE_CLIENT_SECRET: Present");
} else {
    console.error("GOOGLE_CLIENT_SECRET: MISSING");
}

if (process.env.NEXTAUTH_URL) {
    console.log("NEXTAUTH_URL: " + process.env.NEXTAUTH_URL);
} else {
    console.error("NEXTAUTH_URL: MISSING");
}
