import jwt from 'jsonwebtoken'

export const generateTokenAndSetCookie = (res, userId) => {
  const token = jwt.sign({ userId }, process.env.JWT_SECRET, {
    expiresIn: '7d',
  })

  res.cookie('token', token, {
    httpOnly: true, // this cannot be accesible via javascript, only http. This prevents an attack called xss
    secure: process.env.NODE_ENV === 'production', // this would be secure in production only so it's going to be https
    sameSite: 'strict', // prevent Cross-Site Request Forgery (CSRF) attack
    maxAge: 7 * 25 * 60 * 60 * 1000, // 7 days
  })

  return token
}
