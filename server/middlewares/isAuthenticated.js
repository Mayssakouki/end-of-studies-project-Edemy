import jwt from "jsonwebtoken";
//Ce fichier contient un middleware Express qui vérifie
//  si une requête est authentifiée en validant le token JWT envoyé dans les cookies.

// is Authenticated pour dire que seules les requêtes authentifiées peuvent y accéder.

const isAuthenticated = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    const decode = jwt.verify(token, process.env.SECRET_KEY);
    if (!decode) {
      return res.status(401).json({ success: false, message: "Invalid token" });
    }
    req.id = decode.userId;
    req.role = decode.role;
    next();
  } catch (error) {
    console.log(error);
  }
};
export default isAuthenticated;
