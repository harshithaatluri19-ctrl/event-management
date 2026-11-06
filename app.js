const express = require("express");
const db = require("./db");
const multer = require("multer");
const path = require("path");
const fs = require("fs");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public")));

const uploadDir = path.join(__dirname, "public", "uploads");
fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, uploadDir),
    filename: (req, file, cb) => {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({ storage });

// Display all events
app.get("/events", (req, res) => {
    db.query("SELECT * FROM events ORDER BY event_id", (err, result) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(result);
    });
});

// Display one event
app.get("/events/:id", (req, res) => {
    db.query(
        "SELECT * FROM events WHERE event_id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.length === 0) {
                return res.status(404).json({ error: "Event not found" });
            }
            res.json(result[0]);
        }
    );
});

// Add event
app.post("/events", upload.single("photos"), (req, res) => {
    const { event_id, event_name, event_type, date, venue, description } = req.body;
    const photos = req.file ? req.file.filename : null;

    const sql = `INSERT INTO events
        (event_id, event_name, event_type, date, venue, description, photos)
        VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.query(sql,
        [event_id, event_name, event_type, date, venue, description, photos],
        (err) => {
            if (err) return res.status(400).json({ error: err.message });
            res.json({ message: "Event added successfully!" });
        }
    );
});

// Update event
app.put("/events/:id", upload.single("photos"), (req, res) => {
    const { event_name, event_type, date, venue, description } = req.body;

    let sql;
    let values;

    if (req.file) {
        sql = `UPDATE events SET event_name=?, event_type=?, date=?,
                venue=?, description=?, photos=? WHERE event_id=?`;
        values = [
            event_name, event_type, date, venue,
            description, req.file.filename, req.params.id
        ];
    } else {
        sql = `UPDATE events SET event_name=?, event_type=?, date=?,
                venue=?, description=? WHERE event_id=?`;
        values = [
            event_name, event_type, date, venue, description, req.params.id
        ];
    }

    db.query(sql, values, (err, result) => {
        if (err) return res.status(400).json({ error: err.message });
        if (result.affectedRows === 0) {
            return res.status(404).json({ error: "Event not found" });
        }
        res.json({ message: "Event updated successfully!" });
    });
});

// Delete event
app.delete("/events/:id", (req, res) => {
    db.query(
        "DELETE FROM events WHERE event_id = ?",
        [req.params.id],
        (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            if (result.affectedRows === 0) {
                return res.status(404).json({ error: "Event not found" });
            }
            res.json({ message: "Event deleted successfully!" });
        }
    );
});

// Start server
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});