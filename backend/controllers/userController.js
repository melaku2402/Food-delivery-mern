import userModel from "../models/userModel.js";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import validator from "validator";

// 10 is the OWASP minimum and keeps login quick on small free-tier servers.
const SALT_ROUNDS = 10;

// Compared against when an email isn't found, so a wrong email and a wrong
// password take about the same time and can't be told apart.
const DUMMY_HASH = bcrypt.hashSync("not-a-real-password", SALT_ROUNDS);

const NAME_RE = /^[\p{L}\p{M}][\p{L}\p{M}\s'.-]*$/u; // any language (Amharic, English, ...)

const createToken = (id, extra = {}) =>
  jwt.sign({ id: String(id), ...extra }, process.env.JWT_SECRET, {
    algorithm: "HS256",
    expiresIn: process.env.JWT_EXPIRES_IN || "1d",
  });

const fail = (res, status, message, errors) =>
  res.status(status).json({ success: false, message, ...(errors && { errors }) });

// Only plain strings are accepted. An object like { "$ne": null } in the email
// field would otherwise reach the database query (NoSQL injection).
const readEmail = (value) =>
  typeof value === "string" ? value.trim().toLowerCase() : "";
const readName = (value) =>
  typeof value === "string" ? value.replace(/\s+/g, " ").trim() : "";

// Emails are stored lowercase. Accounts created before that rule may have capital
// letters, so if there is no exact match, look once more ignoring case.
const findByEmail = async (email) => {
  const exact = await userModel.findOne({ email }).select("+password");
  if (exact) return exact;
  return userModel
    .findOne({ email })
    .collation({ locale: "en", strength: 2 })
    .select("+password");
};

const publicUser = (name, email) => ({ name, email });

// Login user
const loginUser = async (req, res) => {
  const email = readEmail(req.body?.email);
  const password = req.body?.password;

  const errors = {};
  if (!email) errors.email = "Enter your email address.";
  if (typeof password !== "string" || !password)
    errors.password = "Enter your password.";
  if (Object.keys(errors).length) {
    return fail(res, 400, "Please fill in all fields.", errors);
  }

  try {
    const user = await findByEmail(email);

    // Always run the comparison, even for an unknown email (see DUMMY_HASH).
    const isMatch = await bcrypt.compare(
      password,
      user?.password || DUMMY_HASH
    );

    // One message for both cases, so nobody can check which emails are registered.
    if (!user || !isMatch) {
      return fail(res, 401, "Incorrect email or password.");
    }

    // Older accounts may have a capitalised email. Save it lowercase now.
    if (user.email !== email) {
      await userModel.updateOne({ _id: user._id }, { email }).catch(() => {});
    }

    return res.json({
      success: true,
      token: createToken(user._id),
      user: publicUser(user.name, email),
    });
  } catch (error) {
    console.error("Login failed:", error);
    return fail(res, 500, "Something went wrong. Please try again.");
  }
};

// Register a new user
const registerUser = async (req, res) => {
  const name = readName(req.body?.name);
  const email = readEmail(req.body?.email);
  const password = req.body?.password;

  const errors = {};

  if (!name) errors.name = "Enter your name.";
  else if (name.length < 2 || name.length > 50)
    errors.name = "Name must be 2 to 50 characters.";
  else if (!NAME_RE.test(name))
    errors.name = "Use letters only (spaces, - and ' are allowed).";

  if (!email) errors.email = "Enter your email address.";
  else if (email.length > 254 || !validator.isEmail(email))
    errors.email = "Enter a valid email address.";

  if (typeof password !== "string" || !password)
    errors.password = "Enter a password.";
  else if (password.length < 8)
    errors.password = "Use at least 8 characters.";
  // bcrypt only reads the first 72 bytes, so refuse anything longer
  else if (Buffer.byteLength(password) > 72)
    errors.password = "Password is too long (72 bytes at most).";

  if (Object.keys(errors).length) {
    return fail(res, 400, "Please fix the highlighted fields.", errors);
  }

  const taken = () =>
    fail(res, 409, "An account with this email already exists. Try logging in.", {
      email: "This email is already registered.",
    });

  try {
    if (await findByEmail(email)) return taken();

    const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await userModel.create({ name, email, password: hashedPassword });

    return res.status(201).json({
      success: true,
      token: createToken(user._id),
      user: publicUser(user.name, email),
    });
  } catch (error) {
    // Two sign-ups with the same email at the same moment: the database's
    // unique index lets only one through.
    if (error?.code === 11000) return taken();
    console.error("Register failed:", error);
    return fail(res, 500, "Something went wrong. Please try again.");
  }
};

// Admin login — credentials are stored in env vars, not the database.
// Set ADMIN_EMAIL and ADMIN_PASSWORD in backend/.env.
const adminLogin = async (req, res) => {
  const email = readEmail(req.body?.email);
  const password = req.body?.password;

  const errors = {};
  if (!email) errors.email = "Enter your email address.";
  if (typeof password !== "string" || !password)
    errors.password = "Enter your password.";
  if (Object.keys(errors).length) {
    return fail(res, 400, "Please fill in all fields.", errors);
  }

  try {
    const adminEmail = (process.env.ADMIN_EMAIL || "").toLowerCase().trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "";

    if (!adminEmail || !adminPassword) {
      return fail(res, 503, "Admin login is not configured on this server.");
    }

    // Constant-time check prevents timing attacks on the email comparison
    const emailMatch = email === adminEmail;
    const passMatch = await bcrypt.compare(password, adminPassword.startsWith("$2") ? adminPassword : await bcrypt.hash(adminPassword, SALT_ROUNDS));

    if (!emailMatch || !passMatch) {
      return fail(res, 401, "Incorrect email or password.");
    }

    return res.json({
      success: true,
      token: createToken("admin", { role: "admin" }),
    });
  } catch (error) {
    console.error("Admin login failed:", error);
    return fail(res, 500, "Something went wrong. Please try again.");
  }
};

export { loginUser, registerUser, adminLogin };