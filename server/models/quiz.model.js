import mongoose from "mongoose";

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Le titre du quiz est obligatoire"],
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  passingScore: {
    type: Number,
    default: 70,
    min: [0, "Le score minimum ne peut pas être négatif"],
    max: [100, "Le score maximum est de 100%"],
  },
  timeLimit: {
    type: Number, // en minutes
    default: 30,
    min: [1, "La durée minimale est 1 minute"],
  },
  questions: [
    {
      text: {
        type: String,
        required: [true, "Le texte de la question est obligatoire"],
      },
      options: {
        type: [String],
        required: true,
        validate: {
          validator: (v) =>
            v.length >= 2 && v.every((opt) => opt.trim() !== ""),
          message: "Au moins 2 options valides sont requises",
        },
      },
      correctAnswer: {
        type: Number,
        required: true,
        validate: {
          validator: function (v) {
            return v >= 0 && v < this.options.length;
          },
          message: "L'index de la réponse correcte est invalide",
        },
      },
      points: {
        type: Number,
        default: 1,
        min: [1, "Les points doivent être au moins égaux à 1"],
      },
    },
  ],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

export const Quiz = mongoose.model("Quiz", quizSchema);
