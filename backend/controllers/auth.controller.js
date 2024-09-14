import bcryptjs from 'bcryptjs'
import crypto from 'crypto'

import { User } from '../models/user.model.js'
import { generateVerificationCode } from '../utils/generateVerificationCode.js'
import { generateTokenAndSetCookie } from '../utils/generateTokenAndSetCookie.js'
import {
  sendPasswordResetEmail,
  sendVerificationEmail,
  sendWelcomeEmail,
} from '../mailtrap/emails.js'

export const signup = async (req, res) => {
  const { email, password, name } = req.body
  try {
    if (!email || !password || !name) {
      throw new Error('All fields are required')
    }

    const userAlreadyExists = await User.findOne({ email })

    if (userAlreadyExists) {
      return res
        .status(400)
        .json({ success: false, message: 'user already exists' })
    }

    const hashedPassword = await bcryptjs.hash(password, 10)
    const verificationToken = generateVerificationCode()
    const user = new User({
      email,
      password: hashedPassword,
      name,
      verificationToken,
      verificationTokenExpiresAt: Date.now() + 24 * 60 * 60 * 1000, //24 hours
    })

    await user.save()

    generateTokenAndSetCookie(res, user._id)

    sendVerificationEmail(user.email, verificationToken)

    res.status(201).json({
      success: true,
      message: 'User created successfully',
      user: { ...user._doc, password: undefined },
    })
  } catch (error) {
    res.status(400).json({ success: false, message: error.message })
  }
}

export const verifyEmail = async (req, res) => {
  const { code } = req.body

  try {
    const user = await User.findOne({
      verificationToken: code,
      // verify that the token is not expired
      verificationTokenExpiresAt: { $gt: Date.now() }, // gt -> grate than
    })

    if (!user) {
      return res.status(400).json({
        success: false,
        message: 'Invalid or expired verification code',
      })
    }

    user.isVerified = true
    // clean these properties because we don't need them for now.
    user.verificationToken = undefined
    user.verificationTokenExpiresAt = undefined
    await user.save()

    await sendWelcomeEmail(user.email, user.name)

    res.status(200).json({
      success: true,
      message: 'Email verified successfully',
      user: {
        ...user._doc,
        password: undefined,
      },
    })
  } catch (error) {
    console.log('error in verifyEmail ', error)
    res.status(500).json({ success: false, message: 'Server error' })
  }
}

export const login = async (req, res) => {
  const { email, password } = req.body

  try {
    const user = await User.findOne({ email })
    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' })
    }

    const isPasswordValid = await bcryptjs.compare(password, user.password)
    if (!isPasswordValid) {
      return res
        .status(400)
        .json({ success: false, message: 'Invalid credentials' })
    }

    generateTokenAndSetCookie(res, user._id)

    user.lastLogin = Date()

    res.status(200).json({
      success: true,
      messsage: 'Logged in successfully',
      user: {
        ...user._doc,
        password: undefined,
      },
    })
  } catch (error) {
    console.log('error in login ', error)
    res.status(500).json({ success: false, message: error.message })
  }
}

export const logout = (req, res) => {
  res.clearCookie('token')
  res.status(200).json({ success: true, message: 'Logged out successfully' })
}

export const forgotPassword = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email })

    if (!user) {
      return res.status(400).json({ success: false, message: 'user not found' })
    }

    // Generate reset token
    const resetToken = crypto.randomBytes(20).toString('hex')
    const resetTokenExpiresAt = Date.now() + 1 * 60 * 60 * 1000 // 1 hour

    user.resetPasswordToken = resetToken
    user.resetPasswordExpiresAt = resetTokenExpiresAt

    await user.save()

    // send email
    await sendPasswordResetEmail(
      user.email,
      `${process.env.CLIENT_URL}/reset-possword/${resetToken}`
    )

    res.status(200).json({
      success: true,
      messsage: 'Password reset link sent to your email',
    })
  } catch (error) {
    console.log('Error in forgotPassword ', error)
    res.status(500).json({ success: false, message: error.message })
  }
}
