const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const OpenAI = require("openai");
require("dotenv").config();

const app = express();
app.use(express.json());
app.use(cors());

// Connect to MongoDB Atlas
mongoose.connect("mongodb+srv://j8493860:xneJ5NmzY8pgbrZA@cluster0.jws7o.mongodb.net/ai_blog?retryWrites=true&w=majority&appName=Cluster0", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
}).then(() => console.log("MongoDB Connected"))
  .catch(err => console.error("MongoDB Connection Error:", err));

// Define Blog Schema
const blogSchema = new mongoose.Schema({
    title: String,
    content: String,
    createdAt: { type: Date, default: Date.now }
});
const Blog = mongoose.model("Blog", blogSchema);

// OpenAI API Configuration

const openai = new OpenAI({
    baseURL: "https://openrouter.ai/api/v1", 
    apiKey: "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",  
    defaultHeaders: {
      "HTTP-Referer": process.env.SITE_URL,  // Set in .env
      "X-Title": process.env.APP_NAME,       // Set in .env
    }
  });
// const openai = new OpenAI({ apiKey: "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" });

// Generate AI Blog Post
app.post("/generate-blog", async (req, res) => {
    try {
        const { topic } = req.body;
        const response = await openai.chat.completions.create({
            model: "mistralai/mistral-small",
            messages: [{ role: "system", content: `Write a detailed blog on ${topic}` }],
        });

        const content = response.choices[0].message.content;
        const newBlog = new Blog({ title: topic, content });
        await newBlog.save();

        res.json({ message: "Blog Created Successfully!", blog: newBlog });
    } catch (error) {
        console.error("Error generating blog:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Fetch All Blogs
app.get("/blogs", async (req, res) => {
    const blogs = await Blog.find().sort({ createdAt: -1 });
    res.json(blogs);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
