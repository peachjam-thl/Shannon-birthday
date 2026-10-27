'use strict';
window.BirthdayMiniGames=(()=>{
  const $=s=>document.querySelector(s);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let options,normalControls,frame=0,last=0,elapsed=0,spawnClock=0,score=0,player=.5,playerY=.84,items=[],serial=0;
  let giftState='ready',giftComplete=false,wishState='ready',wishComplete=false,blowFrame=0,blowStart=0;
  const heldDirections=new Map(),tapPulses=new Map(),pointerClicks=new WeakSet();
  let velocityX=0,velocityY=0,draggingPointer=null;
  let arenaGeometry={width:600,height:250,frogWidth:40,frogHeight:48};
  const directions={ArrowLeft:'left',ArrowRight:'right',ArrowUp:'up',ArrowDown:'down'};
  const geometry=()=>arenaGeometry;
  function constrainPlayer(x,y){const g=geometry(),mx=Math.min(.45,(g.frogWidth/2+3)/g.width),my=Math.min(.45,(g.frogHeight/2+3)/g.height);player=clamp(x,mx,1-mx);playerY=clamp(y,my,1-my);}
  function renderPlayer(){const g=geometry();$('#gift-player').style.transform=`translate3d(${(player*g.width).toFixed(3)}px,${(playerY*g.height).toFixed(3)}px,0) translate(-50%,-50%)`;}
  function setPlayer(x,y=playerY){constrainPlayer(x,y);renderPlayer();}
  function measureGeometry(){const arena=$('#gift-arena'),frog=$('#gift-player');if(!arena.clientWidth||!arena.clientHeight)return;arenaGeometry={width:arena.clientWidth,height:arena.clientHeight,frogWidth:frog.offsetWidth||40,frogHeight:frog.offsetHeight||48};setPlayer(player,playerY);}
  function stopMovement(){heldDirections.clear();tapPulses.clear();velocityX=0;velocityY=0;draggingPointer=null;}
  function pulse(direction){const opposite={left:'right',right:'left',up:'down',down:'up'}[direction];if(!opposite)return;tapPulses.delete(opposite);tapPulses.set(direction,.15);}
  function pressDirection(direction,source){heldDirections.set(source,direction);pulse(direction);}
  function updateMovement(dt){
    if(draggingPointer!==null)return;
    const g=geometry(),held=new Set(heldDirections.values()),speed=Math.max(g.height*.7,g.width*.45);
    // Integrate small steps, then render once. Collision uses these same positions.
    for(let remaining=dt;remaining>1e-7;){
      const step=Math.min(remaining,1/120),active=d=>held.has(d)||(tapPulses.get(d)||0)>0;
      const dx=Number(active('right'))-Number(active('left')),dy=Number(active('down'))-Number(active('up')),length=Math.hypot(dx,dy)||1;
      const blend=1-Math.exp(-22*step);
      velocityX+=(dx/length*speed-velocityX)*blend;velocityY+=(dy/length*speed-velocityY)*blend;
      if(Math.abs(velocityX)<.5)velocityX=0;if(Math.abs(velocityY)<.5)velocityY=0;
      const x=player+velocityX/g.width*step,y=playerY+velocityY/g.height*step;constrainPlayer(x,y);
      if(Math.abs(player-x)>1e-9)velocityX=0;if(Math.abs(playerY-y)>1e-9)velocityY=0;
      for(const [direction,time] of tapPulses){if(time<=step)tapPulses.delete(direction);else tapPulses.set(direction,time-step);}
      remaining-=step;
    }
    renderPlayer();
  }
  function clearDrops(){for(const item of items)item.node.remove();items=[];}
  function giftUI(){
    $('#gift-score').textContent=String(score);
    $('#gift-seconds').textContent=String(Math.max(0,Math.ceil(20-elapsed)));
    $('#gift-time').value=Math.max(0,20-elapsed);
    $('#gift-arena').dataset.state=giftState;
    $('#gift-ready').hidden=giftState!=='ready';$('#gift-result').hidden=giftState!=='done';$('#gift-paused').hidden=giftState!=='paused';
    $('#gift-pause').hidden=!['running','paused'].includes(giftState);
    $('#gift-pause').textContent=giftState==='paused'?'继续接礼物 ▶':'暂停 Ⅱ';
    $('#gift-to-letter').disabled=!giftComplete;
    $('#gift-controls').hidden=giftState==='done';
    updateDirections();
  }
  function updateDirections(){const playing=options.isPage('gifts-page')&&['running','paused'].includes(giftState);for(const [direction,label] of [['left','向左'],['right','向右'],['up','向上'],['down','向下']])$(`[data-direction="${direction}"]`).setAttribute('aria-label',playing?`${label}，移动奶蛙`:`${label}，${direction==='left'||direction==='up'?'上一页':'下一页'}`);$('.desk-footer p').innerHTML=playing?'<kbd>← ↑ ↓ →</kbd> 移动 <kbd>A</kbd> 暂停/继续 <kbd>B</kbd> 暂停/返回':normalControls;}
  function spawn(){
    const kinds=['gift-present','pixel-star','gift-cake'],kind=kinds[serial%3];
    const node=document.createElement('span');node.className='gift-drop';node.setAttribute('aria-hidden','true');
    node.style.color=['#e59b91','#ffe292','#a9c799','#b4aad9'][serial%4];
    const svg=document.createElementNS('http://www.w3.org/2000/svg','svg'),use=document.createElementNS('http://www.w3.org/2000/svg','use');
    svg.setAttribute('viewBox','0 0 24 24');use.setAttribute('href','#'+kind);svg.append(use);node.append(svg);$('#gift-drops').append(node);
    const x=serial===0?.5:.08+Math.random()*.84;
    items.push({node,x,y:-.12,speed:.24+Math.random()*.055});serial++;
  }
  function tick(now){
    if(giftState!=='running')return;
    const realDt=Math.max(0,(now-last)/1000),dt=Math.min(realDt,.15);last=now;elapsed+=realDt;spawnClock+=dt;
    const g=geometry();updateMovement(dt);
    if(spawnClock>.68){spawnClock=0;spawn();}
    for(let i=items.length-1;i>=0;i--){const item=items[i];item.y+=item.speed*dt;
      item.node.style.left=(item.x*100)+'%';item.node.style.top=(item.y*100)+'%';
      if(Math.abs(item.x-player)<(g.frogWidth*.5+11)/g.width&&Math.abs(item.y-playerY)<(g.frogHeight*.5+11)/g.height){
        score++;$('#gift-score').textContent=String(score);$('#gift-player').classList.add('caught');item.node.remove();items.splice(i,1);
      }else if(item.y>1.1){item.node.remove();items.splice(i,1);}
    }
    $('#gift-seconds').textContent=String(Math.max(0,Math.ceil(20-elapsed)));$('#gift-time').value=Math.max(0,20-elapsed);
    if(elapsed>=20){finishGift();return;}frame=requestAnimationFrame(tick);
  }
  function startGift(){
    if(giftState==='running')return;
    measureGeometry();stopMovement();
    if(giftState==='ready'){elapsed=0;score=0;serial=0;spawnClock=.6;setPlayer(.5,.84);clearDrops();}
    giftState='running';giftUI();last=performance.now();frame=requestAnimationFrame(tick);$('#gift-arena').focus({preventScroll:true});
  }
  function pauseGift(){if(giftState!=='running')return;cancelAnimationFrame(frame);giftState='paused';stopMovement();giftUI();}
  function finishGift(){
    cancelAnimationFrame(frame);giftState='done';giftComplete=true;stopMovement();clearDrops();
    $('#gift-result-count').textContent=score>0?`接住了 ${score} 份小幸运，装进新一岁的背包。`:'好运已经装进背包，陪你走向新的一岁。';
    giftUI();$('#gift-to-letter').focus({preventScroll:true});
  }
  function move(direction){if(options.isPage('gifts-page')&&giftState==='running')pulse(direction);}
  function renderWish(){
    $('#cake-scene').classList.toggle('candles-out',wishState==='done');
    $('#blow-button').disabled=wishState==='blowing';$('#blow-button').hidden=wishState==='done';
    $('#wish-after').hidden=wishState!=='done';$('#wish-input').disabled=wishState!=='ready';
    $('#to-finale').disabled=!wishComplete;
    $('#wish-status').textContent=wishState==='done'?'愿望已经出发，星星会记得这一刻。':wishState==='blowing'?'呼—— 把愿望轻轻送给星星……':'写下一个愿望，或把它悄悄放在心里。';
  }
  function cancelBlow(){cancelAnimationFrame(blowFrame);if(wishState!=='blowing')return;wishState='ready';$('#blow-progress').value=0;document.querySelectorAll('.cake-candle').forEach(e=>e.classList.remove('out'));renderWish();}
  function blow(){
    if(wishState!=='ready')return;
    wishState='blowing';renderWish();blowStart=performance.now();
    const tickBlow=now=>{const p=Math.min(1,(now-blowStart)/1800);$('#blow-progress').value=p;
      document.querySelectorAll('.cake-candle').forEach((e,i)=>e.classList.toggle('out',p>(i+1)/6));
      if(p<1){blowFrame=requestAnimationFrame(tickBlow);return;}
      wishState='done';wishComplete=true;const wish=$('#wish-input').value.trim();$('#wish-echo').textContent=wish?`「${wish}」`:'';$('#wish-echo').hidden=!wish;renderWish();$('#to-finale').focus({preventScroll:true});
    };blowFrame=requestAnimationFrame(tickBlow);
  }
  function reset(){
    cancelAnimationFrame(frame);cancelAnimationFrame(blowFrame);stopMovement();clearDrops();giftState='ready';giftComplete=false;elapsed=0;score=0;serial=0;$('#gift-result-count').textContent='';setPlayer(.5,.84);giftUI();
    wishState='ready';wishComplete=false;$('#wish-input').value='';$('#wish-echo').textContent='';$('#wish-echo').hidden=true;$('#blow-progress').value=0;document.querySelectorAll('.cake-candle').forEach(e=>e.classList.remove('out'));renderWish();
  }
  function init(config){
    options=config;normalControls=$('.desk-footer p').innerHTML;$('#gift-start').addEventListener('click',startGift);$('#gift-resume').addEventListener('click',startGift);$('#gift-pause').addEventListener('click',()=>giftState==='paused'?startGift():pauseGift());$('#blow-button').addEventListener('click',blow);
    const arena=$('#gift-arena');
    const point=e=>{const r=arena.getBoundingClientRect();setPlayer((e.clientX-r.left)/r.width,(e.clientY-r.top)/r.height);};
    arena.addEventListener('pointerdown',e=>{if(giftState!=='running'||e.target.closest('button'))return;stopMovement();draggingPointer=e.pointerId;arena.setPointerCapture(e.pointerId);point(e);});
    arena.addEventListener('pointermove',e=>{if(giftState==='running'&&draggingPointer===e.pointerId&&arena.hasPointerCapture(e.pointerId))point(e);});
    for(const type of ['pointerup','pointercancel','lostpointercapture'])arena.addEventListener(type,e=>{if(draggingPointer===e.pointerId)draggingPointer=null;});
    for(const button of document.querySelectorAll('[data-gift-move], [data-direction]')){
      const direction=button.dataset.giftMove||button.dataset.direction;
      button.addEventListener('pointerdown',e=>{if(!options.isPage('gifts-page')||giftState!=='running')return;e.preventDefault();pressDirection(direction,'pointer:'+e.pointerId);pointerClicks.add(button);button.setPointerCapture(e.pointerId);});
      for(const type of ['pointerup','lostpointercapture'])button.addEventListener(type,e=>heldDirections.delete('pointer:'+e.pointerId));
      button.addEventListener('pointercancel',e=>{heldDirections.delete('pointer:'+e.pointerId);tapPulses.delete(direction);pointerClicks.delete(button);});
      if(button.dataset.giftMove)button.addEventListener('click',()=>{if(!pointerClicks.delete(button))move(direction);});
    }
    $('#gift-player').addEventListener('animationend',e=>{if(e.animationName==='frog-catch')$('#gift-player').classList.remove('caught');});
    window.addEventListener('keyup',e=>{if(directions[e.key])heldDirections.delete('key:'+e.key);});
    window.addEventListener('blur',()=>{stopMovement();pauseGift();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseGift();cancelBlow();}});
    if(typeof ResizeObserver==='function'){const observer=new ResizeObserver(measureGeometry);observer.observe(arena);observer.observe($('#gift-player'));}
    else window.addEventListener('resize',measureGeometry);
    reset();measureGeometry();
  }
  function handleKey(event){
    if(options.isPage('gifts-page')){
      if(['running','paused'].includes(giftState)&&directions[event.key]){event.preventDefault();if(giftState==='running'){if(!event.repeat)pressDirection(directions[event.key],'key:'+event.key);else heldDirections.set('key:'+event.key,directions[event.key]);}return true;}
      if(giftState==='done'&&directions[event.key]&&event.repeat)return true;
      if(event.key==='Escape'&&giftState==='running'){event.preventDefault();pauseGift();return true;}
      if((event.key.toLowerCase()==='a'||event.code==='Space')&&!event.target.closest('button')){event.preventDefault();if(!event.repeat){if(giftState==='running')pauseGift();else if(giftState!=='done')startGift();else return false;}return true;}
    }
    if(options.isPage('wish-page')&&wishState!=='done'&&event.key.toLowerCase()==='a'&&!event.repeat){event.preventDefault();blow();return true;}
    return false;
  }
  return {init,reset,handleKey,get giftComplete(){return giftComplete;},get wishComplete(){return wishComplete;},
    enter(id){if(id==='gifts-page'){measureGeometry();giftUI();}if(id==='wish-page')renderWish();updateDirections();},
    leave(id){if(id==='gifts-page')pauseGift();if(id==='wish-page')cancelBlow();},
    direction(direction,event){if(event&&pointerClicks.delete(event.currentTarget))return true;if(options.isPage('gifts-page')&&['running','paused'].includes(giftState)){move(direction);return true;}return false;},
    confirm(){if(options.isPage('gifts-page')&&giftState!=='done'){if(giftState==='running')pauseGift();else startGift();return true;}if(options.isPage('wish-page')&&wishState!=='done'){blow();return true;}return false;},
    back(){if(options.isPage('gifts-page')&&giftState==='running'){pauseGift();return true;}if(options.isPage('wish-page')&&wishState==='blowing'){cancelBlow();return true;}return false;}
  };
})();
