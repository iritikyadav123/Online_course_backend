 

const zod = require("zod");

// define the strucer of admin data

const adminSchema = zod.object({
  username : zod.string().email(),
  password : zod.string().min(4)
})

//define the structure of course

const courseSchema = zod.object({
  title : zod.string(),
  description : zod.string(),
  price : zod.number(),
  imageLink : zod.string(),
})
const userSchema = zod.object({
  username : zod.string().email(),
  password : zod.string().min(4)
})
 module.exports={
   adminSchema,
   courseSchema,
   userSchema
 }