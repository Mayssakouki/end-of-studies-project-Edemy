import { User } from "../models/user.model.js";
import { uploadMedia } from "../utils/cloudinary.js"; // Ton fichier de cloudinary

export const uploadCv = async (req, res) => {
  try {
    const file = req.file.path; // multer place le fichier ici
    const userId = req.body.userId;

    // Upload du fichier sur Cloudinary
    const uploadedFile = await uploadMedia(file);

    // Mettre à jour l'utilisateur avec l'URL du CV
    const user = await User.findByIdAndUpdate(
      userId,
      { cvURL: uploadedFile.secure_url, approvalStatus: "pending" },
      { new: true }
    );

    res.status(200).json({ message: "CV uploaded successfully", user });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server Error" });
  }
};
