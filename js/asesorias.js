/* ════════════════════════════
   CLOCK
════════════════════════════ */
function updateClock(){const d=new Date();const el=document.getElementById('topTime');if(el)el.textContent=d.getHours().toString().padStart(2,'0')+':'+d.getMinutes().toString().padStart(2,'0');}
updateClock();setInterval(updateClock,30000);

/* ════════════════════════════
   TIME-ADAPTIVE THEME
   Changes header gradient & accent colors based on time of day
════════════════════════════ */
function applyTimeTheme(){
  const h=new Date().getHours();
  const root=document.documentElement;
  let theme;
  if(h>=5&&h<12){
    // Morning — warm golden sunrise
    theme={
      '--time-grad':'linear-gradient(135deg,#1a3a4a 0%,#0a3d62 50%,#7a5c38 100%)',
      '--time-accent':'#c9a87c',
      '--time-glow':'rgba(201,168,124,0.18)',
      '--time-label':'Mañana ☀️'
    };
  } else if(h>=12&&h<17){
    // Afternoon — ocean blue
    theme={
      '--time-grad':'linear-gradient(135deg,#0a3d62 0%,#0f6b7c 50%,#1f7a8c 100%)',
      '--time-accent':'#1f7a8c',
      '--time-glow':'rgba(31,122,140,0.18)',
      '--time-label':'Tarde 🌤️'
    };
  } else if(h>=17&&h<20){
    // Sunset — warm amber/rose
    theme={
      '--time-grad':'linear-gradient(135deg,#4a1a2a 0%,#a87c4f 50%,#c9a87c 100%)',
      '--time-accent':'#e8a87c',
      '--time-glow':'rgba(232,168,124,0.22)',
      '--time-label':'Atardecer 🌅'
    };
  } else {
    // Night — deep navy/indigo
    theme={
      '--time-grad':'linear-gradient(135deg,#030a10 0%,#071525 50%,#0a1f35 100%)',
      '--time-accent':'#6b9abe',
      '--time-glow':'rgba(107,154,190,0.15)',
      '--time-label':'Noche 🌙'
    };
  }
  for(const [k,v] of Object.entries(theme)){
    root.style.setProperty(k,v);
  }
  // Apply to gold bar at top
  const bar=document.getElementById('sp-time-bar');
  if(bar) bar.style.background=theme['--time-grad'];
}
applyTimeTheme();

/* ════════════════════════════
   AMBIENT AUDIO ENGINE
   Subtle background sounds per section on scroll
════════════════════════════ */
const AMBIENT={
  '#destinos':{freq:[220,330,440],label:'Olas · Punta Cana'},
  '#proceso':{freq:[174,261,348],label:'Brisa · Jarabacoa'},
};

let audioCtx=null,ambientNode=null,ambientGain=null;
function getAudioCtx(){
  if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  return audioCtx;
}
function startAmbient(freqs){
  try{
    const ctx=getAudioCtx();
    stopAmbient();
    ambientGain=ctx.createGain();
    ambientGain.gain.setValueAtTime(0,ctx.currentTime);
    ambientGain.gain.linearRampToValueAtTime(0.04,ctx.currentTime+2);
    ambientGain.connect(ctx.destination);
    ambientNode=[];
    freqs.forEach((f,i)=>{
      const osc=ctx.createOscillator();
      const g=ctx.createGain();
      osc.type='sine';
      osc.frequency.value=f*(0.98+Math.random()*0.04);
      g.gain.value=1/(i+2);
      osc.connect(g);g.connect(ambientGain);
      osc.start();
      ambientNode.push(osc);
    });
  }catch(e){}
}
function stopAmbient(){
  try{
    if(ambientGain){ambientGain.gain.linearRampToValueAtTime(0,audioCtx.currentTime+1.5);}
    setTimeout(()=>{if(ambientNode)ambientNode.forEach(n=>{try{n.stop();}catch(e){}});ambientNode=null;},1600);
  }catch(e){}
}

// Unlock audio on first interaction
let audioUnlocked=false;
document.addEventListener('click',()=>{if(!audioUnlocked){audioUnlocked=true;try{const c=new(window.AudioContext||window.webkitAudioContext)();c.resume();audioCtx=c;}catch(e){}}},{once:true});

// Scroll observer for ambient audio
let currentAmbient=null;
const ambientObserver=new IntersectionObserver(entries=>{
  entries.forEach(e=>{
    const id='#'+e.target.id;
    if(e.isIntersecting&&AMBIENT[id]&&audioUnlocked&&id!==currentAmbient){
      currentAmbient=id;
      startAmbient(AMBIENT[id].freq);
    }
  });
},{threshold:0.4});
document.querySelectorAll('#destinos,#proceso').forEach(el=>ambientObserver.observe(el));


/* ════════════════════════════
   SCROLL REVEAL (cards + sections)
════════════════════════════ */
const revEls=document.querySelectorAll('.sp-card-3d,.sp-cs-header,.sp-rv,.sp-di-left,.sp-di-right,.sp-ps-head,.sp-step');
revEls.forEach((el,i)=>{el.style.cssText=`opacity:0;transform:translateY(36px);transition:opacity .7s ${i*.07}s ease,transform .7s ${i*.07}s cubic-bezier(.16,1,.3,1);`;});
const ro=new IntersectionObserver(entries=>{entries.forEach(e=>{if(e.isIntersecting){e.target.style.opacity='1';e.target.style.transform='translateY(0)';e.target.querySelectorAll('.sp-counter').forEach(startCounter);}});},{threshold:.1});
revEls.forEach(el=>ro.observe(el));

function startCounter(el){
  if(el.dataset.done)return;el.dataset.done=1;
  const tgt=+el.dataset.target,dur=2000,s=performance.now();
  (function tick(now){const p=Math.min((now-s)/dur,1),ease=1-Math.pow(1-p,4);el.textContent=Math.round(ease*tgt);if(p<1)requestAnimationFrame(tick);else el.textContent=tgt;})(performance.now());
}

/* ════════════════════════════
   PARALLAX 3D ON CARDS (mouse move)
════════════════════════════ */
document.querySelectorAll('.sp-card-3d').forEach(card=>{
  card.addEventListener('mousemove',e=>{
    const r=card.getBoundingClientRect();
    const x=((e.clientX-r.left)/r.width-.5)*2;
    const y=((e.clientY-r.top)/r.height-.5)*2;
    const body=card.querySelector('.sp-card-body');
    const img=card.querySelector('.sp-card-img img');
    if(body) body.style.transform=`perspective(900px) rotateY(${x*8}deg) rotateX(${-y*6}deg) translateY(-10px)`;
    if(img) img.style.transform=`scale(1.06) translate(${x*-6}px,${y*-6}px)`;
  });
  card.addEventListener('mouseleave',()=>{
    const body=card.querySelector('.sp-card-body');
    const img=card.querySelector('.sp-card-img img');
    if(body) body.style.transform='';
    if(img) img.style.transform='';
  });
});

/* ════════════════════════════
   PROCESS ACCORDION
════════════════════════════ */
function toggleStep(trigger){const step=trigger.closest('.sp-step'),isOpen=step.classList.contains('sp-open');document.querySelectorAll('.sp-step').forEach(s=>s.classList.remove('sp-open'));if(!isOpen)step.classList.add('sp-open');}

/* ════════════════════════════
   DESTINATION MATCH BAR
   Updates as user chats — tracks keywords
════════════════════════════ */
const DEST_SIGNALS={
  presupuesto:15,precio:15,dias:12,fechas:12,
  personas:10,grupo:10,pareja:10,familia:10,solo:8,
  'punta cana':20,'samaná':18,'jarabacoa':15,'zona colonial':15,'las terrenas':15,
  luna:12,'miel':12,lujo:10,aventura:10,playa:8,
  vuelo:8,hotel:8,traslado:6,
};
let matchScore=0;

function updateMatchBar(text){
  const t=text.toLowerCase();
  let gained=0;
  for(const [k,v] of Object.entries(DEST_SIGNALS)){if(t.includes(k))gained+=v;}
  matchScore=Math.min(100,matchScore+gained);
  const bar=document.getElementById('sp-match-fill');
  const pct=document.getElementById('sp-match-pct');
  if(bar){bar.style.width=matchScore+'%';}
  if(pct){pct.textContent=matchScore+'%';}
  const label=document.getElementById('sp-match-label');
  if(label){
    if(matchScore<25)label.textContent='Cuéntame más…';
    else if(matchScore<50)label.textContent='¡Vamos bien! 🌴';
    else if(matchScore<75)label.textContent='¡Casi en tu destino! ✈️';
    else label.textContent='¡Destino ideal encontrado! 🎉';
  }
}

/* ════════════════════════════
   VOICE ENGINE — FEMALE PRIORITY
════════════════════════════ */
const synth=window.speechSynthesis;
let voices=[],preferredVoice=null,globalMuted=false;
let micTarget=null,recognition=null,isRecording=false;

function pickVoice(){
  voices=synth?synth.getVoices():[];
  if(!voices.length)return;
  const FEMALE_NAMES=/(Paulina|Monica|Luciana|Valeria|Laura|Helena|Conchita|Penelope|Iveta|Margarita|Camila|Daniela|Sabina|Soledad|Rosa|Carmen|Isabel|María|Andrea|Sofía|Sofia)/i;
  const FEMALE_WORDS=/(female|woman|mujer|feminine|femenin)/i;
  const priority=[
    v=>/^es/i.test(v.lang)&&FEMALE_NAMES.test(v.name),
    v=>/^es/i.test(v.lang)&&FEMALE_WORDS.test(v.name),
    v=>/es[-_]US/i.test(v.lang)&&/google/i.test(v.name),
    v=>/es[-_]ES/i.test(v.lang)&&/google/i.test(v.name),
    v=>/^es/i.test(v.lang)&&/google/i.test(v.name),
    v=>/es[-_]US/i.test(v.lang),
    v=>/es[-_]ES/i.test(v.lang),
    v=>/^es/i.test(v.lang),
  ];
  for(const test of priority){const f=voices.find(test);if(f){preferredVoice=f;break;}}
  if(window.SpeechRecognition||window.webkitSpeechRecognition){const n=document.getElementById('heroMicNote');if(n)n.style.display='none';}
}
if(synth){pickVoice();synth.onvoiceschanged=pickVoice;}

function speak(text){
  if(globalMuted||!synth)return;
  synth.cancel();
  const u=new SpeechSynthesisUtterance(text);
  u.lang='es-ES';u.rate=0.93;u.pitch=1.2;u.volume=1;
  if(preferredVoice)u.voice=preferredVoice;
  synth.speak(u);
}

/* ════════════════════════════
   SPEECH RECOGNITION + VOICE COMMANDS FOR SOFÍA
════════════════════════════ */
function buildRecog(){
  const SR=window.SpeechRecognition||window.webkitSpeechRecognition;
  if(!SR)return null;
  const r=new SR();
  r.lang='es-ES';r.continuous=false;r.interimResults=false;r.maxAlternatives=1;
  r.onresult=e=>{
    const text=e.results[0][0].transcript;stopMic();
    // Check for voice commands first
    if(handleVoiceCommand(text))return;
    if(micTarget==='hero'){document.getElementById('heroInput').value=text;heroSend();}
    else{document.getElementById('fabInput').value=text;fabSend();}
  };
  r.onerror=e=>{
    stopMic();
    if(e.error==='not-allowed')alert('⚠️ Permiso de micrófono denegado.\n\nHaz clic en el candado 🔒 en la barra del navegador → Permite el micrófono → Recarga la página.');
    else if(e.error==='network')console.warn('Red no disponible para reconocimiento de voz');
  };
  r.onend=()=>{if(isRecording)stopMic();};
  return r;
}

// Voice commands handler
function handleVoiceCommand(text){
  const t=text.toLowerCase();
  // "Sofía, muéstrame [destino]"
  const showMatch=t.match(/s[ou]f[ií]a[,\s]+m[uú][eé]strame\s+(.+)/i)||t.match(/m[uú][eé]strame\s+(.+)/i);
  if(showMatch){
    const dest=showMatch[1].trim().toLowerCase();
    const destMap={'punta cana':0,'samaná':1,'samana':1,'jarabacoa':2,'zona colonial':3,'las terrenas':4,'terrenas':4,'vip':5};
    for(const [k,v] of Object.entries(destMap)){
      if(dest.includes(k)){
        openDestChat(v);
        speak(`Claro, te muestro ${k}`);
        return true;
      }
    }
  }
  // "Sofía, filtra aventura / romance / familia"
  const filterMatch=t.match(/s[ou]f[ií]a[,\s]+filtra[,\s]+(.+)/i)||t.match(/filtra por\s+(.+)/i);
  if(filterMatch){
    const tipo=filterMatch[1].trim().toLowerCase();
    const filterMap={
      'aventura':2,'adrenalina':2,
      'romance':1,'luna de miel':1,'pareja':1,
      'familia':4,'niños':4,
      'lujo':5,'vip':5,
      'cultura':3,'historia':3,
    };
    for(const [k,v] of Object.entries(filterMap)){
      if(tipo.includes(k)){
        openDestChat(v);
        speak(`Filtrando por ${tipo}`);
        return true;
      }
    }
  }
  // "Sofía, desplázate a destinos / proceso"
  const scrollMatch=t.match(/s[ou]f[ií]a[,\s]+.*(destinos|proceso|inicio)/i);
  if(scrollMatch){
    const sec=scrollMatch[1].toLowerCase();
    const el=document.getElementById(sec==='inicio'?'inicio':sec);
    if(el){el.scrollIntoView({behavior:'smooth'});speak(`Navegando a ${sec}`);return true;}
  }
  return false;
}

function toggleMic(target){if(isRecording){stopMic();return;}startMic(target);}
function startMic(target){
  if(!(window.SpeechRecognition||window.webkitSpeechRecognition)){alert('🎤 Tu navegador no soporta reconocimiento de voz.\n\nAbre este archivo .html directamente en Google Chrome.');return;}
  micTarget=target;try{if(recognition)recognition.abort();}catch(e){}
  recognition=buildRecog();if(!recognition)return;
  try{recognition.start();isRecording=true;setMicUI(target,true);}
  catch(e){setTimeout(()=>{recognition=buildRecog();try{recognition.start();isRecording=true;setMicUI(target,true);}catch(e2){}},250);}
}
function stopMic(){isRecording=false;try{if(recognition)recognition.abort();}catch(e){}setMicUI('hero',false);setMicUI('fab',false);}
function setMicUI(target,on){
  const b=document.getElementById(target==='hero'?'heroMic':'fabMic');
  const i=document.getElementById(target==='hero'?'heroMicIco':'fabMicIco');
  if(b)b.classList.toggle('sp-recording',on);if(i)i.innerHTML=on?'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3.5h6A1.5 1.5 0 0 1 12.5 5v6a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 11V5A1.5 1.5 0 0 1 5 3.5"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M5 3a3 3 0 0 1 6 0v5a3 3 0 0 1-6 0z"/><path d="M3.5 6.5A.5.5 0 0 1 4 7v1a4 4 0 0 0 8 0V7a.5.5 0 0 1 1 0v1a5 5 0 0 1-4.5 4.975V15h3a.5.5 0 0 1 0 1h-7a.5.5 0 0 1 0-1h3v-2.025A5 5 0 0 1 3 8V7a.5.5 0 0 1 .5-.5"/></svg>';
}

/* ════════════════════════════
   REPLIES
════════════════════════════ */
const REPLIES={
  default:["¡Hola! 🌴 Soy Sofía. ¿Qué destino de la República Dominicana te gustaría explorar?","¡Claro que sí! ¿Viajas solo, en pareja o en grupo? Eso me ayuda a diseñar algo especial.","¿Tienes alguna fecha en mente para tu viaje?","¿Cuál es tu presupuesto aproximado? Tenemos opciones para todos los niveles.","¡Excelente! Puedo prepararte una propuesta personalizada en 24 horas. ¿Te contacto con un asesor?"],
  'punta cana':"¡Punta Cana es lo mejor del Caribe! 🏖️ Aguas turquesas y resorts de clase mundial. Paquetes desde $1,499 todo incluido. ¿Cuántos días tienes?",
  'samaná':"Samaná es pura magia. 🐳 Entre enero y marzo puedes ver ballenas jorobadas. La Cascada El Limón es un secreto que pocos conocen. ¿Cuándo piensas viajar?",
  'jarabacoa':"El corazón verde de la isla. 🏔️ Rafting, cañoning y el Pico Duarte. Para espíritus aventureros. ¿Buscas adrenalina extrema?",
  'luna de miel':"¡Qué momento tan especial! 💍 Organizamos cenas privadas en la playa, villas exclusivas y spa de pareja. ¿Ya tienen fecha elegida?",
  'precio':"Nuestros paquetes inician desde $799 por persona. VIP desde $2,500. Todo incluye asesoría y asistencia 24/7. ¿Te preparo una cotización?",
  'presupuesto':"Cuéntame cuánto tienes en mente y te diseño el mejor plan. ¡Tenemos opciones para todos! 🌟",
  'hola':"¡Hola! 🌴 Soy Sofía, tu asesora de viajes. Estoy aquí para ayudarte a crear la experiencia perfecta en la República Dominicana. ¿Por dónde empezamos?",
  'gracias':"¡Con mucho gusto! 😊 Para eso estoy. ¿Hay algo más en lo que te pueda ayudar?",
};
function getReply(txt){const t=txt.toLowerCase();for(const k in REPLIES)if(k!=='default'&&t.includes(k))return REPLIES[k];const arr=REPLIES.default;return arr[Math.floor(Math.random()*arr.length)];}
function timeStr(){return new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});}

function addMsg(cId,text,isMe){
  return new Promise(res=>{
    const c=document.getElementById(cId);const d=document.createElement('div');d.className=`sp-msg ${isMe?'sp-me':'sp-bot'}`;
    d.innerHTML=`<div class="sp-msg-av">${isMe?'Tú':'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.134"/><path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/></svg>'}</div><div><div class="sp-msg-b">${text}</div><span class="sp-msg-t">${timeStr()}</span></div>`;
    c.appendChild(d);c.scrollTop=c.scrollHeight;setTimeout(res,50);
  });
}
function showTyping(cId){const c=document.getElementById(cId);const d=document.createElement('div');d.className='sp-msg sp-bot';d.id=cId+'_typ';d.innerHTML='<div class="sp-msg-av"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.134"/><path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/></svg></div><div><div class="sp-typing-bub"><div class="sp-tdot"></div><div class="sp-tdot"></div><div class="sp-tdot"></div></div></div>';c.appendChild(d);c.scrollTop=c.scrollHeight;}
function hideTyping(cId){const el=document.getElementById(cId+'_typ');if(el)el.remove();}
async function botReply(cId,userText){
  showTyping(cId);
  await new Promise(r=>setTimeout(r,850+Math.random()*500));
  hideTyping(cId);
  const reply=getReply(userText);
  await addMsg(cId,reply,false);
  speak(reply);
  // Update match bar on every exchange
  updateMatchBar(userText);
}

let heroGreeted=false;
function heroGreet(){if(heroGreeted)return;heroGreeted=true;setTimeout(async()=>{const g="¡Hola! 🌴 Soy Sofía. ¿Sobre qué destino de la República Dominicana te gustaría saber más?";await addMsg('heroMsgs',g,false);speak(g);},1000);}
heroGreet();
async function heroSend(){const inp=document.getElementById('heroInput');const txt=inp.value.trim();if(!txt)return;inp.value='';await addMsg('heroMsgs',txt,true);botReply('heroMsgs',txt);document.getElementById('heroChips').style.display='none';}
async function heroChipSend(txt){await addMsg('heroMsgs',txt,true);botReply('heroMsgs',txt);document.getElementById('heroChips').style.display='none';}
function clearHeroChat(){document.getElementById('heroMsgs').innerHTML='';heroGreeted=false;heroGreet();}
function toggleMuteHero(){globalMuted=!globalMuted;syncMuteUI();if(globalMuted&&synth)synth.cancel();}

let fabOpen=false,fabGreeted=false;
function toggleFab(){fabOpen?closeFab():openFab();}
function openFab(){
  fabOpen=true;document.getElementById('fabPanel').classList.add('sp-open');document.getElementById('fabBtn').classList.add('sp-open');document.getElementById('fabIco').innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M2.146 2.854a.5.5 0 1 1 .708-.708L8 7.293l5.146-5.147a.5.5 0 0 1 .708.708L8.707 8l5.147 5.146a.5.5 0 0 1-.708.708L8 8.707l-5.146 5.147a.5.5 0 0 1-.708-.708L7.293 8z"/></svg>';
  if(!fabGreeted){fabGreeted=true;setTimeout(async()=>{const g="¡Hola! 🌴 Soy Sofía. ¿En qué puedo ayudarte a planear tu viaje perfecto?";await addMsg('fabMsgs',g,false);speak(g);},350);}
}
function closeFab(){fabOpen=false;document.getElementById('fabPanel').classList.remove('sp-open');document.getElementById('fabBtn').classList.remove('sp-open');document.getElementById('fabIco').innerHTML='<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M16 8c0 3.866-3.582 7-8 7a9 9 0 0 1-2.347-.306c-.584.296-1.925.864-4.181 1.234-.2.032-.352-.176-.273-.362.354-.836.674-1.95.77-2.966C.744 11.37 0 9.76 0 8c0-3.866 3.582-7 8-7s8 3.134 8 7M5 8a1 1 0 1 0-2 0 1 1 0 0 0 2 0m4 0a1 1 0 1 0-2 0 1 1 0 0 0 2 0m3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2"/></svg>';if(synth)synth.cancel();}
async function fabSend(){const inp=document.getElementById('fabInput');const txt=inp.value.trim();if(!txt)return;inp.value='';await addMsg('fabMsgs',txt,true);botReply('fabMsgs',txt);document.getElementById('fabChips').style.display='none';}
async function fabChipSend(txt){await addMsg('fabMsgs',txt,true);botReply('fabMsgs',txt);document.getElementById('fabChips').style.display='none';}
function toggleMuteFab(){globalMuted=!globalMuted;syncMuteUI();if(globalMuted&&synth)synth.cancel();}

function syncMuteUI(){
  ['heroMuteIco','fabMuteIco'].forEach(id=>{const el=document.getElementById(id);if(el)el.innerHTML=globalMuted?'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M6.717 3.55A.5.5 0 0 1 7 4v8a.5.5 0 0 1-.812.39L3.825 10.5H1.5A.5.5 0 0 1 1 10V6a.5.5 0 0 1 .5-.5h2.325zm7.468 5.017a.5.5 0 0 1-.707.707L12 7.793l-1.478 1.479a.5.5 0 0 1-.707-.707L11.293 7 9.815 5.521a.5.5 0 0 1 .707-.707L12 6.293l1.478-1.479a.5.5 0 0 1 .707.707L12.707 7z"/></svg>':'<svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M11.536 14.01A8.47 8.47 0 0 0 14.026 8a8.47 8.47 0 0 0-2.49-6.01l-.708.707A7.48 7.48 0 0 1 13.025 8c0 2.071-.84 3.946-2.197 5.303z"/><path d="M10.121 12.596A6.48 6.48 0 0 0 12.025 8a6.48 6.48 0 0 0-1.904-4.596l-.707.707A5.48 5.48 0 0 1 11.025 8a5.48 5.48 0 0 1-1.61 3.89z"/><path d="M10.025 8a4.49 4.49 0 0 1-1.318 3.182L8 10.475A3.49 3.49 0 0 0 9.025 8c0-.966-.392-1.841-1.025-2.475l.707-.707A4.49 4.49 0 0 1 10.025 8M7 4a.5.5 0 0 0-.812-.39L3.825 5.5H1.5A.5.5 0 0 0 1 6v4a.5.5 0 0 0 .5.5h2.325l2.363 1.89A.5.5 0 0 0 7 12z"/></svg>';});
  ['heroMuteBtn','fabMuteBtn'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('sp-muted-active',globalMuted);});
  ['heroVbar','fabVbar'].forEach(id=>{const el=document.getElementById(id);if(el)el.classList.toggle('sp-muted',globalMuted);});
}

/* ════════════════════════
   DESTINATION CHAT — Ver más opens Sofía talking about that destination
════════════════════════ */
const DEST_MSGS = [
  [
    "¡Punta Cana es nuestro destino estrella! ⭐ Hablamos de 50 km de playa blanca, aguas turquesas y resorts de clase mundial.",
    "Para este paquete incluimos vuelos ida y vuelta, hotel 5 estrellas todo incluido, traslados privados y tour a Isla Saona. Todo desde <strong>$1,499 por persona</strong>.",
    "El itinerario dura entre 5 y 7 días. Días de playa privada, spa de lujo, deportes acuáticos y una cena romántica en la orilla del mar. 🏖️",
    "¿Te gustaría que te prepare una cotización personalizada? Cuéntame cuántas personas viajan y las fechas que tienes en mente."
  ],
  [
    "Samaná es pura magia. 🌊 Entre enero y marzo puedes ver ballenas jorobadas directamente desde el barco — un espectáculo único en el Caribe.",
    "Este paquete incluye villa boutique frente al mar, tour de ballenas, visita a la Cascada El Limón, cena privada en playa y spa de pareja. Todo desde <strong>$1,800 por pareja</strong>.",
    "El itinerario son 4 días perfectos: llegada, ballenas, cascada y Playa Rincón — la playa más hermosa del Caribe. ❤️",
    "¿Tienes fecha en mente? Enero a marzo es la temporada de ballenas, pero Samaná es espectacular todo el año."
  ],
  [
    "Jarabacoa es el corazón verde de RD. 🏔️ El mejor rafting del Caribe, cañoning, y el Pico Duarte — la montaña más alta del Caribe a 3,098 metros.",
    "Incluimos eco-lodge, rafting en el Río Yaque del Norte, cañoning, guía experto y todo el equipo necesario. Desde <strong>$999 por persona</strong>.",
    "Son 4 días de adrenalina pura: rafting clase III y IV, descenso de cascadas y la opción de subir el Pico Duarte si quieres el reto máximo. ⚡",
    "¿Buscas adrenalina extrema o algo más tranquilo en la montaña? Puedo ajustar el plan según tu nivel."
  ],
  [
    "La Zona Colonial de Santo Domingo es el primer asentamiento europeo en América. 🏛️ Patrimonio Mundial de la UNESCO con 500 años de historia viva.",
    "Incluimos hotel boutique colonial, tour guiado privado, Alcázar de Colón, Fortaleza Ozama, cena gourmet y tour gastronómico. Desde <strong>$799 por persona</strong>.",
    "Son 3 días intensos de cultura: historia colonial por el día, gastronomía dominicana de alto nivel por la noche. Un destino que sorprende a todos. 🍽️",
    "¿Viajas solo, en pareja o en grupo? Puedo personalizar el recorrido según tus intereses culturales o gastronómicos."
  ],
  [
    "Las Terrenas es el paraíso familiar del norte dominicano. 👨‍👩‍👧‍👦 Cuatro playas vírgenes, ambiente bohemio y aguas cristalinas perfectas para todas las edades.",
    "Incluimos villa familiar privada, catamarán, snorkel en arrecifes, visita a Cayo Levantado, clases de surf para los niños y quad al atardecer. Desde <strong>$1,299 por familia</strong>.",
    "Son 4 días en familia: playa, aventura acuática, la isla privada de Cayo Levantado y una cena en la orilla del mar para cerrar con broche de oro. 🏖️",
    "¿Cuántas personas viajan y qué edades tienen los niños? Así ajusto las actividades perfectamente para tu familia."
  ],
  [
    "La experiencia VIP es nuestra joya. 💎 Yate privado, chef de alta cocina a bordo, concierge personal 24/7 y acceso a los rincones más exclusivos de la isla.",
    "Incluimos yate privado por 3 días, suite presidential en hotel de lujo, masajista a bordo, helicóptero disponible y experiencias completamente a medida. Desde <strong>$2,500 por persona</strong>.",
    "Son 5 días sin límites: llegada VIP en limusina, navegación por costas privadas, buceo en puntos secretos y una cena en acantilado con sommelier personal. ⛵",
    "Este paquete lo diseñamos 100% a tu medida. ¿Qué fechas tienes? Te preparo una propuesta exclusiva en menos de 24 horas."
  ]
];

let destChatIdx=null;
let destMsgStep=0;

async function openDestChat(idx){
  destChatIdx=idx;destMsgStep=0;
  fabGreeted=true;
  fabOpen=false;
  openFab();
  document.getElementById('fabMsgs').innerHTML='';
  document.getElementById('fabChips').style.display='none';
  document.getElementById('fabBtn').scrollIntoView({behavior:'smooth',block:'end'});
  await new Promise(r=>setTimeout(r,500));
  await sendDestMessages(idx);
}

async function sendDestMessages(idx){
  const msgs=DEST_MSGS[idx];
  for(let i=0;i<msgs.length;i++){
    showTyping('fabMsgs');
    await new Promise(r=>setTimeout(r,900+Math.random()*400));
    hideTyping('fabMsgs');
    const c=document.getElementById('fabMsgs');
    const d=document.createElement('div');
    d.className='sp-msg sp-bot';
    const time=new Date().toLocaleTimeString('es',{hour:'2-digit',minute:'2-digit'});
    d.innerHTML=`<div class="sp-msg-av"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.134"/><path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/></svg></div><div><div class="sp-msg-b">${msgs[i]}</div><span class="sp-msg-t">${time}</span></div>`;
    c.appendChild(d);c.scrollTop=c.scrollHeight;
    const plain=msgs[i].replace(/<[^>]+>/g,'');
    speak(plain);
    if(i<msgs.length-1)await new Promise(r=>setTimeout(r,1800));
  }
  document.getElementById('fabChips').style.display='flex';
}

/* ════════════════════════════
   AI DETAIL MODAL — Claude API powered "Ver Detalles"
════════════════════════════ */
const DEST_NAMES=[
  {name:'Punta Cana',emoji:'🏖️',price:'$1,499',color:'linear-gradient(135deg,#0f6b7c,#1f7a8c)'},
  {name:'Samaná',emoji:'🐳',price:'$1,800',color:'linear-gradient(135deg,#c9a87c,#a87c4f)'},
  {name:'Jarabacoa',emoji:'🏔️',price:'$999',color:'linear-gradient(135deg,#2d6a4f,#40916c)'},
  {name:'Zona Colonial',emoji:'🏛️',price:'$799',color:'linear-gradient(135deg,#8b5e3c,#a0724e)'},
  {name:'Las Terrenas',emoji:'🌊',price:'$1,299',color:'linear-gradient(135deg,#1a6291,#1f7a8c)'},
  {name:'VIP',emoji:'💎',price:'$2,500',color:'linear-gradient(135deg,#07151e,#0a3d62)'},
];

function openDetailModal(idx){
  const dest=DEST_NAMES[idx];
  const modal=document.getElementById('sp-detail-modal');
  const modalTitle=document.getElementById('sp-modal-title');
  const modalEmoji=document.getElementById('sp-modal-emoji');
  const modalContent=document.getElementById('sp-modal-content');
  const modalHeader=document.getElementById('sp-modal-header');

  if(!modal)return;
  modalTitle.textContent=dest.name;
  modalEmoji.textContent=dest.emoji;
  modalHeader.style.background=dest.color;
  modalContent.innerHTML=`
    <div class="sp-modal-loading">
      <div class="sp-modal-dots"><span></span><span></span><span></span></div>
      <p>Sofía está preparando los detalles de <strong>${dest.name}</strong>…</p>
    </div>`;
  modal.classList.add('sp-modal-open');
  document.body.style.overflow='hidden';
  loadDestinationDetails(idx,dest,modalContent);
}

function closeDetailModal(){
  const modal=document.getElementById('sp-detail-modal');
  if(modal){modal.classList.remove('sp-modal-open');document.body.style.overflow='';}
}

async function loadDestinationDetails(idx,dest,container){
  // Sofía greeting spoken immediately when modal opens
  const sofiaBubbleId='sofia-modal-bubble-'+idx;
  const sofiaIntro=DEST_MSGS[idx]?DEST_MSGS[idx][0]:'¡Hola! Te cuento todo sobre este paquete.';
  speak(sofiaIntro);

  try{
    const prompt=`Eres Sofía, asesora de viajes de Summer's Paradise, empresa dominicana de turismo de lujo con 8 años de experiencia. 
Genera un detalle completo y atractivo sobre el destino "${dest.name}" en República Dominicana en formato HTML estructurado.
Responde ÚNICAMENTE con HTML válido, sin comentarios ni markdown. El HTML debe incluir:
- Un párrafo introductorio poético y evocador (máximo 3 oraciones)
- Una sección "¿Qué incluye el paquete?" con 5-6 ítems en lista <ul class="sp-detail-list">
- Una sección "Mejor época para ir" con texto breve
- Una sección "Actividades destacadas" con 4 ítems en lista
- Un dato curioso o secreto del destino al final
Usa los precios reales: ${dest.price}. Tono: cálido, experto, inspirador. Todo en español. Solo HTML, sin etiquetas html/body/head.`;

    const response=await fetch('https://api.anthropic.com/v1/messages',{
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body:JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:1000,
        messages:[{role:'user',content:prompt}]
      })
    });
    const data=await response.json();
    const html=data.content?.find(b=>b.type==='text')?.text||'';
    const clean=html.replace(/```html?|```/g,'').trim();

    // Build spoken summary from dest messages (plain text, no HTML)
    const spokenSummary=(DEST_MSGS[idx]||[]).slice(0,3).map(m=>m.replace(/<[^>]+>/g,'')).join(' ');

    container.innerHTML=`
    <div class="sp-modal-sofia-bubble">
      <div class="sp-modal-sofia-av"><svg xmlns="http://www.w3.org/2000/svg" width="1em" height="1em" fill="currentColor" viewBox="0 0 16 16"><path d="M6 12.5a.5.5 0 0 1 .5-.5h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1-.5-.5M3 8.062C3 6.76 4.235 5.765 5.53 5.886a26.6 26.6 0 0 0 4.94 0C11.765 5.765 13 6.76 13 8.062v1.157a.93.93 0 0 1-.765.935c-.845.147-2.34.346-4.235.346s-3.39-.2-4.235-.346A.93.93 0 0 1 3 9.219zm4.542-.827a.25.25 0 0 0-.217.068l-.92.9a25 25 0 0 1-1.871-.183.25.25 0 0 0-.068.495c.55.076 1.232.149 2.02.193a.25.25 0 0 0 .189-.071l.754-.736.847 1.71a.25.25 0 0 0 .404.062l.932-.97a25 25 0 0 0 1.922-.188.25.25 0 0 0-.068-.495c-.538.074-1.207.145-1.98.189a.25.25 0 0 0-.166.076l-.754.785-.842-1.7a.25.25 0 0 0-.182-.134"/><path d="M8.5 1.866a1 1 0 1 0-1 0V3h-2A4.5 4.5 0 0 0 1 7.5V8a1 1 0 0 0-1 1v2a1 1 0 0 0 1 1v1a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-1a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1v-.5A4.5 4.5 0 0 0 10.5 3h-2zM14 7.5V13a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V7.5A3.5 3.5 0 0 1 5.5 4h5A3.5 3.5 0 0 1 14 7.5"/></svg></div>
      <div class="sp-modal-sofia-text">${sofiaIntro}</div>
    </div>
    <div class="sp-detail-body">${clean}</div>
    <div class="sp-detail-cta">
      <button class="sp-btn-main" onclick="(()=>{speak(${JSON.stringify(spokenSummary)});openDestChat(${idx});closeDetailModal();})()">Continuar con Sofía →</button>
    </div>`;

    // Sofía speaks the full package description after content loads
    setTimeout(()=>speak(spokenSummary),200);
  }catch(err){
    closeDetailModal();
    openDestChat(idx);
  }
}

// Close modal on backdrop click
document.addEventListener('DOMContentLoaded',()=>{
  const modal=document.getElementById('sp-detail-modal');
  if(modal){
    modal.addEventListener('click',e=>{if(e.target===modal)closeDetailModal();});
  }
  // Init match bar
  updateMatchBar('');
});