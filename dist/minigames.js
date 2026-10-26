'use strict';
window.BirthdayMiniGames=(()=>{
  const $=s=>document.querySelector(s);
  const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
  let options,normalControls,frame=0,last=0,elapsed=0,spawnClock=0,score=0,player=.5,items=[],serial=0;
  let giftState='ready',giftComplete=false,wishState='ready',wishComplete=false,blowFrame=0,blowStart=0;
  const keys=new Set();
  function setPlayer(x){player=clamp(x,.07,.93);$('#gift-player').style.left=(player*100)+'%';}
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
  function updateDirections(){const playing=options.isPage('gifts-page')&&['running','paused'].includes(giftState);for(const [direction,label] of [['left','向左'],['right','向右']])$(`[data-direction="${direction}"]`).setAttribute('aria-label',playing?`${label}，移动奶蛙`:`${label}，${direction==='left'?'上一页':'下一页'}`);$('.desk-footer p').innerHTML=playing?'<kbd>← →</kbd> 移动 <kbd>A</kbd> 暂停/继续 <kbd>B</kbd> 暂停/返回':normalControls;}
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
    const dt=Math.min((now-last)/1000,.05);last=now;elapsed+=dt;spawnClock+=dt;
    if(keys.has('left'))setPlayer(player-dt*.65);if(keys.has('right'))setPlayer(player+dt*.65);
    if(spawnClock>.68){spawnClock=0;spawn();}
    for(let i=items.length-1;i>=0;i--){const item=items[i];item.y+=item.speed*dt;
      item.node.style.left=(item.x*100)+'%';item.node.style.top=(item.y*100)+'%';
      if(item.y>=.77&&item.y<=.94&&Math.abs(item.x-player)<.1){
        score++;$('#gift-score').textContent=String(score);$('#gift-player').classList.remove('caught');void $('#gift-player').offsetWidth;$('#gift-player').classList.add('caught');item.node.remove();items.splice(i,1);
      }else if(item.y>1.1){item.node.remove();items.splice(i,1);}
    }
    $('#gift-seconds').textContent=String(Math.max(0,Math.ceil(20-elapsed)));$('#gift-time').value=Math.max(0,20-elapsed);
    if(elapsed>=20){finishGift();return;}frame=requestAnimationFrame(tick);
  }
  function startGift(){
    if(giftState==='running')return;
    if(giftState==='ready'){elapsed=0;score=0;serial=0;spawnClock=.6;setPlayer(.5);clearDrops();}
    giftState='running';keys.clear();giftUI();last=performance.now();frame=requestAnimationFrame(tick);$('#gift-arena').focus({preventScroll:true});
  }
  function pauseGift(){if(giftState!=='running')return;cancelAnimationFrame(frame);giftState='paused';keys.clear();giftUI();}
  function finishGift(){
    cancelAnimationFrame(frame);giftState='done';giftComplete=true;keys.clear();clearDrops();
    $('#gift-result-count').textContent=score>0?`接住了 ${score} 份小幸运，装进新一岁的背包。`:'好运已经装进背包，陪你走向新的一岁。';
    giftUI();$('#gift-to-letter').focus({preventScroll:true});
  }
  function move(direction){if(options.isPage('gifts-page')&&giftState==='running')setPlayer(player+(direction==='left'?-.13:.13));}
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
    cancelAnimationFrame(frame);cancelAnimationFrame(blowFrame);keys.clear();clearDrops();giftState='ready';giftComplete=false;elapsed=0;score=0;serial=0;$('#gift-result-count').textContent='';setPlayer(.5);giftUI();
    wishState='ready';wishComplete=false;$('#wish-input').value='';$('#wish-echo').textContent='';$('#wish-echo').hidden=true;$('#blow-progress').value=0;document.querySelectorAll('.cake-candle').forEach(e=>e.classList.remove('out'));renderWish();
  }
  function init(config){
    options=config;normalControls=$('.desk-footer p').innerHTML;$('#gift-start').addEventListener('click',startGift);$('#gift-resume').addEventListener('click',startGift);$('#gift-pause').addEventListener('click',()=>giftState==='paused'?startGift():pauseGift());$('#blow-button').addEventListener('click',blow);
    const arena=$('#gift-arena');
    const point=e=>{const r=arena.getBoundingClientRect();setPlayer((e.clientX-r.left)/r.width);};
    arena.addEventListener('pointerdown',e=>{if(giftState!=='running'||e.target.closest('button'))return;arena.setPointerCapture(e.pointerId);point(e);});
    arena.addEventListener('pointermove',e=>{if(giftState==='running'&&arena.hasPointerCapture(e.pointerId))point(e);});
    for(const button of document.querySelectorAll('[data-gift-move], [data-direction="left"], [data-direction="right"]')){
      const direction=button.dataset.giftMove||button.dataset.direction;
      button.addEventListener('pointerdown',e=>{if(!options.isPage('gifts-page')||giftState!=='running')return;keys.add(direction);button.setPointerCapture(e.pointerId);});
      for(const type of ['pointerup','pointercancel','lostpointercapture'])button.addEventListener(type,()=>keys.delete(direction));
      if(button.dataset.giftMove)button.addEventListener('click',()=>move(direction));
    }
    window.addEventListener('keyup',e=>{if(e.key==='ArrowLeft')keys.delete('left');if(e.key==='ArrowRight')keys.delete('right');});
    window.addEventListener('blur',()=>{keys.clear();pauseGift();});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){pauseGift();cancelBlow();}});
    reset();
  }
  function handleKey(event){
    if(options.isPage('gifts-page')){
      if(['running','paused'].includes(giftState)&&['ArrowLeft','ArrowRight'].includes(event.key)){event.preventDefault();if(giftState==='running')keys.add(event.key==='ArrowLeft'?'left':'right');return true;}
      if(event.key==='Escape'&&giftState==='running'){event.preventDefault();pauseGift();return true;}
      if((event.key.toLowerCase()==='a'||event.code==='Space')&&!event.target.closest('button')){event.preventDefault();if(!event.repeat){if(giftState==='running')pauseGift();else if(giftState!=='done')startGift();else return false;}return true;}
    }
    if(options.isPage('wish-page')&&wishState!=='done'&&event.key.toLowerCase()==='a'&&!event.repeat){event.preventDefault();blow();return true;}
    return false;
  }
  return {init,reset,handleKey,get giftComplete(){return giftComplete;},get wishComplete(){return wishComplete;},
    enter(id){if(id==='gifts-page')giftUI();if(id==='wish-page')renderWish();updateDirections();},
    leave(id){if(id==='gifts-page')pauseGift();if(id==='wish-page')cancelBlow();},
    direction(direction){if(options.isPage('gifts-page')&&['running','paused'].includes(giftState)){if(direction==='left'||direction==='right')move(direction);return true;}return false;},
    confirm(){if(options.isPage('gifts-page')&&giftState!=='done'){if(giftState==='running')pauseGift();else startGift();return true;}if(options.isPage('wish-page')&&wishState!=='done'){blow();return true;}return false;},
    back(){if(options.isPage('gifts-page')&&giftState==='running'){pauseGift();return true;}if(options.isPage('wish-page')&&wishState==='blowing'){cancelBlow();return true;}return false;}
  };
})();
