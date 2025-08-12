import jwt from 'jsonwebtoken';
export const generateToken = (userId, res) => {
    const token = jwt.sign({userId}, process.env.JWT_SECRET, {
        expiresIn: "7d"
    })

    res.cookie("jwt", token, {
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
        httpOnly: true, // Prevent JavaScript access to the cookie
        sameSite: "strict", // Protect against CSRF
        secure: process.env.NODE_ENV !== 'development' // Use secure cookies in production
    })

    return token

}