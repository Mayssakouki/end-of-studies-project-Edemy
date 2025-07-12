import jwt from "jsonwebtoken";
// Ce fichier contient une fonction qui génère un JSON Web Token (JWT) pour authentifier
// un utilisateur après une connexion réussie et le stocke dans un cookie sécurisé.
export const generateToken = (res, user, message) => {
  const token = jwt.sign(
    { userId: user._id, role: user.role }, // Payload
    process.env.SECRET_KEY, // Clé secrète pour la signature
    {
      expiresIn: "1d",
    }
  );
  return res
    .status(200)
    .cookie("token", token, {
      httpOnly: true, // httpOnly : cookie sécurisé
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    })
    .json({
      success: true,
      message,
      user,
    });
};
