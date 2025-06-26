import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const axes = [
  "Storytelling", "Roleplay Immersion", "Combat Enthusiasm", "Combat Complexity", 
  "Combat Frequency", "Puzzle Solving", "Character Morality", "Player Character Decohesion", 
  "Collaborative Play", "Improvisation", "World Interaction", "Game Mechanics Focus", "Play Potential",
  
];

const defaultOptions = ["Very rarely", "Rarely", "Sometimes", "Often", "Very often"];
const percentageOptions = ["0%", "1-24%", "25-49%", "50-74%", "75-100%"];
const frequencyOptions = ["Never", "1/30 days", "1/14 days", "1/7 days", "More"];
const frequency2Options = ["Never", "0-2 pr Campaign", "A quarter of sessions have one", "Every other session has one", "Every Session!"];

const questionTemplates = {
  "Storytelling": [
    { text: "Is the story something that should primarily be driving the campaign?", options: defaultOptions },
    { text: "Do you prefer longer narrative arcs?", options: defaultOptions },
    { text: "How often do you want character backstories influencing present events?", options: defaultOptions }
  ],
  "Roleplay Immersion": [
    { text: "How much do you want to immerse yourself in your character?", options: defaultOptions },
    { text: "How often do you want to interact with other PCs in character?", options: defaultOptions },
    { text: "How often do you want others to interact with you in character?", options: defaultOptions }
  ],
  "Combat Enthusiasm": [
    { text: "How much do you prefer for a session to focus on combat encounters during a session?", options: percentageOptions },
    { text: "How much do you think others in a pod should focus on optimizing for efficient combat?", options: percentageOptions },
    { text: "If you could pick how often combats occur in sessions, what would you pick?", options: defaultOptions }
  ],
  "Combat Complexity": [
  { text: "How much do you enjoy combat that requires strategic positioning, resource tracking, and tactical choices?", options: defaultOptions },
  { text: "Do you enjoy learning and applying intricate game mechanics (e.g., conditions, flanking, cover)?", options: defaultOptions },
  { text: "How important is turn-by-turn planning and synergy with teammates during combat?", options: defaultOptions }
	],
"Combat Frequency": [
  { text: "What percentage of a session would you ideally want to be combat-focused?", options: percentageOptions },
  { text: "How often would you like sessions to include at least one combat encounter?", options: frequency2Options },
  { text: "Do you feel disappointed when a session goes by without combat?", options: defaultOptions }
	],
  "Puzzle Solving": [
    { text: "Do you enjoy riddles and puzzles in your sessions? NOT COMBAT", options: defaultOptions },
    { text: "How often do you want puzzles incorporated into a session for story or otherwise?", options: frequency2Options },
    { text: "Do you like solving mysteries as part of the narrative? Not skill roll/random chance", options: defaultOptions }
  ],
  "Character Morality": [
    { text: "How often do you play morally consistent characters?", options: percentageOptions },
    { text: "How often would you accept actions against your real-life ethics?", options: percentageOptions },
    { text: "How often do you play characters with a personal code of honor?", options: defaultOptions }
  ],
  "Player Character Decohesion": [
    { text: "How comfortable are you playing characters whose actions or personalities differ significantly from your own in real life?", options: percentageOptions },
    { text: "Do you enjoy roleplaying worldviews unlike your own?", options: percentageOptions },
    { text: "Do you experiment with different personalities?", options: percentageOptions }
  ],
  "Collaborative Play": [
    { text: "Do you want to build stories with other players?", options: defaultOptions },
    { text: "How often do you find your characters set aside greed in favour of the greater good?", options: defaultOptions },
    { text: "Are party dynamics and cohesion important to the characters you make??", options: defaultOptions }
  ],
  "Improvisation": [
    { text: "Do you improvise in-character during sessions?", options: defaultOptions },
    { text: "Do you enjoy reacting to unexpected story events?", options: defaultOptions },
    { text: "Do you create spontaneous scenes or dialogue?", options: defaultOptions }
  ],
  "World Interaction": [
    { text: "How often do you find yourself drawn into the lore/world if its decently written?", options: defaultOptions },
    { text: "Do you want to be able to be sidetracked by unrelated or non essential situations, places /people?", options: defaultOptions },
    { text: "How often do you find yourself wanting to interact with the world/NPCs outside of main objectives?", options: defaultOptions }
  ],
  "Game Mechanics Focus": [
    { text: "Do you optimize builds for effectiveness more or equally to your peers?", options: defaultOptions },
    { text: "How important is it to you to learn and use every mechanic/rule?", options: percentageOptions },
    { text: "What percentage of the time do you enjoy breaking down mechanics or min-maxing?", options: percentageOptions }
  ],
	"Play Potential": [
    { text: "How often do you currently play TTRPGs?", options: frequencyOptions },
    { text: "How often would you ideally want to play?", options: frequencyOptions },
    { text: "How available are you for long-term campaigns?", options: frequencyOptions }
  ]
};

const questions = Object.entries(questionTemplates).flatMap(([axis, items], i) =>
  items.map((q, j) => ({
    id: i * 10 + j + 1,
    text: q.text,
    axis,
    options: q.options
  }))
);

const encodeAnswers = (answers) => btoa(JSON.stringify(answers));
const decodeAnswers = (str) => {
  try {
    return JSON.parse(atob(str));
  } catch {
    return null;
  }
};

const analyzeResults = (answers) => {
  const grouped = {};
  axes.forEach(axis => (grouped[axis] = []));
  answers.forEach(({ axis, score }) => grouped[axis].push(score));

  return axes.map(axis => {
    if (axis === "Play Potential") {
      const [actual, desired, available] = grouped[axis];
      let value = 0;
      if (desired > 2 && available > 2) value = 5;
      else if (desired > 2 && available <= 2) value = 2;
      else if (desired <= 2) value = 1;
      return { axis, value };
    }
    const avg = grouped[axis].reduce((a, b) => a + b, 0) / (grouped[axis].length || 1);
    return { axis, value: Math.round(avg) };
  });
};

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(-1);
  const [answers, setAnswers] = useState([]);
  const [profile, setProfile] = useState(null);
  const [importString, setImportString] = useState("");
  const [name, setName] = useState("");
  const [waveMode, setWaveMode] = useState(false);
  const [waveFrame, setWaveFrame] = useState(0);
  const [showDebug, setShowDebug] = useState(false);

  useEffect(() => {
    if (!waveMode) return;
    const interval = setInterval(() => {
      setWaveFrame(f => f + 1);
    }, 200);
    return () => clearInterval(interval);
  }, [waveMode]);

  const totalQuestions = questions.length;
  const progressPercent = Math.round((currentQuestion / totalQuestions) * 100);

  const startQuiz = () => {
    const imported = decodeAnswers(importString);
    if (imported && Array.isArray(imported)) {
      setProfile(analyzeResults(imported));
    } else {
      setCurrentQuestion(0);
    }
  };

const handleAnswer = (score) => {
  const question = questions[currentQuestion];
  const newAnswers = [...answers];
  newAnswers[currentQuestion] = { axis: question.axis, score: score + 1 };
  setAnswers(newAnswers);
  if (currentQuestion + 1 < totalQuestions) {
    setCurrentQuestion(currentQuestion + 1);
  } else {
    setProfile(analyzeResults(newAnswers));
  }
};

  if (currentQuestion === -1 && !profile) {
    return (
      <motion.div className="max-w-xl mx-auto p-4 space-y-4 text-center">
        <h1 className="text-2xl font-bold mb-4">TTRPG Player Profile Quiz</h1>
        <input
          type="text"
          placeholder="Enter your name (optional)"
          className="w-full p-2 border rounded"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
        <button
          onClick={startQuiz}
          className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700"
        >
          Begin / Load
        </button>
        <div className="mt-4">
          <p className="mb-2">Or paste a profile string to load results:</p>
          <input
            type="text"
            className="w-full p-2 border border-gray-300 rounded"
            placeholder="Paste profile string here"
            value={importString}
            onChange={(e) => setImportString(e.target.value)}
          />
        </div>
      </motion.div>
    );
  }

  if (profile) {
    const data = waveMode
      ? axes.map((axis, i) => ({ axis, value: Math.round(2.5 + 2.5 * Math.sin((waveFrame + i) / 2)) }))
      : profile;

    return (
      <motion.div className="max-w-6xl mx-auto p-4 text-center">
        <div className="rounded-xl bg-white shadow-md p-6 relative">
          <h2 className="text-xl font-bold mb-4">Profile: {name || "N/A"}</h2>
          <div className="flex">
            <div className="w-1/4 text-left text-sm pr-4">
              <p className="bg-yellow-100 p-2 rounded">
                Availability is calculated by a different metric from the points assigning with other questions, where it instead looks at actual available time that is desired to be play time.
              </p>
            </div>
            <div className="w-3/4">
              <ResponsiveContainer width="100%" height={500}>
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="axis" />
                  <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} />
                  <Radar name="Profile" dataKey="value" stroke="#6A1B9A" fill="#ff0000" fillOpacity={0.6} />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div className="mt-6">
            <h3 className="font-medium text-gray-700">Your result code:</h3>
            <textarea
              className="w-full mt-2 p-3 border rounded text-sm"
              readOnly
              rows={3}
              value={encodeAnswers(answers)}
            />
          </div>
          <div className="flex justify-center gap-4 mt-6">
            <button className="px-4 py-2 rounded bg-red-600 text-white hover:bg-red-700" onClick={() => setWaveMode(!waveMode)}>
              Waste Time
            </button>
            <button className="px-4 py-2 rounded bg-green-600 text-white hover:bg-green-700" onClick={() => document.body.classList.toggle("table-flip")}>
              Useless
            </button>
            <button className="px-4 py-2 rounded bg-gray-600 text-white hover:bg-gray-700" onClick={() => setShowDebug(!showDebug)}>
              Debug
            </button>
          </div>
          {showDebug && (
            <div className="mt-4 text-left text-sm">
              <table className="table-auto border-collapse border w-full">
                <thead>
                  <tr>
                    <th className="border px-2">Q#</th>
                    <th className="border px-2">Axis</th>
                    <th className="border px-2">Score</th>
                  </tr>
                </thead>
                <tbody>
                  {answers.map((a, i) => (
                    <tr key={i}>
                      <td className="border px-2">{i + 1}</td>
                      <td className="border px-2">{a.axis}</td>
                      <td className="border px-2">{a.score}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <motion.div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-xl bg-white text-black shadow-md p-6 rounded-xl text-center">
        <div className="mb-4">
          <div className="text-sm mb-1 font-medium text-gray-700">
            {progressPercent}% complete (Q{currentQuestion + 1} / {totalQuestions})
          </div>
          <div className="w-full bg-gray-300 h-3 rounded-full overflow-hidden">
            <div
              className="h-full bg-blue-600 transition-all duration-300"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
        <h2 className="text-xl font-bold mb-4">Q{currentQuestion + 1}: {question.text}</h2>
        <div className="flex flex-wrap justify-center gap-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {option}
            </button>
          ))}
        </div>
        <div className="mt-4">
          {currentQuestion > 0 && (
            <button
              className="px-4 py-2 bg-gray-500 text-white rounded hover:bg-gray-600"
              onClick={() => setCurrentQuestion(currentQuestion - 1)}
            >
              Back
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
}
