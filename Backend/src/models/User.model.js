const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: [true, 'Le nom d\'utilisateur est requis'],
    unique: true,
    trim: true,
    minlength: [3, 'Le nom d\'utilisateur doit contenir au moins 3 caractères'],
    maxlength: [50, 'Le nom d\'utilisateur ne peut pas dépasser 50 caractères']
  },
  email: {
    type: String,
    required: [true, 'L\'email est requis'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Email invalide']
  },
  password: {
    type: String,
    required: [true, 'Le mot de passe est requis'],
    minlength: [6, 'Le mot de passe doit contenir au moins 6 caractères'],
    select: false // Ne pas retourner le mot de passe par défaut
  },
  role: {
    type: String,
    enum: {
      values: ['ADMIN', 'EDITOR', 'AUTHOR', 'READER'],
      message: '{VALUE} n\'est pas un rôle valide'
    },
    default: 'READER'
  },
  avatar: {
    type: String,
    default: 'https://via.placeholder.com/150'
  },
  isActive: {
    type: Boolean,
    default: true
  },
  bio: {
    type: String,
    maxlength: [500, 'La bio ne peut pas dépasser 500 caractères']
  },
  socialLinks: {
    twitter: String,
    linkedin: String,
    github: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Index pour optimisation (éviter doublons avec champs uniques)
userSchema.index({ role: 1 });

// Virtual pour le nombre d'articles
userSchema.virtual('articlesCount', {
  ref: 'Article',
  localField: '_id',
  foreignField: 'author',
  count: true
});

// Middleware pre-save : Hasher le mot de passe avant sauvegarde
userSchema.pre('save', async function(next) {
  // Ne hasher que si le mot de passe a été modifié
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Méthode pour comparer les mots de passe
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Erreur lors de la comparaison des mots de passe');
  }
};

// Méthode pour obtenir les infos publiques
userSchema.methods.toPublicJSON = function() {
  return {
    id: this._id,
    username: this.username,
    email: this.email,
    role: this.role,
    avatar: this.avatar,
    bio: this.bio,
    socialLinks: this.socialLinks,
    createdAt: this.createdAt
  };
};

// Méthode pour vérifier les permissions
userSchema.methods.hasRole = function(roles) {
  if (Array.isArray(roles)) {
    return roles.includes(this.role);
  }
  return this.role === roles;
};

userSchema.methods.canEditArticle = function(article) {
  if (this.role === 'ADMIN' || this.role === 'EDITOR') {
    return true;
  }
  if (this.role === 'AUTHOR' && article.author.toString() === this._id.toString()) {
    return true;
  }
  return false;
};

userSchema.methods.canDeleteArticle = function(article) {
  return this.role === 'ADMIN';
};

module.exports = mongoose.model('User', userSchema);