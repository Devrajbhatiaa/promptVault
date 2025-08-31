const express = require('express');
 const app = express();
 const path = require('path');
const userModel = require('./model/model')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const cookieParser= require('cookie-parser');
const postModel = require('./model/post');
const ejs = require('ejs');
const PORT = 5033;
app.use(express.urlencoded());

app.set('view engine','ejs');
app.set ('views',path.join(__dirname,'views'))
app.use(cookieParser());
app.use(express.json());

app.get('/signin',(req,res)=>{
res.render('signin')});

app.get('/form',isLoggedin,(req,res)=>{
res.render('form')
})
app.get('/post',isLoggedin,(req,res)=>{
  res.render('addprompt')
})

app.get('/home', isLoggedin, async (req, res) => {
  let user = await userModel.findOne({ email: req.user.email }).populate('post');
  res.render('home', { prompts: user.post , user:user});
});



app.post('/signin',async (req,res)=>{ 
  
 let {email, password, name, username, age} = req.body;
 let user = await userModel.findOne({email});
 if(user) return res.send("User already exists");

 bcrypt.hash(password,4,async function(err,result){
   let createdUser = await userModel.create({
     email,
     password: result,
     name,
     username,
     age
   })

   console.log(createdUser);
   let token = jwt.sign({email},"shhhh");
   res.cookie('token', token);
   res.redirect("./login")
 })


})

app.get('/login',async (req,res)=>{
   await res.render('login');
});

app.post('/login',async(req,res)=>{
  let {email,password} = req.body;
  let user = await userModel.findOne({email});
  if(!user) return res.status(400).send('User not found');
  else 
    bcrypt.compare(password,user.password, function(err,result) {
  if(result) {
   
 let token = jwt.sign({email},"shhhh");
   res.cookie('token', token);
    res.redirect("/profile");
  } 
  else{
    res.send('Invalid Credentials');
  }
  })

    //...
})


app.get('/profile',isLoggedin, async(req,res)=>{
  const user = await userModel.findOne({email:req.user.email})
res.render('profile',{user})
})
app.get('/like/:_id',isLoggedin, async(req,res)=>{
  const post = await postModel.findOne({_id:req.params.id}).populate("user");

console.log(post)
  post.likes.push(req.user.userid);

 await post.save()
})

function isLoggedin(req,res,next) {
  if(!req.cookies.token) {
    // if no token found
    return res.send('you mustr  login  first');
  }
  else{
    try{
      const data  = jwt.verify(req.cookies.token,"shhhh");
      req.user = data;
      next();
    }catch(err){
      res.clearCookie("token");
      return res.redirect('/signin');
    }
  }
}

app.post('/post',isLoggedin,async (req,res)=>{
  let user = await userModel.findOne({email:req.user.email})
  user.populate('post');
let  { title, content } = req.body;
 let post = await postModel.create({
    user:user._id,
    title:title,
    content:content

  })
  
user.post.push(post._id)
await user.save();
res.redirect('/home')
})

app.get('/logout',(req,res)=>{
try{
 res.clearCookie("token", );
 res.redirect('/signin')


}

catch (error){
res.status(200).json({message:'internal error'})
}
})

app.get('/',(req,res)=>{
  res.send('jj')
})
 app.listen(PORT,(req,res)=>{
  console.log('server is running on the port ');
 })