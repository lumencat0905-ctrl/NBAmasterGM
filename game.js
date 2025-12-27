// ===== 球員與球隊資料 =====
const NBA_PLAYERS = {
"Golden State Warriors":[
{name:"Stephen Curry",pos:"PG",ovr:88,age:18,salary:30},
{name:"Klay Thompson",pos:"SG",ovr:85,age:18,salary:25},
{name:"Draymond Green",pos:"PF",ovr:84,age:18,salary:22}],
"Los Angeles Lakers":[
{name:"LeBron James",pos:"SF",ovr:90,age:18,salary:35},
{name:"Anthony Davis",pos:"PF",ovr:89,age:18,salary:33},
{name:"Russell Westbrook",pos:"PG",ovr:84,age:18,salary:28}],
"Cleveland Cavaliers":[
{name:"Darius Garland",pos:"PG",ovr:85,age:18,salary:25},
{name:"Evan Mobley",pos:"PF",ovr:84,age:18,salary:22},
{name:"Jarrett Allen",pos:"C",ovr:83,age:18,salary:20}],
"San Antonio Spurs":[
{name:"Keldon Johnson",pos:"SF",ovr:83,age:18,salary:21},
{name:"Dejounte Murray",pos:"PG",ovr:84,age:18,salary:22},
{name:"Jakob Poeltl",pos:"C",ovr:82,age:18,salary:19}],
"Oklahoma City Thunder":[
{name:"Shai Gilgeous-Alexander",pos:"PG",ovr:86,age:18,salary:27},
{name:"Josh Giddey",pos:"PG",ovr:84,age:18,salary:23},
{name:"Jalen Williams",pos:"SF",ovr:82,age:18,salary:20}]
};

const MAX_SIGN=2;
const SALARY_CAP=120;

// ===== 遊戲狀態 =====
let gameState={
 season:1,
 team:null,
 roster:[],
 drafted:0,
 freeAgents:[],
 aiTeams:{},
 gamesPlayed:0,
 totalGames:20,
 wins:0,
 losses:0,
 mvp:null
};

const TEAMS=Object.keys(NBA_PLAYERS);

// ===== 工具函數 =====
function clonePlayer(p){return {...p};}
function teamPower(roster){return roster.reduce((s,p)=>s+p.ovr,0)/Math.max(roster.length,1);}
function pickMVP(){ 
 let candidates=[];
 Object.values(gameState.aiTeams).forEach(t=>candidates.push(...t.roster.map(clonePlayer)));
 candidates.push(...gameState.roster.map(clonePlayer));
 if(candidates.length===0) return null;
 candidates.sort((a,b)=>(b.ovr+Math.random()*5)-(a.ovr+Math.random()*5));
 return candidates[0];
}

// ===== 初始化 AI 球隊 =====
function startSeason(){
 gameState.aiTeams={};
 TEAMS.forEach(t=>{
   if(t!==gameState.team) gameState.aiTeams[t]={roster:NBA_PLAYERS[t].map(clonePlayer)};
 });
 gameState.drafted=0;
 gameState.freeAgents=[];
 TEAMS.forEach(t=>{
   if(t!==gameState.team) gameState.freeAgents.push(...NBA_PLAYERS[t].map(clonePlayer));
 });
 gameState.gamesPlayed=0; gameState.wins=0; gameState.losses=0; gameState.mvp=null;
}

// ===== 簽約 =====
function signPlayer(i){
 if(gameState.drafted>=MAX_SIGN) return alert("最多簽兩人");
 const p=gameState.freeAgents.splice(i,1)[0];
 gameState.roster.push(clonePlayer(p));
 gameState.drafted++;
 render();
}

// ===== 模擬例行賽 =====
function simulateSeason(){
 gameState.wins=0; gameState.losses=0; gameState.gamesPlayed=0;
 for(let i=0;i<gameState.totalGames;i++){
   let myP=teamPower(gameState.roster);
   let league=0,c=0;
   Object.values(gameState.aiTeams).forEach(t=>{league+=teamPower(t.roster);c++;});
   league=c?league/c:myP;
   Math.random()<myP/(myP+league)?gameState.wins++:gameState.losses++;
   gameState.gamesPlayed++;
 }
 gameState.mvp=pickMVP();
 alert(`例行賽結束：${gameState.wins}勝 ${gameState.losses}敗\n當季MVP: ${gameState.mvp.name} (${gameState.mvp.pos}, OVR:${gameState.mvp.ovr})`);
 gameState.season++;
 // 球員老化 + AI 球員老化
 gameState.roster.forEach(p=>p.age++);
 Object.values(gameState.aiTeams).forEach(t=>t.roster.forEach(p=>p.age++));
 render();
}

// ===== UI =====
function selectTeam(){
 gameState.team=document.getElementById("teamSel").value;
 gameState.roster=NBA_PLAYERS[gameState.team].map(clonePlayer);
 startSeason();
 render();
}

function render(){
 const app=document.getElementById("app");
 if(!gameState.team){
   app.innerHTML=`<h2>選擇球隊</h2>
     <select id="teamSel">${TEAMS.map(t=>`<option>${t}</option>`).join("")}</select>
     <button id="startBtn">開始</button>`;
   document.getElementById("startBtn").addEventListener("click",selectTeam);
   return;
 }
 app.innerHTML=`
 <h2>第 ${gameState.season} 賽季｜${gameState.team}</h2>
 <section><b>你的球隊</b><br>${gameState.roster.map(p=>`<div class="player-card">${p.name}<br>${p.pos} | OVR:${p.ovr} | 年齡:${p.age}</div>`).join("")}</section>
 <section><b>自由球員（可簽 ${MAX_SIGN-gameState.drafted} 人）</b><br><div id="faList"></div><button id="finishBtn">完成簽約</button></section>
 <section><b>其他球隊</b><br>${Object.keys(gameState.aiTeams).map(t=>`<div class="player-card"><b>${t}</b><br>${gameState.aiTeams[t].roster.map(p=>p.name).join(", ")}</div>`).join("")}</section>
 <section><b>例行賽</b><br>進度：${gameState.gamesPlayed}/${gameState.totalGames}<br>戰績：${gameState.wins}勝 ${gameState.losses}敗<br><button id="simBtn">模擬例行賽</button></section>
 `;
 const faDiv=document.getElementById("faList");
 gameState.freeAgents.forEach((p,i)=>{
   if(i>=MAX_SIGN-gameState.drafted) return;
   const btn=document.createElement("button");
   btn.innerText=p.name;
   btn.addEventListener("click",()=>signPlayer(i));
   faDiv.appendChild(btn);
 });
 document.getElementById("finishBtn").addEventListener("click",()=>{
   if(gameState.drafted===0) alert("你還沒簽任何球員喔！");
   else alert("簽約已完成！");
 });
 document.getElementById("simBtn").addEventListener("click",simulateSeason);
}

render();
