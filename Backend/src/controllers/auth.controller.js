const jwt = require("jsonwebtoken");
const User = require("../models/User.model");
const RefreshToken = require("../models/RefreshToken.model");

const crypto = require("crypto");

const hashToken = (token) =>
  crypto.createHash("sha256").update(token).digest("hex");

const jwtCommonOpts = {
  issuer: process.env.JWT_ISS || "blog-api",
  audience: process.env.JWT_AUD || "blog-client",
};

const generateTokens = (user) => {
  const accessToken = jwt.sign(
    { id: user._id, role: user.role, username: user.username },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || "2h", ...jwtCommonOpts }
  );
  const refreshToken = jwt.sign(
    { id: user._id },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRE || "30d", ...jwtCommonOpts }
  );
  return { accessToken, refreshToken };
};

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;
    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message:
          existingUser.email === email
            ? "Email déjà utilisé"
            : "Username déjà pris",
      });
    }
    const user = await User.create({
      username,
      email,
      password,
      role: role || "READER",
    });
    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      token: hashToken(refreshToken),
      user: user._id,
      expiresAt,
      createdByIp: req.ip,
    });
    res.status(201).json({
      success: true,
      message: "Inscription réussie",
      data: { user: user.toPublicJSON(), accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Erreur register:", error);
    res.status(500).json({
      success: false,
      message: "Erreur inscription",
      error: error.message,
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).select("+password");
    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passe incorrect" });
    }
    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Compte désactivé" });
    }
    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ success: false, message: "Email ou mot de passe incorrect" });
    }
    const { accessToken, refreshToken } = generateTokens(user);
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    await RefreshToken.create({
      token: hashToken(refreshToken),
      user: user._id,
      expiresAt,
      createdByIp: req.ip,
    });
    res.json({
      success: true,
      message: "Connexion réussie",
      data: { user: user.toPublicJSON(), accessToken, refreshToken },
    });
  } catch (error) {
    console.error("Erreur login:", error);
    res.status(500).json({
      success: false,
      message: "Erreur connexion",
      error: error.message,
    });
  }
};

const refreshToken = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (!token)
      return res
        .status(400)
        .json({ success: false, message: "Refresh token manquant" });
    const decoded = jwt.verify(
      token,
      process.env.REFRESH_TOKEN_SECRET,
      jwtCommonOpts
    );
    const hashed = hashToken(token);
    const storedToken = await RefreshToken.findOne({
      token: hashed,
      user: decoded.id,
    });
    if (!storedToken || !storedToken.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token invalide" });
    }
    const user = await User.findById(decoded.id);
    if (!user || !user.isActive) {
      return res
        .status(401)
        .json({ success: false, message: "Utilisateur non trouvé" });
    }
    // Rotate refresh token: revoke current and issue new
    storedToken.revokedAt = new Date();
    storedToken.revokedByIp = req.ip;
    const { refreshToken: newRefreshToken, accessToken } = generateTokens(user);
    storedToken.replacedByToken = hashToken(newRefreshToken);
    await storedToken.save();

    const newExpiresAt = new Date();
    newExpiresAt.setDate(newExpiresAt.getDate() + 30);
    await RefreshToken.create({
      token: hashToken(newRefreshToken),
      user: user._id,
      expiresAt: newExpiresAt,
      createdByIp: req.ip,
    });

    const accessTokenSigned = jwt.sign(
      { id: user._id, role: user.role, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRE || "2h", ...jwtCommonOpts }
    );
    res.json({
      success: true,
      data: { accessToken: accessTokenSigned, refreshToken: newRefreshToken },
    });
  } catch (error) {
    res.status(401).json({ success: false, message: "Refresh token invalide" });
  }
};

const logout = async (req, res) => {
  try {
    const { refreshToken: token } = req.body;
    if (token) {
      await RefreshToken.findOneAndUpdate(
        { token: hashToken(token) },
        { revokedAt: new Date(), revokedByIp: req.ip }
      );
    }
    res.json({ success: true, message: "Déconnexion réussie" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur déconnexion" });
  }
};

const getProfile = async (req, res) => {
  try {
    res.json({ success: true, data: { user: req.user.toPublicJSON() } });
  } catch (error) {
    res.status(500).json({ success: false, message: "Erreur" });
  }
};

module.exports = { register, login, refreshToken, logout, getProfile };
