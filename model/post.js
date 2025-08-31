const mongoose = require('mongoose');


const postSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    likes:[{
      type:mongoose.Schema.Types.ObjectId,ref:"model"
    }]
   
  },
  { timestamps: true } // adds createdAt & updatedAt automatically
);



 module.exports = mongoose.model("post",postSchema)