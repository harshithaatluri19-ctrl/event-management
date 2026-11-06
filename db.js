const mysql = require("mysql8");

const db = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "root",
    database: "college_events"
});

db.connect((err) => {
    if (err) {
        console.error("Database connection failed:", err.message);
        return;
    }
    console.log("Connected to College Events Database!");
});

module.exports = db;