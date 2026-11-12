const video=document.getElementById('video'), answerEl=document.getElementById('answer'),statusEl=document.getElementById('status');
const start=document.getElementById('start'),stop=document.getElementById('stop');
let stream=null,timer=null,busy=false,epoch=0,lastSignature=null,lastSent=0,lastAnswer='—';
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
function sample(){const c=document.createElement('canvas');c.width=320;c.height=Math.max(1,Math.round(320*video.videoHeight/video.videoWidth));c.getContext('2d').drawImage(video,0,0,c.width,c.height);return c;}
function signature(canvas){const t=document.createElement('canvas');t.width=16;t.height=16;const ctx=t.getContext('2d');ctx.drawImage(canvas,0,0,16,16);const p=ctx.getImageData(0,0,16,16).data;const out=[];for(let i=0;i<p.length;i+=4)out.push(Math.round((p[i]*.3+p[i+1]*.59+p[i+2]*.11)/16));return out;}
function distance(a,b){if(!a||!b)return 999;let n=0;for(let i=0;i<a.length;i++)n+=Math.abs(a[i]-b[i]);return n/a.length;}
async function scan(){if(!stream||busy||video.readyState<2)return;const currentEpoch=epoch;let canvas;try{canvas=sample();}catch{return;}
 const sig=signature(canvas),delta=distance(sig,lastSignature);lastSignature=sig;
 if(delta>2.5){statusEl.textContent='Đang chờ camera ổn định…';return;}
 if(Date.now()-lastSent<4500)return;
 busy=true;lastSent=Date.now();statusEl.textContent='AI đang đọc câu hỏi…';
 try{const image=canvas.toDataURL('image/jpeg',.67);const ctrl=new AbortController();const timeout=setTimeout(()=>ctrl.abort(),18000);
 let response;try{response=await fetch('/api/solve',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({image}),signal:ctrl.signal});}finally{clearTimeout(timeout);}
 const result=await response.json();if(currentEpoch!==epoch)return;if(!response.ok)throw new Error(result.error||'Lỗi máy chủ');
 lastAnswer=result.answer;answerEl.textContent=lastAnswer;statusEl.textContent=lastAnswer==='?'?'Chưa đọc đủ câu hỏi hoặc chưa chắc chắn.':'Đã nhận diện. Tiếp tục hướng camera vào câu hỏi khác.';
 }catch(e){if(currentEpoch===epoch)statusEl.textContent='Lỗi: '+e.message;}finally{busy=false;}}
start.onclick=async()=>{try{stream=await navigator.mediaDevices.getUserMedia({audio:false,video:{facingMode:{ideal:'environment'},width:{ideal:1280},height:{ideal:720}}});video.srcObject=stream;await video.play();epoch++;lastSignature=null;lastSent=0;start.disabled=true;stop.disabled=false;statusEl.textContent='Đang quét…';timer=setInterval(scan,1000);}catch(e){statusEl.textContent='Không mở được camera: '+e.message+' (cần HTTPS và quyền camera).';}};
stop.onclick=()=>{epoch++;clearInterval(timer);timer=null;stream?.getTracks().forEach(t=>t.stop());stream=null;video.srcObject=null;start.disabled=false;stop.disabled=true;statusEl.textContent='Đã tạm dừng.';};
document.addEventListener('visibilitychange',()=>{if(document.hidden&&stream)stop.click();});
