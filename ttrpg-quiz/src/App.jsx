import React, { useState } from "react";
import { motion } from "framer-motion";
import {
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

const axes = [
  "Storytelling",
  "Roleplay Immersion",
  "Tactical Combat",
  "Puzzle Solving",
  "Character Morality",
  "Player vs Character Separation",
  "Collaborative Play",
  "Improvisation",
  "World Interaction",
  "Game Mechanics Focus",
  "Play Frequency"
];

const questionTemplates = {
  "Storytelling": [
    "How important is character-driven storytelling to you?",
    "Do you prefer long narrative arcs?",
    "Do you enjoy character backstories influencing present events?"
  ],
  "Roleplay Immersion": [
    "Do you fully immerse yourself in your character?",
    "Do you write journals or backgrounds for your character?",
    "Do you stay in character while speaking and acting?"
  ],
  "Tactical Combat": [
    "How much do you enjoy tactical combat?",
    "Do you track bonuses and rules closely?",
    "Do you prefer complex battle maps over theatre of the mind?"
  ],
  "Puzzle Solving": [
    "Do you enjoy riddles and puzzles in your sessions?",
    "Do you look for hidden clues or coded messages?",
    "Do you like solving mysteries as part of the narrative?"
  ],
  "Character Morality": [
    "Do you play morally consistent characters?",
    "Would you refuse actions against your real-life ethics?",
    "Do you play characters with a personal code of honor?"
  ],
  "Player vs Character Separation": [
    "Do you act differently than your character would?",
    "Do you roleplay worldviews unlike your own?",
    "Do you experiment with different personalities?"
  ],
  "Collaborative Play": [
    "Do you build stories with other players?",
    "Do you initiate roleplay with party members?",
    "Do you care about party dynamics and cohesion?"
  ],
  "Improvisation": [
    "Do you improvise in-character during sessions?",
    "Do you enjoy reacting to unexpected story events?",
    "Do you create spontaneous scenes or dialogue?"
  ],
  "World Interaction": [
    "Do you explore the lore of the setting deeply?",
    "Do you ask questions about worldbuilding details?",
    "Do you contribute to the world as a player?"
  ],
  "Game Mechanics Focus": [
    "Do you optimize builds for effectiveness?",
    "Do you learn the rules in detail for every system?",
    "Do you enjoy breaking down mechanics or min-maxing?"
  ],
  "Play Frequency": [
    "How often do you currently play TTRPGs?",
    "How often would you ideally want to play?",
    "How available are you for long-term campaigns?"
  ]
};

const questions = Object.entries(questionTemplates).flatMap(([axis, texts], i) =>
  texts.map((text, j) => ({
    id: i * 3 + j + 1,
    text,
    axis,
    options: ["Not at all", "Rarely", "Sometimes", "Often", "Always"]
  }))
);

const analyzeResults = (answers) => {
  const totals = {};
  const counts = {};
  axes.forEach(axis => {
    totals[axis] = 0;
    counts[axis] = 0;
  });
  answers.forEach(({ axis, score }) => {
    totals[axis] += score;
    counts[axis]++;
  });
  return axes.map(axis => ({
    axis,
    value: Math.round(totals[axis] / (counts[axis] || 1))
  }));
};

export default function App() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState([]);
  const [profile, setProfile] = useState(null);

  const handleAnswer = (score) => {
    const question = questions[currentQuestion];
    const newAnswers = [...answers, { axis: question.axis, score: score + 1 }];
    setAnswers(newAnswers);
    if (currentQuestion + 1 < questions.length) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setProfile(analyzeResults(newAnswers));
    }
  };

  if (profile) {
    return (
      <motion.div className="max-w-5xl mx-auto p-4">
        <div className="rounded-xl bg-white shadow-md p-6">
          <h2 className="text-xl font-bold mb-4">Your TTRPG Player Profile</h2>
          <ResponsiveContainer width="110%" height={750}>
            <RadarChart cx="50%" cy="50%" outerRadius="80%" data={profile}>
              <PolarGrid />
              <PolarAngleAxis dataKey="axis" />
              <PolarRadiusAxis angle={30} domain={[0, 5]} tickCount={6} />
              <Radar name="Profile" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
              <Tooltip />
            </RadarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>
    );
  }

  const question = questions[currentQuestion];

  return (
    <motion.div className="max-w-xl mx-auto p-4">
      <div className="rounded-xl bg-white shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">{question.text}</h2>
        <div className="grid gap-2">
          {question.options.map((option, index) => (
            <button
              key={index}
              onClick={() => handleAnswer(index)}
              className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            >
              {option}
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
