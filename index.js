import express from "express";

const app = express();
app.use(express.json());

app.get("/", (req, res) => {
  res.status(200).json({ success: true, message: "Server Started" });
});

app.listen(3000, function () {
  console.log("Server Started");
  console.log("http://localhost:3000");
});
