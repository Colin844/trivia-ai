import { User } from "../models/users.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";

const JWT_SECRET = process.env.JWT_SECRET || "dev_secret";

// Fonction de validation d'email simple
const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

const userController = {
  // Inscription
  async register(req, res) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password)
        return res.status(400).json({ error: "Tous les champs sont requis." });
      const existing = await User.findOne({ where: { email } });
      if (existing)
        return res.status(409).json({ error: "Email déjà utilisé." });
      const hash = await bcrypt.hash(password, 10);
      const user = await User.create({ name, email, password_hash: hash });
      return res
        .status(201)
        .json({ id: user.id, name: user.name, email: user.email });
    } catch (err) {
      return res.status(500).json({ error: String(err.message || err) });
    }
  },

  // Connexion
  async login(req, res) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res
          .status(400)
          .json({ message: "Email and password are required" });
      }
      if (!validateEmail(email)) {
        return res.status(400).json({ message: "Invalid email format" });
      }

      const user = await User.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      if (!user.is_active) {
        return res.status(401).json({ message: "Account is deactivated" });
      }

      const isPasswordValid = await bcrypt.compare(
        password,
        user.password_hash
      );
      if (!isPasswordValid) {
        return res.status(401).json({ message: "Invalid credentials" });
      }

      const token = jwt.sign({ id: user.id, email: user.email }, JWT_SECRET, {
        expiresIn: "1d",
      });

      res.status(200).json({
        message: "Login successful",
        username: user.name, // Only return username
        token,
      });
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error during login" });
    }
  },

  // Profil par ID
  async getUserById(req, res) {
    try {
      const userId = req.params.id;
      if (!userId || isNaN(parseInt(userId))) {
        return res.status(400).json({ message: "Invalid user ID" });
      }

      const user = await User.findByPk(userId, {
        attributes: ["id", "name", "email"],
      });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      res.status(200).json({ user });
    } catch (error) {
      console.error("Get user by ID error:", error);
      res.status(500).json({ message: "Server error" });
    }
  },

  // Mise à jour
  async updateUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      if (req.user.id !== user.id)
        return res.status(403).json({ error: "Accès refusé." });
      const { name, email, password } = req.body;
      if (name) user.name = name;
      if (email) user.email = email;
      if (password) user.password_hash = await bcrypt.hash(password, 10);
      await user.save();
      return res.json({
        id: user.id,
        name: user.name,
        email: user.email,
      });
    } catch (err) {
      return res.status(500).json({ error: String(err.message || err) });
    }
  },

  // Suppression
  async deleteUserById(req, res) {
    try {
      const user = await User.findByPk(req.params.id);
      if (!user)
        return res.status(404).json({ error: "Utilisateur non trouvé." });
      if (req.user.id !== user.id)
        return res.status(403).json({ error: "Accès refusé." });
      await user.destroy();
      return res.json({ ok: true });
    } catch (err) {
      return res.status(500).json({ error: String(err.message || err) });
    }
  },
};

export default userController;
