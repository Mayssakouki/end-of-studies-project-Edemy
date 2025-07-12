import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import React from "react";
import { useNavigate } from "react-router-dom"; // Import ajouté

export const QuizForm = ({ quiz, setQuiz, onSubmit, isSubmitting }) => {
  const navigate = useNavigate(); // Hook ajouté

  const handleQuestionChange = (index, field, value) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions[index][field] = value;
    setQuiz({ ...quiz, questions: updatedQuestions });
  };

  const addQuestion = () => {
    setQuiz({
      ...quiz,
      questions: [
        ...quiz.questions,
        {
          text: "",
          options: ["", "", "", ""],
          correctAnswer: 0,
          points: 1,
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    const updatedQuestions = [...quiz.questions];
    updatedQuestions.splice(index, 1);
    setQuiz({ ...quiz, questions: updatedQuestions });
  };
  

  return (
    <div className="space-y-4 ">
      <div >
        <Label>Quiz Title</Label>
        <Input
         className="mt-1"
          value={quiz.title}
          onChange={(e) => setQuiz({ ...quiz, title: e.target.value })}
          placeholder="Enter quiz title"
        />
      </div>

      <div>
        <Label>Passing Score (%)</Label>
        <Input
         className="mt-1"
          type="number"
          value={quiz.passingScore}
          onChange={(e) =>
            setQuiz({ ...quiz, passingScore: parseInt(e.target.value) || 0 })
          }
          min="0"
          max="100"
        />
      </div>

      <div>
        <Label>Time Limit (minutes)</Label>
        <Input
            className="mt-1"
          type="number"
          value={quiz.timeLimit}
          onChange={(e) =>
            setQuiz({ ...quiz, timeLimit: parseInt(e.target.value) || 0 })
          }
          min="0"
        />
      </div>

      <h3 className="font-medium">Questions</h3>
      {quiz.questions.map((question, qIndex) => (
        <div key={qIndex} className="border p-4 rounded-md space-y-3">
          <div className="flex justify-between items-center">
            <h4 className="font-medium">Question {qIndex + 1}</h4>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => removeQuestion(qIndex)}
            >
              Remove
            </Button>
          </div>

          <div>
            <Label>Question Text</Label>
            <Textarea
              value={question.text}
              onChange={(e) =>
                handleQuestionChange(qIndex, "text", e.target.value)
              }
              placeholder="Enter the question"
            />
          </div>

         

          <div>
            <Label>Options</Label>
            {question.options.map((option, oIndex) => (
              <div key={oIndex} className="flex items-center space-x-2 mb-2">
                <Input
                  value={option}
                  onChange={(e) => {
                    const newOptions = [...question.options];
                    newOptions[oIndex] = e.target.value;
                    handleQuestionChange(qIndex, "options", newOptions);
                  }}
                  placeholder={`Option ${oIndex + 1}`}
                />
                <input
                  type="radio"
                  name={`correctAnswer-${qIndex}`}
                  checked={question.correctAnswer === oIndex}
                  onChange={() =>
                    handleQuestionChange(qIndex, "correctAnswer", oIndex)
                  }
                />
                <span>Correct</span>
              </div>
            ))}
          </div>
        </div>
      ))}

      <Button variant="outline" onClick={addQuestion}>
        Add Question
      </Button>

      <div className="flex justify-end gap-2"> 
        <Button 
          variant="outline" 
          onClick={() => navigate(-1)} // Retour à la page précédente
        >
          Cancel
        </Button>
        <Button onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting ? "Saving..." : "Save Quiz"}
        </Button>
      </div>
    </div>
  );
};


/*

 <div>
            <Label>Points</Label>
            <Input
              type="number"
              value={question.points}
              onChange={(e) =>
                handleQuestionChange(
                  qIndex,
                  "points",
                  parseInt(e.target.value) || 0
                )
              }
              min="1"
            />
          </div>
*/ 