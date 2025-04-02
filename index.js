const express = require('express');
const path = require('path');    
const ejs = require('ejs')
const mongoose = require('mongoose')
const cookieParser = require('cookie-parser')
const methodOverride = require('method-override');
const multer = require('multer');

mongoose.connect('mongodb://127.0.0.1:27017/blogfy')
.then((e)=> console.log("MongoDB Connected"))

const Blog = require('./models/blog')

const userRoute = require('./routes/user')
const blogRoute = require('./routes/blog')
const profileRoute = require('./routes/profile');
const commentRoute = require('./routes/comments');

const { checkForAuthenticationCookie } = require('./middlewares/authentication');
const app = express();
const PORT = 8000;

app.set("view engine","ejs")
app.set("views", path.resolve( "views"));

//middleware
app.use(express.urlencoded({extended:false}))
app.use(cookieParser())
app.use(methodOverride('_method'))
app.use(checkForAuthenticationCookie("token"))
app.use(express.static(path.resolve('./public')))
app.use('/comment', commentRoute);
// app.get('/',async(req,res)=>{
//     const allBlogs = await Blog.find({});
//     return res.render('home',{
//         user: req.user,
//         blogs: allBlogs
//     });
// })
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.resolve('./public/uploads/')); // Save images in the "uploads" folder
    },
    filename: function (req, file, cb) {
        const fileName = `${Date.now()}-${file.originalname}`;
        cb(null, fileName);
    },
});

const upload = multer({ storage: storage });

// Image upload endpoint
app.post('/upload-image', upload.single('file'), (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
    }
    const imageUrl = `/uploads/${req.file.filename}`; // Return the image URL
    res.json({ location: imageUrl });
});
app.get('/', async (req, res) => {
    try {
        const blogs = await Blog.find({}).populate('createdBy');

        // Group blogs by category
        const blogsByCategory = blogs.reduce((acc, blog) => {
            if (!acc[blog.category]) {
                acc[blog.category] = [];
            }
            acc[blog.category].push(blog);
            return acc;
        }, {});

        // Define category colors
        const categoryColors = {
            Technology: '#007bff', // Blue
            Travel: '#28a745',     // Green
            Food: '#dc3545',       // Red
            Lifestyle: '#ffc107',  // Yellow
            Fashion: '#6f42c1',    // Purple
            Other: '#17a2b8',      // Cyan
        };

        return res.render('home', {
            user: req.user,
            blogsByCategory,
            categoryColors,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).send('Internal Server Error');
    }
});

app.use('/user',userRoute) 
// If any request start with /user then use `userRoute`
app.use('/blog',blogRoute) 
app.use('/profile', profileRoute);
app.listen(PORT , ()=>console.log(`Server started at PORT:${PORT}`));