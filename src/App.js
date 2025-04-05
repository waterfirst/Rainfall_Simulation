import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

// UI 컴포넌트 간단히 정의
const Input = ({ type, value, onChange, placeholder }) => (
  <input
    type={type}
    value={value}
    onChange={onChange}
    placeholder={placeholder}
    className="w-full p-2 border rounded"
  />
);

const Button = ({ onClick, children }) => (
  <button
    onClick={onClick}
    className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
  >
    {children}
  </button>
);

const Card = ({ children, className }) => (
  <div className={`p-4 border rounded shadow ${className || ""}`}>{children}</div>
);

const CardContent = ({ children }) => <div className="p-4">{children}</div>;

export default function RainSimulation() {
  const [distance, setDistance] = useState(10);
  const [rainSpeed, setRainSpeed] = useState(5);
  const [headArea, setHeadArea] = useState(0.1);
  const [bodyArea, setBodyArea] = useState(0.5);
  const [currentSpeed, setCurrentSpeed] = useState(0.5);
  const [result, setResult] = useState(null);
  const [results, setResults] = useState([]);
  const [isRunning, setIsRunning] = useState(false);
  const [personX, setPersonX] = useState(0);

  const walkingSpeeds = [0.5, 1, 2, 3, 4];

  const simulateRainHit = (D, V1, V2, S1, S2, rainDensity = 1000) => {
    const timeWalk = D / V2;
    const volumeHead = S1 * V1 * timeWalk;
    const rainOnHead = volumeHead * rainDensity;
    const volumeBody = S2 * V2 * timeWalk;
    const rainOnBody = volumeBody * rainDensity;
    const totalRain = rainOnHead + rainOnBody;

    return { V2, rainOnHead, rainOnBody, totalRain };
  };

  useEffect(() => {
    if (!isRunning) return;

    let index = 0;
    const newResults = [];
    const interval = setInterval(() => {
      if (index >= walkingSpeeds.length) {
        clearInterval(interval);
        setIsRunning(false);
        setResults(newResults);
        return;
      }
      const speed = walkingSpeeds[index];
      const res = simulateRainHit(distance, rainSpeed, speed, headArea, bodyArea);
      setCurrentSpeed(speed);
      setResult(res);
      newResults.push(res);
      index++;
    }, 1000);

    return () => clearInterval(interval);
  }, [isRunning, distance, rainSpeed, headArea, bodyArea]);

  return (
    <div className="p-4 max-w-xl mx-auto space-y-4">
      <h1 className="text-2xl font-bold mb-4">Rainfall Simulation</h1>
      <div className="grid grid-cols-2 gap-2">
        <Input
          type="number"
          value={distance}
          onChange={(e) => setDistance(parseFloat(e.target.value))}
          placeholder="Distance (m)"
        />
        <Input
          type="number"
          value={rainSpeed}
          onChange={(e) => setRainSpeed(parseFloat(e.target.value))}
          placeholder="Rain Speed V1 (m/s)"
        />
        <Input
          type="number"
          value={headArea}
          onChange={(e) => setHeadArea(parseFloat(e.target.value))}
          placeholder="Head Area S1 (m^2)"
        />
        <Input
          type="number"
          value={bodyArea}
          onChange={(e) => setBodyArea(parseFloat(e.target.value))}
          placeholder="Body Area S2 (m^2)"
        />
      </div>
      <Button onClick={() => setIsRunning(true)}>Start Dynamic Simulation</Button>

      {result && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mt-4 bg-blue-50">
            <CardContent>
              <p className="font-medium">Walking Speed: {result.V2} m/s</p>
              <p>Rain on Head: {result.rainOnHead.toFixed(1)} drops</p>
              <p>Rain on Body: {result.rainOnBody.toFixed(1)} drops</p>
              <p>Total Rain: {result.totalRain.toFixed(1)} drops</p>
            </CardContent>
          </Card>
        </motion.div>
      )}

      {results.length > 0 && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold mb-2">Rain vs Walking Speed</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={results}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="V2" label={{ value: 'Speed (m/s)', position: 'insideBottom', offset: -5 }} />
              <YAxis label={{ value: 'Rain (drops)', angle: -90, position: 'insideLeft' }} />
              <Tooltip />
              <Line type="monotone" dataKey="totalRain" stroke="#3b82f6" name="Total Rain" />
              <Line type="monotone" dataKey="rainOnHead" stroke="#10b981" name="Head Rain" />
              <Line type="monotone" dataKey="rainOnBody" stroke="#f59e0b" name="Body Rain" />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
