const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = mongoose.Schema(
  {
    name: { type: 'String', required: true },
    email: { type: 'String', unique: true, required: true, unique: true },
    password: { type: 'String', required: true },
    pic: {
      type: 'String',
      default: 'https://cdn-icons-png.flaticon.com/512/2202/2202112.png',
    },
    phone: { type: 'String', required: true, unique: true },
    isAdmin: {
      type: Boolean,
      required: true,
      default: false,
    },
    contacts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
  },
  { timestamps: true },
)

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password)
}

userSchema.pre('save', async function (next) {
  if (!this.isModified) {
    next()
  }

  const salt = await bcrypt.genSalt(10)
  this.password = await bcrypt.hash(this.password, salt)
})

const User = mongoose.model('User', userSchema)

module.exports = User
