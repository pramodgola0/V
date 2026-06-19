/* ══ HERO PARTICLE CANVAS (lightweight, pauses off-screen) ══ */
(function(){
  const canvas = document.getElementById('hero-canvas');
  const ctx = canvas.getContext('2d');
  const hero = document.getElementById('hero');
  let W=0, H=0, pts=[], running=false, rafId=null;

  function resize(){
    W = canvas.width  = hero.offsetWidth;
    H = canvas.height = hero.offsetHeight;
    pts.forEach(p=>{
      if(p.x>W) p.x=Math.random()*W;
      if(p.y>H) p.y=Math.random()*H;
    });
  }

  function init(){
    resize();
    pts=[];
    const COUNT=28; // reduced from 50 — fewer pairwise distance checks (O(n^2))
    for(let i=0;i<COUNT;i++){
      pts.push({
        x:Math.random()*W, y:Math.random()*H,
        vx:(Math.random()-.5)*.22, vy:(Math.random()-.5)*.22,
        r:Math.random()*1.4+.4, a:Math.random()*.8+.2
      });
    }
  }

  function draw(){
    if(!running) return;
    ctx.clearRect(0,0,W,H);
    for(let i=0;i<pts.length;i++){
      for(let j=i+1;j<pts.length;j++){
        const dx=pts[i].x-pts[j].x, dy=pts[i].y-pts[j].y;
        const d2=dx*dx+dy*dy; // skip sqrt until needed
        if(d2<14400){ // 120^2
          const d=Math.sqrt(d2);
          ctx.beginPath();
          ctx.moveTo(pts[i].x,pts[i].y);
          ctx.lineTo(pts[j].x,pts[j].y);
          ctx.strokeStyle=`rgba(68,144,255,${.1*(1-d/120)})`;
          ctx.lineWidth=.5;
          ctx.stroke();
        }
      }
    }
    pts.forEach(p=>{
      ctx.beginPath();
      ctx.arc(p.x,p.y,p.r,0,Math.PI*2);
      ctx.fillStyle=`rgba(68,144,255,${p.a*.55})`;
      ctx.fill();
      p.x+=p.vx; p.y+=p.vy;
      if(p.x<-5) p.x=W+5;
      else if(p.x>W+5) p.x=-5;
      if(p.y<-5) p.y=H+5;
      else if(p.y>H+5) p.y=-5;
    });
    rafId=requestAnimationFrame(draw);
  }

  function start(){ if(!running){ running=true; draw(); } }
  function stop(){ running=false; if(rafId) cancelAnimationFrame(rafId); }

  init();

  // Only animate while hero is actually visible on screen
  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=> en.isIntersecting ? start() : stop());
  },{threshold:0});
  io.observe(hero);

  // Pause entirely when tab/window isn't visible
  document.addEventListener('visibilitychange',()=>{
    document.hidden ? stop() : (isHeroVisible() && start());
  });
  function isHeroVisible(){
    const r=hero.getBoundingClientRect();
    return r.bottom>0 && r.top<innerHeight;
  }

  let resizeTimer;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(resize,150);
  },{passive:true});
})();

/* ══ NAVBAR (elements grabbed here, scroll logic consolidated below) ══ */
const nb=document.getElementById('navbar');
const st=document.getElementById('st');

/* ══ HAMBURGER ══ */
const ham=document.getElementById('ham');
const mob=document.getElementById('mob');
ham.addEventListener('click',()=>{ham.classList.toggle('open');mob.classList.toggle('open')});
function cM(){ham.classList.remove('open');mob.classList.remove('open')}
document.addEventListener('click',e=>{if(!mob.contains(e.target)&&!ham.contains(e.target))cM()});

/* ══ REVEAL ON SCROLL ══ */
const rvEls=document.querySelectorAll('.rv');
const rvObs=new IntersectionObserver(entries=>{
  entries.forEach(en=>{if(en.isIntersecting){en.target.classList.add('on');rvObs.unobserve(en.target)}});
},{threshold:0.1,rootMargin:'0px 0px -36px 0px'});
rvEls.forEach(el=>rvObs.observe(el));

/* ══ COUNT-UP ══ */
function countUp(el,target,suffix){
  let s=0;const dur=1600;const step=target/(dur/16);
  const t=setInterval(()=>{
    s+=step;if(s>=target){s=target;clearInterval(t)}
    el.textContent=Math.floor(s).toLocaleString()+suffix;
  },16);
}
const cEls=document.querySelectorAll('[data-count]');
const cObs=new IntersectionObserver(entries=>{
  entries.forEach(en=>{
    if(en.isIntersecting){
      const suffix=en.target.dataset.suffix||'';
      countUp(en.target,+en.target.dataset.count,suffix);
      cObs.unobserve(en.target);
    }
  });
},{threshold:0.4});
cEls.forEach(el=>{el.textContent='0'+(el.dataset.suffix||'');cObs.observe(el)});

/* ══ ACTIVE NAV (elements grabbed here, scroll logic consolidated below) ══ */
const secs=document.querySelectorAll('section[id]');
const nas=document.querySelectorAll('.nav-links a');

/* ══ FORM ══ */
function doSend(btn){
  btn.textContent='✅ Enquiry Sent!';
  btn.style.background='linear-gradient(135deg,#16a34a,#15803d)';
  btn.disabled=true;
  setTimeout(()=>{btn.textContent='Send Enquiry →';btn.style.background='';btn.disabled=false},3500);
}

/* ══ SMOOTH TILT on cards (throttled via rAF, lighter weight) ══ */
(function(){
  const cards = document.querySelectorAll('.pc,.str-card,.tc,.ic');
  const MAX = 6; // slightly reduced for a subtler, cheaper effect
  let ticking = false, pendingCard = null, pendingX = 0, pendingY = 0;

  function applyTilt(){
    if(pendingCard){
      pendingCard.style.transform = `translateY(-5px) rotateX(${-pendingY*MAX}deg) rotateY(${pendingX*MAX}deg)`;
    }
    ticking = false;
  }

  cards.forEach(card => {
    card.addEventListener('mousemove', e => {
      if(!card.classList.contains('on')) return;
      const r = card.getBoundingClientRect();
      pendingX = (e.clientX - r.left) / r.width  - 0.5;
      pendingY = (e.clientY - r.top)  / r.height - 0.5;
      pendingCard = card;
      card.style.transition = 'transform .1s ease';
      if(!ticking){ ticking = true; requestAnimationFrame(applyTilt); }
    }, {passive:true});
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform .4s var(--ease), border-color .25s, box-shadow .25s, background .25s';
      pendingCard = null;
    });
  });
})();

/* ══ MAGNETIC BUTTONS (throttled) ══ */
(function(){
  const btns = document.querySelectorAll('.btn-p,.btn-o');
  let ticking=false, pendingBtn=null, px=0, py=0;
  function apply(){
    if(pendingBtn) pendingBtn.style.transform = `translate(${px}px,${py}px) translateY(-2px)`;
    ticking=false;
  }
  btns.forEach(btn => {
    btn.addEventListener('mousemove', e => {
      const r = btn.getBoundingClientRect();
      px = (e.clientX - r.left - r.width/2) * .18;
      py = (e.clientY - r.top  - r.height/2) * .18;
      pendingBtn = btn;
      btn.style.transition = 'transform .15s ease';
      if(!ticking){ ticking=true; requestAnimationFrame(apply); }
    }, {passive:true});
    btn.addEventListener('mouseleave', () => {
      btn.style.transform = '';
      btn.style.transition = 'transform .4s var(--ease), box-shadow .25s';
      pendingBtn = null;
    });
  });
})();

/* ══ SMOOTH SECTION PROGRESS INDICATOR (bar element created here) ══ */
const progressBar = document.createElement('div');
progressBar.style.cssText = 'position:fixed;top:70px;left:0;height:2px;background:linear-gradient(90deg,var(--blue2),var(--accent));z-index:999;pointer-events:none;width:0%';
document.body.appendChild(progressBar);

/* ══ SMOOTH CURSOR TRAIL (desktop only, rAF-throttled) ══ */
(function(){
  if(window.innerWidth < 768) return;
  if(window.matchMedia && window.matchMedia('(pointer: coarse)').matches) return; // skip on touch
  const dot = document.createElement('div');
  dot.style.cssText = 'position:fixed;width:8px;height:8px;border-radius:50%;background:var(--accent);pointer-events:none;z-index:9999;transform:translate(-50%,-50%);opacity:.7;transition:opacity .3s';
  const ring = document.createElement('div');
  ring.style.cssText = 'position:fixed;width:32px;height:32px;border-radius:50%;border:1.5px solid rgba(68,144,255,.4);pointer-events:none;z-index:9998;transform:translate(-50%,-50%);transition:opacity .3s';
  document.body.appendChild(dot);
  document.body.appendChild(ring);

  let mx=0,my=0,ticking=false;
  function apply(){
    dot.style.left=mx+'px'; dot.style.top=my+'px';
    ring.style.left=mx+'px'; ring.style.top=my+'px';
    ticking=false;
  }
  document.addEventListener('mousemove', e => {
    mx=e.clientX; my=e.clientY;
    if(!ticking){ ticking=true; requestAnimationFrame(apply); }
  }, {passive:true});

  // Scale ring up on hovering interactive elements
  document.querySelectorAll('a,button,.pc,.str-card,.tc,.ic,.why-item,.prs').forEach(el => {
    el.addEventListener('mouseenter',()=>{ ring.style.transform='translate(-50%,-50%) scale(1.8)'; dot.style.opacity='0' },{passive:true});
    el.addEventListener('mouseleave',()=>{ ring.style.transform='translate(-50%,-50%) scale(1)'; dot.style.opacity='.7' },{passive:true});
  });

  document.addEventListener('mouseleave',()=>{ dot.style.opacity='0'; ring.style.opacity='0' });
  document.addEventListener('mouseenter',()=>{ dot.style.opacity='.7'; ring.style.opacity='1' });
})();

/* ══ CONSOLIDATED SCROLL HANDLER (single rAF-throttled listener,
   replaces 4 separate scroll listeners for navbar, active-nav,
   progress bar, and navbar hide/show) ══ */
(function(){
  let lastY = 0, ticking = false;

  function onScroll(){
    const y = window.scrollY;

    // 1. Navbar background + scroll-top button
    nb.classList.toggle('scrolled', y>60);
    st.classList.toggle('on', y>500);

    // 2. Active nav link highlight
    let cur='';
    secs.forEach(s=>{ if(y>=s.offsetTop-110) cur=s.id; });
    nas.forEach(a=>{
      a.classList.toggle('active', a.getAttribute('href')==='#'+cur);
    });

    // 3. Scroll progress bar
    const pct = y / (document.body.scrollHeight - innerHeight) * 100;
    progressBar.style.width = Math.min(pct,100) + '%';

    // 4. Navbar hide on scroll down / show on scroll up
    if(y > 120){
      if(y > lastY + 4){
        nb.style.transform = 'translateY(-100%)';
      } else if(y < lastY - 4){
        nb.style.transform = 'translateY(0)';
      }
    } else {
      nb.style.transform = 'translateY(0)';
    }
    lastY = y;
    ticking = false;
  }

  window.addEventListener('scroll', () => {
    if(!ticking){ ticking = true; requestAnimationFrame(onScroll); }
  }, {passive:true});

  // Set initial nav transform transition once (avoids re-setting it every frame)
  nb.style.transition = 'transform .35s var(--ease), background .3s, box-shadow .3s';
})();


/* ══ V SCENE — SPARK PARTICLE CANVAS (pauses off-screen) ══ */
(function(){
  const canvas = document.getElementById('v-fx-canvas');
  if(!canvas) return;
  const ctx = canvas.getContext('2d');
  const scene = canvas.parentElement;
  let running=false, rafId=null;

  function resize(){
    canvas.width  = scene.offsetWidth;
    canvas.height = scene.offsetHeight;
  }
  resize();

  function scaleP(x,y){
    const sx = canvas.width  / 205;
    const sy = canvas.height / 205;
    return [x*sx, y*sy];
  }
  function lerp(a,b,t){ return a + (b-a)*t }
  function getVPoint(t){
    let x,y;
    if(t<=0.5){
      const tt=t/0.5;
      x=lerp(17,102.5,tt); y=lerp(26,178,tt);
    } else {
      const tt=(t-0.5)/0.5;
      x=lerp(102.5,188,tt); y=lerp(178,26,tt);
    }
    return scaleP(x,y);
  }

  const sparks=[];
  function spawnSpark(){
    if(sparks.length>18) return; // cap concurrent sparks
    const t=Math.random();
    const [x,y]=getVPoint(t);
    sparks.push({
      x,y,
      vx:(Math.random()-.5)*2.2,
      vy:(Math.random()-.5)*2.2 - 0.5,
      life:1,
      decay:Math.random()*.04+.025,
      r:Math.random()*2+.5,
      col:`rgba(${100+Math.random()*155|0},${160+Math.random()*95|0},255,`
    });
  }

  const streams=[];
  function spawnStream(){
    if(streams.length>3) return; // cap concurrent streams
    streams.push({
      t: Math.random()<.5 ? 0 : 1,
      dir: Math.random()<.5 ? 1 : -1,
      speed: Math.random()*.003+.003,
      r: Math.random()*2+1,
      life:1,
      trail:[],
    });
  }
  for(let i=0;i<2;i++) spawnStream(); // reduced from 3

  let frame=0;
  function draw(){
    if(!running) return;
    ctx.clearRect(0,0,canvas.width,canvas.height);
    frame++;

    if(frame%22===0) spawnSpark();
    if(frame%10===0 && Math.random()>.65) spawnSpark();
    if(frame%150===0) spawnStream();

    for(let i=sparks.length-1;i>=0;i--){
      const s=sparks[i];
      ctx.beginPath();
      ctx.arc(s.x,s.y,s.r*s.life,0,Math.PI*2);
      ctx.fillStyle=s.col+(s.life*.85)+')';
      ctx.fill();
      ctx.beginPath();
      ctx.moveTo(s.x,s.y);
      ctx.lineTo(s.x-s.vx*4,s.y-s.vy*4);
      ctx.strokeStyle=s.col+(s.life*.3)+')';
      ctx.lineWidth=s.r*.5;
      ctx.stroke();

      s.x+=s.vx; s.y+=s.vy;
      s.vy+=.04;
      s.life-=s.decay;
      if(s.life<=0) sparks.splice(i,1);
    }

    for(let i=streams.length-1;i>=0;i--){
      const s=streams[i];
      s.t+=s.speed*s.dir;
      const [x,y]=getVPoint(Math.max(0,Math.min(1,s.t)));
      s.trail.push([x,y]);
      if(s.trail.length>10) s.trail.shift(); // reduced from 12

      if(s.trail.length>1){
        for(let j=1;j<s.trail.length;j++){
          const alpha=j/s.trail.length*.8;
          ctx.beginPath();
          ctx.moveTo(s.trail[j-1][0],s.trail[j-1][1]);
          ctx.lineTo(s.trail[j][0],s.trail[j][1]);
          ctx.strokeStyle=`rgba(180,220,255,${alpha})`;
          ctx.lineWidth=s.r*(j/s.trail.length);
          ctx.stroke();
        }
      }
      ctx.beginPath();
      ctx.arc(x,y,s.r+.5,0,Math.PI*2);
      ctx.fillStyle='rgba(200,230,255,.95)';
      ctx.fill();

      if(s.t<=0||s.t>=1) streams.splice(i,1);
    }

    rafId=requestAnimationFrame(draw);
  }

  function start(){ if(!running){ running=true; draw(); } }
  function stop(){ running=false; if(rafId) cancelAnimationFrame(rafId); }

  const io=new IntersectionObserver(entries=>{
    entries.forEach(en=> en.isIntersecting ? start() : stop());
  },{threshold:0});
  io.observe(scene);

  document.addEventListener('visibilitychange',()=>{
    if(document.hidden){
      stop();
    } else {
      const r=scene.getBoundingClientRect();
      if(r.bottom>0 && r.top<innerHeight) start();
    }
  });

  let resizeTimer;
  window.addEventListener('resize',()=>{
    clearTimeout(resizeTimer);
    resizeTimer=setTimeout(resize,150);
  },{passive:true});
})();

