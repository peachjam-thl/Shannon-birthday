'use strict';
window.BirthdayKeepsake=(()=>{
  const $=selector=>document.querySelector(selector);
  let canOpen=()=>false,prepared=null,pngFile=null,objectURL=null,returnFocus=null,source='';
  function status(message){$('#keepsake-status').textContent=message;}
  function prepare(){
    if(prepared)return prepared;
    $('#keepsake-loading').textContent='正在把生日小掌机装进口袋……';$('#keepsake-loading').hidden=false;$('#keepsake-retry').hidden=true;
    prepared=(async()=>{
      const response=await fetch(source,{credentials:'same-origin'});
      if(!response.ok)throw new Error('Image unavailable');
      const blob=await response.blob();
      if(!blob.type.startsWith('image/png'))throw new Error('Invalid image');
      pngFile=new File([blob],'HAPPY-BIRTHDAY-SHANNON-MA.png',{type:'image/png'});
      objectURL=URL.createObjectURL(pngFile);
      const image=$('#keepsake-image');image.src=objectURL;await image.decode();image.hidden=false;
      $('#keepsake-loading').hidden=true;$('#keepsake-download').href=objectURL;
      let shareable=false;
      try{shareable=Boolean(navigator.share&&navigator.canShare?.({files:[pngFile]}));}catch{/* Keep the download and original-image options. */}
      $('#keepsake-share').hidden=!shareable;
      status('1440 × 2000 · 高清 PNG');
    })().catch(error=>{
      prepared=null;pngFile=null;if(objectURL){URL.revokeObjectURL(objectURL);objectURL=null;}
      $('#keepsake-loading').textContent='贺卡暂未载入，请重试或打开原图。';$('#keepsake-retry').hidden=false;
      status('下载和打开原图仍然可用。');throw error;
    });
    return prepared;
  }
  function open(){
    const dialog=$('#keepsake-dialog');if(!canOpen()||dialog.open)return;
    returnFocus=document.activeElement;dialog.showModal();document.body.classList.add('keepsake-open');$('#keepsake-close').focus({preventScroll:true});
    prepare().catch(()=>{});
  }
  function close(){
    const dialog=$('#keepsake-dialog');if(!dialog?.open)return;
    dialog.close();document.body.classList.remove('keepsake-open');
    if(returnFocus?.isConnected)returnFocus.focus({preventScroll:true});
  }
  async function share(){
    if(!pngFile)return;
    const button=$('#keepsake-share');button.disabled=true;
    try{
      // The PNG is prepared before this click so Safari keeps user activation.
      await navigator.share({files:[pngFile],title:'HAPPY BIRTHDAY! SHANNON MA!'});
      status('请按系统分享菜单的提示完成保存。');
    }catch(error){if(error.name!=='AbortError')status('可改用下载 PNG，或打开原图后长按保存。');}
    finally{button.disabled=false;}
  }
  function init(options){
    canOpen=options.canOpen;source=$('#keepsake-download').href;
    $('#get-keepsake').addEventListener('click',open);$('#keepsake-close').addEventListener('click',close);
    $('#keepsake-share').addEventListener('click',share);$('#keepsake-retry').addEventListener('click',()=>prepare().catch(()=>{}));
    $('#keepsake-download').addEventListener('click',()=>status('请在浏览器下载列表中查看 PNG；手机也可打开原图保存。'));
    $('#keepsake-dialog').addEventListener('cancel',event=>{event.preventDefault();close();});
  }
  return {init,prepare,open,close,get isOpen(){return Boolean($('#keepsake-dialog')?.open);}};
})();
