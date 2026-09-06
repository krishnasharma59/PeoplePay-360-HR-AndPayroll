import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import Employee from "../models/Employee.js";
import { sendMail } from "../utils/mailer.js";
import { logAudit } from "../utils/audit.js";

// Deliberately require a domain suffix; addresses such as "krishna@gmaicom"
// and escaped values such as "krishna\\@gmail.com" are not accepted.
const isValidEmail = (value) => /^[^\s@\\]+@[^\s@\\]+\.[^\s@\\]{2,}$/.test(String(value || "").trim());

function createToken(user) {
  return jwt.sign({ id: user._id, role: user.role, employee: user.employee }, process.env.JWT_SECRET, { expiresIn: "8h" });
}

function userResponse(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, employee: user.employee, avatarUrl: user.avatarUrl || "" };
}

export async function register(req, res, next) {
  try {
    const { name, email, password, confirmPassword } = req.body;
    if (!name || !email || !password || !confirmPassword) return res.status(400).json({ message: "name, email, password and confirmPassword are required." });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Enter a valid email address, for example name@example.com." });
    if (password.length < 8) return res.status(400).json({ message: "Password must be at least 8 characters long." });
    if (password !== confirmPassword) return res.status(400).json({ message: "Password and confirmation password must match." });
    if (await User.exists({ email: email.toLowerCase() })) return res.status(409).json({ message: "An account already exists for this email." });

    
    const employee = await Employee.findOne({ email: email.toLowerCase() });
    const user = await User.create({ name, email, password: await bcrypt.hash(password, 12), role: "employee", employee: employee?._id });
    await logAudit(user._id, "Created account", "User", user._id, { name: user.name, email: user.email });
    return res.status(201).json({ user: userResponse(user), token: createToken(user) });
  } catch (error) { next(error); }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!isValidEmail(email)) return res.status(400).json({ message: "Enter a valid email address, for example name@example.com." });
    const user = await User.findOne({ email: email?.toLowerCase() }).select("+password");
    if (!user || !(await bcrypt.compare(password || "", user.password))) return res.status(401).json({ message: "Email or password is incorrect." });
    await logAudit(user._id, "Signed in", "User", user._id, { email: user.email });
    return res.json({ user: userResponse(user), token: createToken(user) });
  } catch (error) { next(error); }
}

export async function updateProfile(req, res, next) {
  try {
    const { name, avatarUrl } = req.body;
    if (!name?.trim()) return res.status(400).json({ message: "A display name is required." });
    const user = await User.findByIdAndUpdate(req.user.id, { name: name.trim(), avatarUrl: avatarUrl?.trim() || "" }, { new: true });
    await logAudit(req.user.id, "Updated profile", "User", user._id, { name: user.name, email: user.email });
    return res.json({ user: userResponse(user) });
  } catch (error) { next(error); }
}

export async function changePassword(req, res, next) {
  try {
    const { currentPassword, newPassword, confirmPassword } = req.body;
    if (!currentPassword || !newPassword || !confirmPassword) return res.status(400).json({ message: "All password fields are required." });
    if (newPassword.length < 8) return res.status(400).json({ message: "New password must be at least 8 characters long." });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: "New password and confirmation must match." });
    const user = await User.findById(req.user.id).select("+password");
    if (!user || !(await bcrypt.compare(currentPassword, user.password))) return res.status(401).json({ message: "Current password is incorrect." });
    user.password = await bcrypt.hash(newPassword, 12);
    await user.save();
    await logAudit(req.user.id, "Changed password", "User", user._id);
    return res.json({ message: "Password updated successfully." });
  } catch (error) { next(error); }
}

export async function requestPasswordReset(req, res, next) {
  try {
    if (!isValidEmail(req.body.email)) return res.status(400).json({ message: "Enter a valid email address, for example name@example.com." });
    const user = await User.findOne({ email: req.body.email?.toLowerCase() }).select('+passwordResetCode +passwordResetExpiresAt');
    // Never reveal whether an email address has an account.
    if (user) {
      const code = String(Math.floor(100000 + Math.random() * 900000));
      user.passwordResetCode = await bcrypt.hash(code, 10);
      user.passwordResetExpiresAt = new Date(Date.now() + 10 * 60 * 1000);
      await user.save();
      await logAudit(user._id, "Requested password reset", "User", user._id, { email: user.email });
      await sendMail({
        to: user.email,
        subject: "PeoplePay360 password reset verification code",
        text: `Your PeoplePay360 verification code is ${code}. It expires in 10 minutes. If you did not request this, you can ignore this email.`,
        html: `<p>Your PeoplePay360 verification code is:</p><h2>${code}</h2><p>This code expires in 10 minutes. If you did not request this, you can ignore this email.</p>`,
      });
    }
    return res.json({ message: 'If that email is registered, a verification code has been sent.' });
  } catch (error) { next(error); }
}

export async function resetPassword(req, res, next) {
  try {
    const { email, code, newPassword, confirmPassword } = req.body;
    if (!email || !code || !newPassword || !confirmPassword) return res.status(400).json({ message: 'Email, verification code, and both password fields are required.' });
    if (!isValidEmail(email)) return res.status(400).json({ message: "Enter a valid email address, for example name@example.com." });
    if (newPassword.length < 8) return res.status(400).json({ message: 'Password must be at least 8 characters long.' });
    if (newPassword !== confirmPassword) return res.status(400).json({ message: 'Passwords do not match.' });
    const user = await User.findOne({ email: email.toLowerCase() }).select('+passwordResetCode +passwordResetExpiresAt');
    if (!user || !user.passwordResetCode || !user.passwordResetExpiresAt || user.passwordResetExpiresAt < new Date() || !(await bcrypt.compare(code, user.passwordResetCode))) {
      return res.status(400).json({ message: 'That verification code is invalid or has expired.' });
    }
    user.password = await bcrypt.hash(newPassword, 12);
    user.passwordResetCode = undefined;
    user.passwordResetExpiresAt = undefined;
    await user.save();
    await logAudit(user._id, "Reset password", "User", user._id);
    return res.json({ message: 'Password reset successfully. You can now sign in.' });
  } catch (error) { next(error); }
}
