import { useState, useMemo } from "react";
// import axios from "axios";
// import viteLogo from "/vite.svg";
import { SubmitHandler, useForm } from "react-hook-form";
import "../App.css";
import { GoogleGenerativeAI } from "@google/generative-ai";
import Loader from "../components/Loader";
const PLACEHOLDER_TEXT =
  "type in your question-answer pairs and hit Submit to get quiz";

/*
mock question
*/
type Input = {
  text: string;
};
type Answer = {
  content: string;
  isCorrect: boolean;
  fullAnswer?: string;
};
type QuestionSet = {
  question: string;
  answers: Answer[];
};
// const MOCK_DATA: QuestionSet[][] = [
//   [
//     {
//       question: "Who likes banana?",
//       answers: [
//         { content: "na", isCorrect: false },
//         { content: "b", isCorrect: false },
//         { content: "c", isCorrect: false },
//         { content: "d", isCorrect: true, fullAnswer: "THE ANSWER" },
//       ],
//     },
//     {
//       question: "2 Who likes ya?",
//       answers: [
//         { content: "true", isCorrect: true, fullAnswer: "HERE APPLE" },
//         { content: "b", isCorrect: false },
//         { content: "c", isCorrect: false },
//         { content: "d", isCorrect: false },
//       ],
//     },
//   ],
//   [
//     {
//       question: "3 Who likes hahaa?",
//       answers: [
//         { content: "na", isCorrect: false },
//         { content: "b", isCorrect: false },
//         { content: "c", isCorrect: false },
//         { content: "true", isCorrect: true, fullAnswer: "THE ANSWER" },
//       ],
//     },
//     {
//       question: "4 Who likes starmie?",
//       answers: [
//         { content: "true", isCorrect: true, fullAnswer: "HERE APPLE" },
//         { content: "b", isCorrect: false },
//         { content: "c", isCorrect: false },
//         { content: "d", isCorrect: false },
//       ],
//     },
//   ],
// ];
function App() {
  //   const [count, setCount] = useState(0);
  const [data, setData] = useState<QuestionSet[]>([]);
  const btnText = useMemo(() => {
    if (data.length > 0) return "Add to quiz";
    return "Submit";
  }, [data]);

  const {
    register,
    handleSubmit,
    formState: { isDirty },
    reset,
  } = useForm<Input>();

  // let count = 0;
  const [count, setCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY as string);

  // const formatInput = (text: string) => {
  //   const pattern = /(\d+\.\s.+?)\n((?:.|\n)*?)(?=\n\d+\.|$)/g;
  //   let pairs = [];
  //   let match;
  //   while ((match = pattern.exec(text)) !== null) {
  //     const question = match[1].trim();
  //     const answer = match[2].trim();
  //     pairs.push({ question, answer });
  //   }
  //   pairs = JSON.stringify(pairs);
  //   return pairs;
  // };

  // const

  const fetchData = async (text: string) => {
    try {
      setIsLoading(true);
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      const prompt = [
        'For each pair of question and answer, give me the question \
        and four answer choices: 3 wrong but sound right, and only 1 true correct answer, in random order. Include the full answer\
        in the correct answer. The response should be structured:\
        \'{"data":[{"question":question,"answers":[{"content":string,"isCorrect":boolean,"fullAnswer":string}]}]}\'',
        "Here are the pair of question and answers: ",
      ];
      // const pairs = formatInput(text);
      // console.log("pairs", pairs);

      // return;
      prompt.push(text);
      // prompt.push(pairs);
      const body = prompt.join("\n");
      const result = await model.generateContent(body);
      const response = result.response;
      const data = response.text();
      console.log("data ***", data);
      const renderData = JSON.parse(data);
      console.log("renderData", renderData);
      setData(renderData.data);
      setError("");
    } catch (e) {
      console.error(e);
      if (e instanceof Error) {
        setError(e.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const [score, setScore] = useState(0);
  const seenQuestions = new Set();
  const [showAnswer, setShowAnswer] = useState(false);
  const handleClickAnswer = (ans: Answer) => {
    // if (currentQuestionIdx === data.length) return;
    if (showAnswer) return;

    if (seenQuestions.size === data.length) return;
    if (ans.isCorrect) setScore(score + 1);
    setShowAnswer(true);
    seenQuestions.add(currentQuestionIdx);
    // setCurrentQuestionIdx(currentQuestionIdx + 1);
  };

  const handleClickNext = () => {
    setCurrentQuestionIdx(currentQuestionIdx + 1);
    setShowAnswer(false);
  };

  const handleClickBack = () => {
    setCurrentQuestionIdx(currentQuestionIdx - 1);
    // setShowAnswer(false);
  };

  // const saveQuizSet = async () => {
  //   try {
  //     const postData = {
  //       name: "Quiz Test @#@",
  //       quizzes: data,
  //     };
  //     const response = await axios.post(
  //       `${process.env.SERVER}/addQuizSetMobileMobile`,
  //       postData,
  //       {
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       }
  //     );
  //     console.log("Success: ", response);
  //   } catch (error) {
  //     console.error("Error: ", error);
  //   }
  // };

  const submitRawQuestionAnswer: SubmitHandler<Input> = (data) => {
    setCount(count + 1);
    if (count === 2) return;

    console.log("count", count);

    console.log("data: ", data);

    // fetch api
    if (!isDirty) return;
    console.log("is Dirty", isDirty);

    fetchData(data.text);
    reset();
    // mockLoading();
  };
  return (
    <>
      <div>
        <form
          onSubmit={handleSubmit(submitRawQuestionAnswer)}
          className="form-container"
        >
          <textarea
            placeholder={PLACEHOLDER_TEXT}
            required
            disabled={isLoading}
            {...register("text")}
          />
          {isLoading && <Loader />}
          {error && <span>{error}</span>}

          <button type="submit" disabled={isLoading} className="submit-btn">
            {btnText}
          </button>
        </form>
      </div>

      {data && currentQuestionIdx < data.length && (
        <>
          <span className="score">
            score: {score}/{data.length}
          </span>
          <div className="quiz-container">
            <div className="announcement">
              {data[currentQuestionIdx].question}
            </div>
            {data[currentQuestionIdx].answers.map((ans, idx) => (
              <>
                <button
                  disabled={showAnswer}
                  key={`${currentQuestionIdx}-${idx}`}
                  className={`quiz-box ${
                    ans.isCorrect && showAnswer && "correct-ans"
                  }`}
                  onClick={() => handleClickAnswer(ans)}
                >
                  {ans.content}
                </button>
              </>
            ))}
          </div>
        </>
      )}
      {currentQuestionIdx > 0 && (
        <button onClick={handleClickBack}>Prev</button>
      )}
      {data && currentQuestionIdx < data.length && (
        <>
          <button onClick={handleClickNext}>Next</button>
          <br />
          {/* <button onClick={saveQuizSet}>Save this quiz set</button> */}
        </>
      )}
      {data && data.length > 0 && currentQuestionIdx === data.length && (
        <>
          <div>You have finished your quiz!</div>
          {/* <button onClick={saveQuizSet}>Save this quiz set</button> */}
        </>
      )}
    </>
  );
}

export default App;
