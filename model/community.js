const mongoose = require('mongoose');
const crypto = require('crypto');

const communitySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    minlength: 3,
    maxlength: 50
  },
  description: {
    type: String,
    trim: true,
    maxlength: 500
  },
  slug: {
    type: String,
    unique: true,
    lowercase: true
  },
  coverImage: {
    type: String,
    default: ''
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  members: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'user'
    },
    role: {
      type: String,
      enum: ['admin', 'moderator', 'member'],
      default: 'member'
    },
    joinedAt: {
      type: Date,
      default: Date.now
    }
  }],
  isPrivate: {
    type: Boolean,
    default: false
  },
  joinLink: {
    type: String,
    unique: true
  },
  prompts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'post'
  }],
  memberCount: {
    type: Number,
    default: 1
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

communitySchema.pre('save', function(next) {
  if (!this.slug) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-');
  }
  if (!this.joinLink) {
    this.joinLink = Math.random().toString(36).substring(2, 18) + Math.random().toString(36).substring(2, 18);
  }
  next();
});

communitySchema.methods.addMember = function(userId, role = 'member') {
  const isMember = this.members.some(m => m.user.toString() === userId.toString());
  if (!isMember) {
    this.members.push({ user: userId, role });
    this.memberCount += 1;
  }
  return this.save();
};

communitySchema.methods.removeMember = function(userId) {
  this.members = this.members.filter(m => m.user.toString() !== userId.toString());
  this.memberCount = Math.max(0, this.memberCount - 1);
  return this.save();
};

communitySchema.methods.isMember = function(userId) {
  return this.members.some(m => m.user.toString() === userId.toString());
};

communitySchema.methods.isAdmin = function(userId) {
  const member = this.members.find(m => m.user.toString() === userId.toString());
  return member && (member.role === 'admin' || member.role === 'moderator');
};

module.exports = mongoose.model('Community', communitySchema);