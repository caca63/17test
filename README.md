<!DOCTYPE html>
<html>
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>539 中獎機率計算器（手機版）</title>
<style>
body { font-family: Arial, sans-serif; padding: 10px; line-height: 1.5; }
textarea { width: 100%; font-size: 16px; }
input[type=number] { width: 100%; font-size: 16px; }
button { font-size: 16px; padding: 10px; margin: 5px 0; width: 100%; }
pre { background: #f2f2f2; padding: 10px; overflow-x:auto; }
label { font-weight: bold; }
.r-buttons button { width: 32%; margin-right: 2%; }
.r-buttons button:last-child { margin-right: 0; }
</style>
</head>
<body>
<h2>539 中獎機率計算器（手機版）</h2>

<p>固定歷史 11 期，新增最新一期可選填</p>

<label>新增最新一期開獎號碼（可不填）：</label><br>
<input type="text" id="latest" placeholder="例如 2 5 7"><br><br>

<label>下注號碼組（每組空格隔開，換行分組）：</label><br>
<textarea id="bets" rows="5">
1 4 6
1 9 2
4 6 9
</textarea><br>

<label>衰減權重 r (0-1)：</label>
<input type="number" id="r" value="0.8" step="0.01" min="0" max="1"><br>
<div class="r-buttons">
<button onclick="setR(0.6)">r = 0.6</button>
<button onclick="setR(0.8)">r = 0.8</button>
<button onclick="setR(0.95)">r = 0.95</button>
</div><br>

<label>啟用 streak penalty：</label>
<input type="checkbox" id="streak"><br><br>

<button onclick="calculate()">計算中獎機率</button>

<h3>下注結果：</h3>
<pre id="result"></pre>

<h3>前 10 組最佳三號組：</h3>
<pre id="top10"></pre>

<script>
let historyLines = [
  [7,5,6],[9,10,4],[9,8,1],[5,4,1],[6,9,1],
  [3,7,10],[10,2,3],[8,9,6],[1,5,9],[4,1,8],[6,4,2]
];

function setR(val){
  document.getElementById("r").value = val;
}

function calculate(){
  const latestText = document.getElementById("latest").value.trim();
  const betsText = document.getElementById("bets").value.trim();
  const r = parseFloat(document.getElementById("r").value);
  const streakEnabled = document.getElementById("streak").checked;

  let hist = historyLines.map(a=>a.slice());
  if(latestText!==""){
    const latestNums = latestText.split(" ").map(Number);
    if(latestNums.length===3) hist.push(latestNums);
  }

  const betsLines = betsText.split("\n").map(l=>l.trim().split(" ").map(Number));

  let weights = Array(10).fill(0);
  for(let i=0;i<hist.length;i++){
    const w = Math.pow(r, hist.length-1-i);
    hist[i].forEach(num=>{ weights[num-1]+=w; });
  }

  if(streakEnabled){
    for(let n=1;n<=10;n++){
      let count=0,maxConsec=0,maxMiss=0;
      for(let i=0;i<hist.length;i++){
        if(hist[i].includes(n)){
          count++;
          maxConsec=Math.max(maxConsec,count);
          count=0;
        }else{
          count++;
          maxMiss=Math.max(maxMiss,count);
        }
      }
      if(maxConsec>=3) weights[n-1]*=0.7;
      if(maxMiss>=3) weights[n-1]*=1.2;
    }
  }

  const totalWeight = weights.reduce((a,b)=>a+b,0);
  const probs = weights.map(w=>w/totalWeight);

  function threeNumberProb(nums){
    let [a,b,c] = nums.map(x=>probs[x-1]);
    return a*b/(1-a)*c/(1-a-b)*6;
  }

  let results=[];
  for(let bet of betsLines){
    results.push(`${bet.join(" ")} : ${(threeNumberProb(bet)*100).toFixed(2)} %`);
  }
  document.getElementById("result").innerText = results.join("\n");

  let allComb=[];
  for(let i=1;i<=10;i++){
    for(let j=i+1;j<=10;j++){
      for(let k=j+1;k<=10;k++){
        allComb.push([i,j,k]);
      }
    }
  }
  allComb.sort((a,b)=>threeNumberProb(b)-threeNumberProb(a));
  let top10text=allComb.slice(0,10).map(arr=>`${arr.join(" ")} : ${(threeNumberProb(arr)*100).toFixed(2)} %`).join("\n");
  document.getElementById("top10").innerText=top10text;
}
</script>
</body>
</html>
