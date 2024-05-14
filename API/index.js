const express = require("express")
const app = express()
const cors = require("cors")
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const cookiepars = require("cookie-parser")
const multer = require('multer')
const fs = require('fs')
const Post = require("./model/PostModel")


const salt = "thisismyjwttokenwhichidonotknowjowtoimpelemntonit"

require("./dbConnect")

const User = require("./model/UserModel")
const upload = multer({ dest: 'uploads/' })
const biouser = multer({ dest: 'userbio/' })



app.use(cors({ credentials: true, origin: "http://localhost:3000" }))
app.use(express.json())
app.use(cookiepars())
app.set(express.static("/public"))
app.use("/uploads", express.static(__dirname + "/uploads"))
var passwordValidator = require('password-validator');
const { error } = require("console")

// Create a schema
var schema = new passwordValidator();

// Add properties to it
schema
    .is().min(8)                                    // Minimum length 8
    .is().max(100)                                  // Maximum length 100
    .has().uppercase()                              // Must have uppercase letters
    .has().lowercase()                              // Must have lowercase letters
    .has().digits(2)                                // Must have at least 2 digits
    .has().not().spaces()                           // Should not have spaces
    .is().not().oneOf(['Passw0rd', 'Password123']); // Blacklist these values

app.post("/register", biouser.single('file'), async (req, res) => {
    if (req.body.password && schema.validate(req.body.password)) {
        const { username, name, email, password } = req.body
        try {
            const { originalname, path } = req.file
            const part = originalname.split('.')
            const ext = part[part.length - 1]
            const newPath = path + "." + ext
            fs.renameSync(path, newPath);
            const hash = bcrypt.hashSync(password, 12)
            const UserDoc = await User.create({
                username,
                name,
                email,
                pic: newPath,
                password: hash
            })
            res.json(UserDoc)
        } catch (error) {
            if (error.code === 11000) {
                res.status(400).json({ result: "Fail", error: "Username already exists." });
            } else {
                res.status(500).json({ result: "Fail", error: "Internal server error." });
            }
        }
    }
    else {
        res.status(400).json({ result: "Fail", error: "Invalid password format." });
    }
})


app.post("/login", async (req, res) => {
    try {
        const { username, password } = req.body
        const UserDoc = await User.findOne({ username })
        if (!UserDoc) {
            return res.status(400).json("Username and Password must be required");
        }

        const passOK = await bcrypt.compare(password, UserDoc.password)
        // console.log(passOK);
        if (passOK) {
            jwt.sign({ username, id: UserDoc._id }, salt, {}, (error, token) => {
                if (error) throw error
                res.cookie('token', token).json({
                    id: UserDoc._id,
                    username
                })
            })
        }
        else {
            res.status(400).json("wrong credentials")
        }
    } catch (error) {
        console.log(error)
        res.json({ result: "Fail", message: "Some internal server Error" })

    }
})

app.get("/profile", (req, res) => {
    let { token } = req.cookies
    jwt.verify(token, salt, (err, payload) => {
        if (!err) {
            let userId = payload.id;
            User.findById(userId, "-password").then((user) => {
                if (!user) return res.status(400).send("No such user.")
                res.json(user)
            }).catch((e) => console.log(e));
        } else {
            res.redirect('/login')
        }
    })
});

app.post("/logout", (req, res) => {
    res.cookie("token", "").json("ok")
    res.redirect('/login')
})

app.post("/post", upload.single("file"), async (req, res) => {
    try {
        const { originalname, path } = req.file
        const part = originalname.split('.')
        const ext = part[part.length - 1]
        const newPath = path + "." + ext
        fs.renameSync(path, newPath);

        let { token } = req.cookies
        jwt.verify(token, salt, async (err, payload) => {
            if (!err) {
                const { title, summary, content, bio } = req.body

                const postDoc = await Post.create({
                    title,
                    summary,
                    content,
                    bio,
                    pic: newPath,
                    author: payload.id
                })
                res.json({ result: 'Done', message: "Done", data: postDoc })

            }
        })


    } catch (error) {
        // console.log('Error : ', error)
        res.status(500).json({ Result: "Fail", message: "Some internal server error" })
    }
})
app.get('/post', async (req, res) => {
    try {
        let data = await Post.find().populate('author', ['username']).sort({ _id: -1 }).limit(20)
        // console.log(data)
        if (data) {
            res.json({ Result: "Done", data: data })
        }
        else {
            res.json({ Result: "fail", message: "No Users Found" })
        }
    } catch (error) {
        res.json({ Result: "Fail", message: "Some internal server Error" })
    }
})

app.get('/post/:id', async (req, res) => {
    const data = await Post.findOne({ _id: req.params.id }).populate('author', ['username'])
    // console.log(data.author.username)
    res.send(data)
})

app.put("/post", upload.single("file"), async (req, res) => {
    try {
        let newPath = null
        if (req.file) {
            const { originalname, path } = req.file
            const part = originalname.split('.')
            const ext = part[part.length - 1]
            const newPath = path + "." + ext
            fs.renameSync(path, newPath);
        }

        let { token } = req.cookies
        jwt.verify(token, salt, async (err, payload) => {
            if (!err) {
                const { id,title, summary, content, bio } = req.body

                const postDoc = await  Post.findOne(id)
                await postDoc.update({
                    title,
                    summary,
                    content,
                    bio,
                    pic: newPath ? newPath: postDoc.pic
                })
                res.json({ result: 'Done', message: "Done", data: postDoc })

            }
        })


    } catch (error) {
        // console.log('Error : ', error)
        res.status(500).json({ Result: "Fail", message: "Some internal server error" })
    }
})

app.listen(8000, () => console.log("server is running at http://localhost:8000"))
