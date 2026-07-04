const storyEl = document.getElementById('story');
const codeEl = document.getElementById('codearea');
const briefEl = document.getElementById('brief');
const testfeedEl = document.getElementById('testfeed');
const actLabel = document.getElementById('actLabel');
const runBtn = document.getElementById('runBtn');
const resetBtn = document.getElementById('resetBtn');
const hintBtn = document.getElementById('hintBtn');
const flagLabels = document.querySelectorAll('.flag-label');
const progressFill = document.getElementById('progressFill');

let current = 0;
let hintShown = false;
let quizActive = false;

function say(text, cls){
  const p = document.createElement('p');
  p.className = 'line ' + cls;
  p.innerHTML = (cls === 'ravel') ? '<span class="who">Ravel — </span>' + text : text;
  storyEl.appendChild(p);
  storyEl.scrollTop = storyEl.scrollHeight;
}
function clearStory(){ storyEl.innerHTML = ''; }
function feed(text, cls){
  const d = document.createElement('div');
  d.className = cls || '';
  d.textContent = text;
  testfeedEl.appendChild(d);
  testfeedEl.scrollTop = testfeedEl.scrollHeight;
}
function clearFeed(){ testfeedEl.innerHTML = ''; }

function friendlyError(e){
  const m = e.message || String(e);
  if(/is not defined/.test(m)) return "Ravel: static on the line — you're using something before you've declared it. (" + m + ")";
  if(/Unexpected token|Unexpected end/.test(m)) return "Ravel: that didn't parse. Check for a missing bracket, semicolon, or quote. (" + m + ")";
  if(/is not a function/.test(m)) return "Ravel: you're calling something that isn't a function yet. (" + m + ")";
  return "Ravel: something broke on my end of the line — " + m;
}

// ---------------------------------------------------------------
const acts = [
  { // LOCK 1 — VARIABLES
    label: 'LOCK 1',
    brief: '<b>Objective:</b> declare <code>badgeCode</code>, <code>checksum</code>, and <code>entryCode</code> so the panel unlocks.',
    intro: [
      ['scene', "Loading dock, 11:52pm. A keypad blinks red beside a service door."],
      ['ravel', "Okay, new blood. Camera caught two numbers off the guard's badge before he walked out of frame — 82 and 19. That's your combination, but the panel wants one number, not two."],
      ['ravel', "In your console: make a variable called <code>badgeCode</code> and set it to 82. Make another called <code>checksum</code>, set to 19. Then make <code>entryCode</code> and set it equal to the two added together."],
    ],
    starter: `// Ravel: "Store what I feed you — you'll need it in a second."
let badgeCode = ;
let checksum = ;
let entryCode = ;
`,
    run(code){
      let result;
      try{
        const fn = new Function(code + '\nreturn { badgeCode, checksum, entryCode };');
        result = fn();
      }catch(e){ return { ok:false, log:[friendlyError(e)] }; }
      const log = []; let ok = true;
      if(result.badgeCode !== 82){ log.push('badgeCode should be 82, got ' + result.badgeCode); ok=false; } else log.push('badgeCode = 82 ✓');
      if(result.checksum !== 19){ log.push('checksum should be 19, got ' + result.checksum); ok=false; } else log.push('checksum = 19 ✓');
      if(result.entryCode !== 101){ log.push('entryCode should be 101 (badgeCode + checksum), got ' + result.entryCode); ok=false; } else log.push('entryCode = 101 ✓');
      return { ok, log };
    },
    success: [
      ['system', 'PANEL: 101 ACCEPTED — DOOR UNLOCKED'],
      ['ravel', "Nice. That's the whole trick of a variable — it's a box with a name on it. Fill it once, point at the name instead of the number."],
    ],
    quiz: [
      { q: "What does `let badgeCode = 82;` actually do?",
        options: ["Runs a function named badgeCode", "Creates a variable named badgeCode and stores 82 in it", "Compares badgeCode to 82", "Deletes badgeCode"],
        correct: 1 },
      { q: "`let a = 10; let b = a; a = 99;` — what is `b` now?",
        options: ["99", "10", "undefined", "It throws an error"],
        correct: 1 },
    ],
  },

  { // LOCK 2 — CONDITIONALS
    label: 'LOCK 2',
    brief: '<b>Objective:</b> using the given <code>guardDistance</code>, set <code>action</code> to <code>"hide"</code>, <code>"move"</code>, or <code>"sprint"</code>.',
    intro: [
      ['scene', "Inside. A corridor. Somewhere down it, a guard is walking a loop."],
      ['ravel', "I've got eyes on him through the camera and I'll call out how far he is in meters, live. You don't get to pick the number — you have to handle whatever I say."],
      ['ravel', "Write it so: under 8 meters, <code>action</code> is <code>\"hide\"</code>. Between 8 and 20, <code>\"move\"</code>. Over 20, <code>\"sprint\"</code>. I don't know which one I'll shout yet — that's the point."],
    ],
    starter: `// guardDistance is set for you each time — don't redeclare it.
let action;

if (guardDistance < 8) {

} else if (guardDistance <= 20) {

} else {

}
`,
    run(code){
      const cases = [
        {d:4, expect:'hide',  line:"he's basically on top of you."},
        {d:15, expect:'move', line:'moving, but not urgent.'},
        {d:30, expect:'sprint', line:'clear runway.'},
      ];
      const log = []; let ok = true;
      for(const c of cases){
        try{
          const fn = new Function('guardDistance', code + '\nreturn action;');
          const res = fn(c.d);
          if(res === c.expect) log.push(c.d + 'm → "' + res + '" ✓  (' + c.line + ')');
          else { log.push(c.d + 'm → expected "' + c.expect + '", got "' + res + '"'); ok = false; }
        }catch(e){ log.push(c.d + 'm → ' + friendlyError(e)); ok = false; }
      }
      return { ok, log };
    },
    success: [
      ['system', 'THREE SCENARIOS RUN — ALL CLEAR'],
      ['ravel', "That's a conditional. Same code, three different nights, three right answers — it reacts instead of guessing."],
    ],
    quiz: [
      { q: "Which keyword lets code branch based on a condition?",
        options: ["function", "let", "if", "return"], correct: 2 },
      { q: "In `if (x > 10) {...} else {...}`, when does the else block run?",
        options: ["Only when x > 10", "Always, no matter what", "Whenever x is NOT greater than 10", "Never"], correct: 2 },
    ],
  },

  { // LOCK 3 — FUNCTIONS
    label: 'LOCK 3',
    brief: '<b>Objective:</b> define <code>pickLock(pins)</code> and use it for two doors, storing results in <code>door1Time</code> and <code>door2Time</code>.',
    intro: [
      ['scene', "Two more doors ahead. Same kind of lock, different pin counts."],
      ['ravel', "You could write the timing math twice. Don't. Teach the console the routine once, then just ask for it by name."],
      ['ravel', "Write a function <code>pickLock(pins)</code> that returns <code>pins * 2 + 3</code>. Then call it for a 4-pin door and a 7-pin door, storing results as <code>door1Time</code> and <code>door2Time</code>."],
    ],
    starter: `function pickLock(pins) {

}

let door1Time = pickLock(4);
let door2Time = pickLock(7);
`,
    run(code){
      let result;
      try{
        const fn = new Function(code + '\nreturn { pickLock: (typeof pickLock === "function") ? pickLock : null, door1Time, door2Time };');
        result = fn();
      }catch(e){ return { ok:false, log:[friendlyError(e)] }; }
      const log = []; let ok = true;
      if(!result.pickLock){ return {ok:false, log:['pickLock is not defined as a function']}; }
      const t4 = result.pickLock(4), t7 = result.pickLock(7);
      if(t4 !== 11){ log.push('pickLock(4) should return 11, got ' + t4); ok=false; } else log.push('pickLock(4) = 11 ✓');
      if(t7 !== 17){ log.push('pickLock(7) should return 17, got ' + t7); ok=false; } else log.push('pickLock(7) = 17 ✓');
      if(result.door1Time !== 11){ log.push('door1Time should be 11, got ' + result.door1Time); ok=false; } else log.push('door1Time = 11 ✓');
      if(result.door2Time !== 17){ log.push('door2Time should be 17, got ' + result.door2Time); ok=false; } else log.push('door2Time = 17 ✓');
      return { ok, log };
    },
    success: [
      ['system', 'DOOR 1: 11s · DOOR 2: 17s — BOTH OPEN'],
      ['ravel', "That's a function. Write the thinking once, reuse it as many times as the job needs."],
    ],
    quiz: [
      { q: "Why use a function instead of repeating the same code?",
        options: ["It makes the code run faster automatically", "You write the logic once and reuse it anywhere", "JavaScript requires it", "Functions can't contain bugs"], correct: 1 },
      { q: "What does `return` do inside a function?",
        options: ["Stops the entire program", "Sends a value back to wherever the function was called", "Deletes the function", "Prints text to the screen"], correct: 1 },
    ],
  },

  { // FINALE — THE VAULT
    label: 'THE VAULT',
    brief: '<b>Objective:</b> declare <code>sweetSpot</code> (47) and <code>tolerance</code> (2), then write <code>crackVault(digit)</code> returning true if digit is within tolerance of sweetSpot.',
    intro: [
      ['scene', "The vault door. An old mechanical dial — you have to feel this one."],
      ['ravel', "There's a sweet spot on the dial — 47 — and a couple degrees either side where the tumbler still catches. Everywhere else, nothing."],
      ['ravel', "Set <code>sweetSpot</code> to 47 and <code>tolerance</code> to 2. Write <code>crackVault(digit)</code> returning <code>true</code> if digit is within tolerance of sweetSpot in either direction, else <code>false</code>. A variable, a condition, and a function, all at once."],
    ],
    starter: `let sweetSpot = 47;
let tolerance = 2;

function crackVault(digit) {

}
`,
    run(code){
      const cases = [ {d:47, expect:true}, {d:49, expect:true}, {d:45, expect:true}, {d:50, expect:false}, {d:30, expect:false} ];
      const log = []; let ok = true; let fn;
      try{
        fn = new Function(code + '\nreturn { crackVault: (typeof crackVault === "function") ? crackVault : null };')();
      }catch(e){ return { ok:false, log:[friendlyError(e)] }; }
      if(!fn.crackVault){ return {ok:false, log:['crackVault is not defined as a function']}; }
      for(const c of cases){
        let res;
        try{ res = fn.crackVault(c.d); } catch(e){ log.push('digit ' + c.d + ' → ' + friendlyError(e)); ok=false; continue; }
        if(res === c.expect) log.push('digit ' + c.d + ' → ' + res + ' ✓');
        else { log.push('digit ' + c.d + ' → expected ' + c.expect + ', got ' + res); ok = false; }
      }
      return { ok, log };
    },
    success: [
      ['system', 'TUMBLER CAUGHT — VAULT OPEN'],
      ['ravel', "That's the whole job. A variable to hold what matters, a condition to judge it, a function to do it on command."],
    ],
    quiz: [
      { q: "Which best matches each concept to its job?",
        options: [
          "variable = decide, conditional = hold a value, function = repeat text",
          "variable = hold a value, conditional = decide, function = reuse logic",
          "variable = reuse logic, conditional = hold a value, function = decide",
          "They all do the same thing"
        ], correct: 1 },
      { q: "What's the real benefit of combining all three together?",
        options: [
          "It makes the code look more advanced",
          "You can write logic that reacts to different data without repeating yourself",
          "It's required for JavaScript to run",
          "It prevents all bugs"
        ], correct: 1 },
    ],
    isFinale: true,
  },
];

const QUIZ_COLORS = ['#ef5b4e','#4caf82','#3a4695','#f3c02e'];

function updateProgress(){
  flagLabels.forEach(f => {
    const i = +f.dataset.lock;
    f.classList.remove('active','done');
    if(i < current) f.classList.add('done');
    else if(i === current) f.classList.add('active');
  });
  const total = 1200;
  const pct = Math.min(current / acts.length, 1);
  progressFill.style.strokeDashoffset = String(total - total * pct);
}

function loadAct(i){
  current = i; hintShown = false; quizActive = false;
  clearStory(); clearFeed();
  updateProgress();
  runBtn.disabled = false;
  if(i >= acts.length){ renderFinaleScreen(); return; }
  const act = acts[i];
  actLabel.textContent = act.label;
  briefEl.innerHTML = act.brief;
  codeEl.value = act.starter;
  act.intro.forEach(([cls, txt], idx) => setTimeout(() => say(txt, cls), idx * 260));
}

function startQuiz(actIndex, quizIndex){
  quizIndex = quizIndex || 0;
  quizActive = true;
  runBtn.disabled = true;
  const act = acts[actIndex];
  if(quizIndex === 0){
    say('Quick check before we move on —', 'scene');
  }
  const q = act.quiz[quizIndex];
  const block = document.createElement('div');
  block.className = 'quiz-block';
  block.innerHTML = '<p class="quiz-q">' + (quizIndex+1) + '. ' + q.q + '</p><div class="quiz-opts"></div>';
  const optsWrap = block.querySelector('.quiz-opts');
  q.options.forEach((opt, oi) => {
    const btn = document.createElement('button');
    btn.className = 'quiz-opt';
    btn.style.borderColor = 'var(--ink)';
    btn.textContent = opt;
    btn.addEventListener('click', () => {
      const allBtns = optsWrap.querySelectorAll('.quiz-opt');
      allBtns.forEach(b => b.disabled = true);
      if(oi === q.correct){
        btn.classList.add('correct');
        say("That's it. ", 'ravel');
      } else {
        btn.classList.add('wrong');
        allBtns[q.correct].classList.add('correct');
        say("Close — the highlighted one's the right call, but you've got the idea.", 'ravel');
      }
      setTimeout(() => {
        if(quizIndex + 1 < act.quiz.length) startQuiz(actIndex, quizIndex + 1);
        else loadAct(actIndex + 1);
      }, 1100);
    });
    optsWrap.appendChild(btn);
  });
  storyEl.appendChild(block);
  storyEl.scrollTop = storyEl.scrollHeight;
}

function renderFinaleScreen(){
  document.querySelector('.stage').innerHTML = `
    <div class="panel light" style="grid-column:1/-1;">
      <div class="finale-screen">
        <h2>THE VAULT IS OPEN.</h2>
        <p>Three locks, three ideas: a variable to hold what matters, a condition to judge it, a function to reuse the thinking. Everything else you'll learn is just bigger versions of these three.</p>
        <p style="color:var(--blue); font-weight:600;">— Ravel signs off. See you on the next job.</p>
        <button class="run" id="playAgain" style="margin-top:14px; box-shadow:0 3px 0 var(--ink);">Run it again</button>
      </div>
    </div>`;
  document.getElementById('playAgain').addEventListener('click', () => location.reload());
}

runBtn.addEventListener('click', () => {
  if(quizActive) return;
  const act = acts[current];
  clearFeed();
  const { ok, log } = act.run(codeEl.value);
  log.forEach(l => feed(l, l.includes('✓') ? 'pass' : 'fail'));
  if(ok){
    act.success.forEach(([cls, txt], idx) => setTimeout(() => say(txt, cls), idx * 300 + 150));
    setTimeout(() => startQuiz(current, 0), act.success.length * 300 + 900);
  } else {
    say("Try again — check the console feed below for what's off.", 'scene');
  }
});

resetBtn.addEventListener('click', () => { codeEl.value = acts[current].starter; clearFeed(); });

hintBtn.addEventListener('click', () => {
  if(hintShown) return;
  hintShown = true;
  const hints = [
    "Hint: `let name = value;` creates a variable. You can use one variable's value when creating another, e.g. `let c = a + b;`.",
    "Hint: `if (condition) { ... } else if (condition2) { ... } else { ... }` runs only the first block whose condition is true.",
    "Hint: `function name(parameter) { return something; }` defines reusable logic. Call it later with `name(value)`.",
    "Hint: you can nest an if/else inside a function body — the function just returns whatever that logic decides.",
  ];
  say(hints[current], 'system');
});

loadAct(0);
