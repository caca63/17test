import { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(CategoryScale, LinearScale, BarElement, Tooltip, Legend);

export default function BaccaratTrendAnalyzer() {
  const [rounds, setRounds] = useState(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("baccaratRounds");
      return saved ? JSON.parse(saved) : [];
    }
    return [];
  });
  const [player, setPlayer] = useState(0);
  const [banker, setBanker] = useState(0);

  useEffect(() => {
    localStorage.setItem("baccaratRounds", JSON.stringify(rounds));
  }, [rounds]);

  const calculateTrend = (prev, curr) => {
    if (prev === null) return "—";
    if (curr > prev) return "↑";
    if (curr < prev) return "↓";
    return "→";
  };

  const addRound = () => {
    const newRound = {
      round: rounds.length + 1,
      player: Number(player),
      banker: Number(banker),
      result:
        Number(player) > Number(banker)
          ? "閒"
          : Number(player) < Number(banker)
          ? "莊"
          : "和",
      trendPlayer:
        rounds.length > 0
          ? calculateTrend(rounds[rounds.length - 1].player, Number(player))
          : "—",
      trendBanker:
        rounds.length > 0
          ? calculateTrend(rounds[rounds.length - 1].banker, Number(banker))
          : "—",
    };
    setRounds([...rounds, newRound]);
    setPlayer(0);
    setBanker(0);
  };

  const countResults = rounds.reduce(
    (acc, r) => {
      acc[r.result]++;
      return acc;
    },
    { 閒: 0, 莊: 0, 和: 0 }
  );

  const nextPrediction = () => {
    if (rounds.length < 2) return "暫無";
    const last = rounds[rounds.length - 1];
    const secondLast = rounds[rounds.length - 2];
    const playerTrend = last.player - secondLast.player;
    const bankerTrend = last.banker - secondLast.banker;
    if (playerTrend > bankerTrend) return "預測：閒";
    if (playerTrend < bankerTrend) return "預測：莊";
    return "預測：和";
  };

  const chartData = {
    labels: ["閒", "莊", "和"],
    datasets: [
      {
        label: "勝方出現次數",
        data: [countResults["閒"], countResults["莊"], countResults["和"]],
        backgroundColor: ["#60a5fa", "#f87171", "#facc15"],
      },
    ],
  };

  const exportCSV = () => {
    const csv = ["局數,閒家,莊家,勝方,閒趨勢,莊趨勢"];
    rounds.forEach((r) => {
      csv.push(`${r.round},${r.player},${r.banker},${r.result},${r.trendPlayer},${r.trendBanker}`);
    });
    const blob = new Blob([csv.join("\n")], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "baccarat_rounds.csv";
    a.click();
  };

  return (
    <div className="p-4 space-y-4 max-w-xl mx-auto">
      <h1 className="text-xl font-bold">咖緊來打百家</h1>
      <div className="flex gap-2 flex-wrap">
        <Input
          type="number"
          placeholder="閒家點數"
          value={player}
          onChange={(e) => setPlayer(e.target.value)}
        />
        <Input
          type="number"
          placeholder="莊家點數"
          value={banker}
          onChange={(e) => setBanker(e.target.value)}
        />
        <Button onClick={addRound}>新增</Button>
        <Button variant="outline" onClick={exportCSV}>匯出CSV</Button>
      </div>

      <div className="text-lg font-medium">{nextPrediction()}</div>

      {rounds.map((r) => (
        <Card key={r.round}>
          <CardContent className="p-4 flex justify-between">
            <div>第 {r.round} 局</div>
            <div>
              閒 {r.player} {r.trendPlayer} ／ 莊 {r.banker} {r.trendBanker} →
              勝方：{r.result}
            </div>
          </CardContent>
        </Card>
      ))}

      {rounds.length > 0 && (
        <div className="bg-white p-4 rounded shadow">
          <h2 className="text-md font-semibold mb-2">勝方統計圖表</h2>
          <Bar data={chartData} />
        </div>
      )}
    </div>
  );
}
