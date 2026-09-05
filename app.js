const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const state = { u: 3, v: 2, component: 'real', size: 32 };

function palette(value) {
  const t = Math.max(0, Math.min(1, (value + 1) / 2));
  const a = [0, 0, 0], b = [255, 255, 255];
  return a.map((x, i) => Math.round(x + (b[i] - x) * t));
}

function drawBasis() {
  const canvas = $('#basisCanvas'), ctx = canvas.getContext('2d');
  const off = document.createElement('canvas'); off.width = state.size; off.height = state.size;
  const o = off.getContext('2d'), image = o.createImageData(state.size, state.size);
  for (let y = 0; y < state.size; y++) for (let x = 0; x < state.size; x++) {
    const theta = 2 * Math.PI * (state.u * x / state.size + state.v * y / state.size);
    const value = state.component === 'real' ? Math.cos(theta) : Math.sin(theta);
    const color = palette(value);
    const i = (y * state.size + x) * 4; image.data.set([...color, 255], i);
  }
  o.putImageData(image, 0, 0); ctx.imageSmoothingEnabled = false; ctx.clearRect(0,0,canvas.width,canvas.height); ctx.drawImage(off,0,0,canvas.width,canvas.height);
}
function hslToRgb(h,s,l){s/=100;l/=100;const c=(1-Math.abs(2*l-1))*s,x=c*(1-Math.abs(h/60%2-1)),m=l-c/2;let r=0,g=0,b=0;if(h<60)[r,g]=[c,x];else if(h<120)[r,g]=[x,c];else if(h<180)[g,b]=[c,x];else if(h<240)[g,b]=[x,c];else if(h<300)[r,b]=[x,c];else[r,b]=[c,x];return [r,g,b].map(n=>Math.round((n+m)*255))}

function wrapFrequency(k){return ((k+16)%32+32)%32-16}
function frequencyAt(position){return Math.max(-16,Math.min(15,Math.floor(position*32)-16))}
function conjugateOf(p){return {u:wrapFrequency(-p.u),v:wrapFrequency(-p.v)}}
function selfConjugate(p){const q=conjugateOf(p);return q.u===p.u&&q.v===p.v}

function canvasTheme(){const light=document.body.classList.contains('light');return light?{bg:'#fafafa',grid:'#dedede',axis:'#999999',text:'#666666',point:'#333333'}:{bg:'#171717',grid:'#363636',axis:'#888888',text:'#bbbbbb',point:'#eeeeee'}}

function drawFrequency() {
  const c=$('#frequencyCanvas'),ctx=c.getContext('2d'),w=c.width,h=c.height,cell=w/32;
  ctx.clearRect(0,0,w,h);ctx.fillStyle=canvasTheme().bg;ctx.fillRect(0,0,w,h);
  ctx.strokeStyle=canvasTheme().grid;ctx.lineWidth=1;
  for(let i=0;i<32;i++){const p=(i+.5)*cell;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,h);ctx.stroke();ctx.beginPath();ctx.moveTo(0,p);ctx.lineTo(w,p);ctx.stroke()}
  const cx=16.5*cell,cy=16.5*cell;ctx.strokeStyle=canvasTheme().axis;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,h);ctx.moveTo(0,cy);ctx.lineTo(w,cy);ctx.stroke();
  drawPoint(-state.u,-state.v,canvasTheme().point,3);drawPoint(state.u,state.v,canvasTheme().point,5);
  ctx.fillStyle=canvasTheme().text;ctx.font='15px Segoe UI';ctx.fillText('v',cx+8,h-10);ctx.fillText('u',w-14,cy-8);ctx.fillText('0',cx+6,cy-7);
  function drawPoint(u,v,color,r){const x=cx+wrapFrequency(u)*cell,y=cy+wrapFrequency(v)*cell;ctx.shadowColor=color;ctx.shadowBlur=4;ctx.fillStyle=color;ctx.beginPath();ctx.arc(x,y,r,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0}
}

function updateUI(){
  $('#uOut').value=state.u;$('#vOut').value=state.v;
  const direction=Math.atan2(state.v,state.u)*180/Math.PI;
  $('#vectorText').textContent=`(u, v) = (${state.u}, ${state.v})`;$('#orientationText').textContent=`Variation direction ${direction.toFixed(1)}° · stripes are perpendicular`;
  const f=state.component==='real'?'cos':'sin';$('#basisLabel').textContent=`${f}[2π(${state.u}x/M ${state.v<0?'−':'+'} ${Math.abs(state.v)}y/N)]`;$('#componentBadge').textContent=state.component.toUpperCase()+' COMPONENT';
  drawBasis();drawFrequency();
}

['u','v'].forEach(k=>$('#'+k+'Range').addEventListener('input',e=>{state[k]=+e.target.value;updateUI()}));
$$('.seg').forEach(b=>b.addEventListener('click',()=>{$$('.seg').forEach(x=>x.classList.remove('active'));b.classList.add('active');state.component=b.dataset.component;updateUI()}));
$('#resetBasis').addEventListener('click',()=>{Object.assign(state,{u:3,v:2,component:'real'});$('#uRange').value=3;$('#vRange').value=2;$$('.seg').forEach((x,i)=>x.classList.toggle('active',i===0));updateUI()});
$('#frequencyCanvas').addEventListener('pointerdown',pickFrequency);$('#frequencyCanvas').addEventListener('pointermove',e=>{if(e.buttons)pickFrequency(e)});
function pickFrequency(e){const c=e.currentTarget,r=c.getBoundingClientRect(),x=(e.clientX-r.left)*c.width/r.width,y=(e.clientY-r.top)*c.height/r.height;state.u=frequencyAt(x/c.width);state.v=frequencyAt(y/c.height);$('#uRange').value=state.u;$('#vRange').value=state.v;updateUI()}
$$('.nav-btn[data-section]').forEach(b=>b.addEventListener('click',()=>{$$('.nav-btn,.lab-section').forEach(x=>x.classList.remove('active'));b.classList.add('active');$('#'+b.dataset.section).classList.add('active');closeLabMenu();window.scrollTo({top:0,behavior:'instant'});$('#labMenuToggle').focus()}));
function closeLabMenu(){ $('#labMenu').hidden=true; $('#labMenuToggle').setAttribute('aria-expanded','false'); }
$('#labMenuToggle').onclick=()=>{const open=$('#labMenu').hidden;$('#labMenu').hidden=!open;$('#labMenuToggle').setAttribute('aria-expanded',String(open));if(open)$('#labMenu .active').focus()};
document.addEventListener('click',e=>{if(!e.target.closest('#labMenu, #labMenuToggle'))closeLabMenu()});
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$('#labMenu').hidden){closeLabMenu();$('#labMenuToggle').focus()}});
$('#themeToggle').addEventListener('click',()=>{const light=document.body.classList.toggle('light');$('#themeToggle').textContent=light?'☾':'☀';$('#themeToggle').setAttribute('aria-label',light?'Switch to dark theme':'Switch to light theme');drawFrequency();drawMixerFreq(mix.pairs.length)});
updateUI();

// Spectrum mixer -------------------------------------------------------------
const mix = { re: 1, im: 0, pairs: [], selected: null, nextColor: 0, timer: null };
const mixSize = 32;
const pairColors = ['#555555','#888888','#666666','#999999','#777777'];
function stopBuild(){clearInterval(mix.timer);mix.timer=null;$('#playBuild').textContent='▶ Build animation'}
function syncCoefficientControls(){
  for(const key of ['re','im']){$('#'+key+'Range').value=mix[key];$('#'+key+'Out').value=mix[key].toFixed(2)}
  $('#ampOut').value=Math.hypot(mix.re,mix.im).toFixed(2);
}
function formatCoefficient(re,im){return `${re.toFixed(2)} ${im<0?'−':'+'} ${Math.abs(im).toFixed(2)}i`}
function selectPair(p){mix.selected=p;mix.re=p.re;mix.im=p.im;syncCoefficientControls()}
function addPair(u,v){
  if(u===0&&v===0)return;
  stopBuild();
  // Store the right-hand representative, or the upper point on the vertical axis.
  const q=conjugateOf({u,v});
  if(q.u>u||(q.u===u&&q.v<v)){u=q.u;v=q.v}
  let p=mix.pairs.find(p=>p.u===u&&p.v===v);
  if(!p){const index=mix.nextColor++;p={u,v,re:mix.re,im:mix.im,color:pairColors[index]||`hsl(0 0% ${35+(index*17)%30}%)`};mix.pairs.push(p)}
  if(selfConjugate(p))p.im=0;selectPair(p);renderMixer();
}
function mixerValues(limit=mix.pairs.length){
  const vals=new Float32Array(mixSize*mixSize);let max=0;
  for(let y=0;y<mixSize;y++)for(let x=0;x<mixSize;x++){
    let sum=0;for(const p of mix.pairs.slice(0,limit)){const theta=2*Math.PI*(p.u*x/mixSize+p.v*y/mixSize);sum+=(selfConjugate(p)?1:2)*(p.re*Math.cos(theta)-p.im*Math.sin(theta))/(mixSize*mixSize)}
    vals[y*mixSize+x]=sum;max=Math.max(max,Math.abs(sum));
  }return {vals,max:max||1};
}
function renderMixer(limit=mix.pairs.length){
  const {vals,max}=mixerValues(limit),c=$('#reconCanvas'),ctx=c.getContext('2d'),off=document.createElement('canvas');off.width=off.height=mixSize;const o=off.getContext('2d'),im=o.createImageData(mixSize,mixSize);
  for(let i=0;i<vals.length;i++)im.data.set([...palette(vals[i]/max),255],i*4);o.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(off,0,0,c.width,c.height);
  drawMixerFreq(limit);$('#mixCount').textContent=`${limit} coefficient pair${limit===1?'':'s'} · ${mix.pairs.slice(0,limit).reduce((n,p)=>n+(selfConjugate(p)?1:2),0)} spectral points`;renderCoefficientList();
  syncCoefficientControls();
  const p=mix.selected;$('#conjugateCoefficient').textContent=p?`F(${conjugateOf(p).u}, ${conjugateOf(p).v}) = ${formatCoefficient(p.re,-p.im)}`:'';$('#selectedCoefficient').textContent=p?`F(${p.u}, ${p.v}) = ${formatCoefficient(p.re,p.im)}`:'Select a pair to inspect F(u,v).';
}
function drawMixerFreq(limit){
  const c=$('#mixerFreqCanvas'),ctx=c.getContext('2d'),cell=c.width/32,cx=16.5*cell,cy=16.5*cell;
  ctx.fillStyle=canvasTheme().bg;ctx.fillRect(0,0,c.width,c.height);ctx.strokeStyle=canvasTheme().grid;ctx.lineWidth=1;
  for(let i=0;i<32;i++){const p=(i+.5)*cell;ctx.beginPath();ctx.moveTo(p,0);ctx.lineTo(p,c.height);ctx.moveTo(0,p);ctx.lineTo(c.width,p);ctx.stroke()}
  ctx.strokeStyle=canvasTheme().axis;ctx.beginPath();ctx.moveTo(cx,0);ctx.lineTo(cx,c.height);ctx.moveTo(0,cy);ctx.lineTo(c.width,cy);ctx.stroke();
  ctx.fillStyle=canvasTheme().text;ctx.font='15px Segoe UI';ctx.fillText('u',c.width-16,cy-8);ctx.fillText('v',cx+8,c.height-10);ctx.fillText('0',cx+6,cy-7);
  mix.pairs.slice(0,limit).forEach(p=>{point(-p.u,-p.v,p,3);point(p.u,p.v,p,5);if(p===mix.selected){ctx.strokeStyle=p.color;ctx.lineWidth=1;ctx.beginPath();ctx.arc(cx+p.u*cell,cy+p.v*cell,5.5,0,Math.PI*2);ctx.stroke()}});
  function point(u,v,p,r){ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(cx+wrapFrequency(u)*cell,cy+wrapFrequency(v)*cell,r,0,Math.PI*2);ctx.fill()}
}
function renderCoefficientList(){
  const el=$('#coefficientList');if(!mix.pairs.length){el.innerHTML='<div class="empty-state">No frequencies yet</div>';return}
  el.innerHTML=mix.pairs.map((p,i)=>`<div class="coefficient-item ${p===mix.selected?'selected':''}" style="--pair-color:${p.color}"><button class="pair-select" data-select="${i}" aria-pressed="${p===mix.selected}"><b>(${p.u}, ${p.v}) &amp; (${conjugateOf(p).u}, ${conjugateOf(p).v})</b><span>F(${p.u}, ${p.v}) = ${formatCoefficient(p.re,p.im)}</span></button><button data-remove="${i}" aria-label="Remove pair (${p.u}, ${p.v})">×</button></div>`).join('');
  el.querySelectorAll('[data-select]').forEach(b=>b.onclick=()=>{stopBuild();selectPair(mix.pairs[+b.dataset.select]);renderMixer()});
  el.querySelectorAll('[data-remove]').forEach(b=>b.onclick=()=>{stopBuild();const [removed]=mix.pairs.splice(+b.dataset.remove,1);if(removed===mix.selected){mix.selected=null;if(mix.pairs.length)selectPair(mix.pairs[mix.pairs.length-1])}renderMixer()});
}
['re','im'].forEach(key=>$('#'+key+'Range').oninput=e=>{stopBuild();mix[key]=+e.target.value;if(mix.selected){mix.selected[key]=mix[key];if(selfConjugate(mix.selected)){mix.selected.im=0;mix.im=0}}renderMixer()});
$('#mixerFreqCanvas').addEventListener('click',e=>{const c=e.currentTarget,r=c.getBoundingClientRect(),u=frequencyAt((e.clientX-r.left)/r.width),v=frequencyAt((e.clientY-r.top)/r.height);addPair(u,v)});
$('#clearMixer').onclick=()=>{stopBuild();mix.pairs=[];mix.selected=null;mix.nextColor=0;renderMixer()};
$('#playBuild').onclick=()=>{stopBuild();if(!mix.pairs.length)return;let i=0;renderMixer(0);$('#playBuild').textContent='Building…';mix.timer=setInterval(()=>{renderMixer(++i);if(i>=mix.pairs.length)stopBuild()},450)};
renderMixer();

// Filter studio --------------------------------------------------------------
const N=32;let filterKind='ideal-low',cutoff=6,innerDiameter=22,outerDiameter=40,source=makeTestImage(),spectrum=null;
const trig=Array.from({length:N},(_,k)=>Array.from({length:N},(_,n)=>({c:Math.cos(2*Math.PI*k*n/N),s:Math.sin(2*Math.PI*k*n/N)})));
function makeTestImage(){const a=new Float32Array(N*N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){let v=35+2.5*x+1.5*y;if(x>5&&x<15&&y>6&&y<25)v+=120;if((x-23)**2+(y-11)**2<35)v+=135;if(Math.abs(y-25)<2)v+=100;v+=18*Math.sin(2*Math.PI*(7*x/N+5*y/N));a[y*N+x]=Math.max(0,Math.min(255,v))}return a}
function dft2(input,inverse=false){const tmp=Array.from({length:N*N},()=>[0,0]),out=Array.from({length:N*N},()=>[0,0]),sign=inverse?1:-1;for(let y=0;y<N;y++)for(let u=0;u<N;u++){let re=0,im=0;for(let x=0;x<N;x++){const val=Array.isArray(input[y*N+x])?input[y*N+x]:[input[y*N+x],0],t=trig[u][x],si=sign*t.s;re+=val[0]*t.c-val[1]*si;im+=val[0]*si+val[1]*t.c}tmp[y*N+u]=[re,im]}for(let v=0;v<N;v++)for(let u=0;u<N;u++){let re=0,im=0;for(let y=0;y<N;y++){const val=tmp[y*N+u],t=trig[v][y],si=sign*t.s;re+=val[0]*t.c-val[1]*si;im+=val[0]*si+val[1]*t.c}out[v*N+u]=inverse?[re/(N*N),im/(N*N)]:[re,im]}return out}
function maskAt(u,v){const du=Math.min(u,N-u),dv=Math.min(v,N-v),d=Math.hypot(du,dv);if(filterKind==='ideal-low')return d<=cutoff?1:0;if(filterKind==='gaussian-low')return Math.exp(-(d*d)/(2*cutoff*cutoff));if(filterKind==='ideal-high')return d<=cutoff?0:1;if(filterKind==='gaussian-high')return 1-Math.exp(-(d*d)/(2*cutoff*cutoff));const inner=innerDiameter/2,outer=outerDiameter/2;if(filterKind==='gaussian-band')return Math.exp(-d*d/(2*outer*outer))-Math.exp(-d*d/(2*inner*inner));return d>=inner&&d<=outer?1:0}
function grayCanvas(canvas,values,normalize=false,log=false){const ctx=canvas.getContext('2d'),off=document.createElement('canvas');off.width=off.height=N;const o=off.getContext('2d'),im=o.createImageData(N,N);let arr=values.map?values.map((v)=>Array.isArray(v)?Math.hypot(v[0],v[1]):v):values;if(log)arr=arr.map(v=>Math.log1p(v));let min=normalize?Math.min(...arr):0,max=normalize?Math.max(...arr):255;for(let y=0;y<N;y++)for(let x=0;x<N;x++){const sx=log?(x+N/2)%N:x,sy=log?(y+N/2)%N:y,val=arr[sy*N+sx],g=Math.round(Math.max(0,Math.min(255,(val-min)/(max-min||1)*255))),i=(y*N+x)*4;im.data.set([g,g,g,255],i)}o.putImageData(im,0,0);ctx.imageSmoothingEnabled=false;ctx.drawImage(off,0,0,canvas.width,canvas.height)}
function renderFilter(){spectrum=dft2(source);const masked=spectrum.map((z,i)=>{const m=maskAt(i%N,Math.floor(i/N));return[z[0]*m,z[1]*m]}),result=dft2(masked,true).map(z=>z[0]),mask=new Float32Array(N*N);for(let i=0;i<mask.length;i++)mask[i]=maskAt(i%N,Math.floor(i/N))*255;grayCanvas($('#sourceCanvas'),source);grayCanvas($('#sourceSpectrumCanvas'),spectrum,true,true);grayCanvas($('#maskCanvas'),mask,true,true);grayCanvas($('#resultCanvas'),result);updateFilterCopy()}
function updateFilterCopy(){const names={'ideal-low':'ideal LPF','gaussian-low':'Gaussian LPF','ideal-high':'ideal HPF','gaussian-high':'Gaussian HPF','ideal-band':'Ideal BPF','gaussian-band':'Gaussian BPF'};$('#maskLabel').textContent=names[filterKind];const ideal=filterKind.startsWith('ideal'),high=filterKind.includes('high'),band=filterKind.endsWith('-band');$('#singleCutoffControl').hidden=band;$('#bandCutoffControls').hidden=!band;$('#filterInsightTitle').textContent=band?'Keep one frequency band':high?'High frequencies → details':ideal?'Hard cutoff → ringing':'Smooth cutoff → less ringing';$('#filterInsight').textContent=band?(ideal?'Ideal band-pass retains the annulus Dᵢ/2 ≤ D ≤ Dₒ/2. Adjust the inner and outer diameters independently.':'Gaussian band-pass uses the difference of two Gaussians (σᵢ = Dᵢ/2, σₒ = Dₒ/2). The diameter controls set their scales; boundaries are smooth.'):high?'Once the central low frequencies are suppressed, smooth brightness trends disappear and the remaining response mainly contains edges, detail, and noise.':ideal?'An ideal low-pass filter has an abrupt frequency boundary. Its spatial counterpart is a sinc with side lobes, so ringing appears near edges.':'A Gaussian mask changes smoothly near the cutoff. Its spatial response has no prominent side lobes, producing more natural blur with less ringing.'}

$('#cutoffRange').oninput=e=>{$('#cutoffOut').value=cutoff=+e.target.value;renderFilter()};$('#resetImage').onclick=()=>{source=makeTestImage();renderFilter()};
$('#imageUpload').onchange=e=>{const file=e.target.files[0];if(!file)return;const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=N;const ctx=c.getContext('2d');ctx.drawImage(img,0,0,N,N);const data=ctx.getImageData(0,0,N,N).data;source=new Float32Array(N*N);for(let i=0;i<source.length;i++)source[i]=.2126*data[i*4]+.7152*data[i*4+1]+.0722*data[i*4+2];renderFilter();URL.revokeObjectURL(img.src)};img.src=URL.createObjectURL(file)};
renderFilter();

// Full-resolution 256 x 256 FFT pipeline for Filter Studio -----------------
const FILTER_N=256;let filterSource1024=makeFilterImage1024(),filterSpectrum1024=null,filterJob=null;
function makeFilterImage1024(){const a=new Float32Array(FILTER_N*FILTER_N);for(let y=0;y<FILTER_N;y++)for(let x=0;x<FILTER_N;x++){let v=28+75*x/FILTER_N+38*y/FILTER_N;if(x>FILTER_N*.15&&x<FILTER_N*.45&&y>FILTER_N*.18&&y<FILTER_N*.79)v+=105;if((x-FILTER_N*.73)**2+(y-FILTER_N*.32)**2<(FILTER_N*.105)**2)v+=130;if(Math.abs(y-FILTER_N*.80)<FILTER_N*.035)v+=90;v+=14*Math.sin(2*Math.PI*(15*x/FILTER_N+9*y/FILTER_N));a[y*FILTER_N+x]=Math.max(0,Math.min(255,v))}return a}
function fftLine(re,im,offset,stride,n,inverse){for(let i=1,j=0;i<n;i++){let bit=n>>1;for(;j&bit;bit>>=1)j^=bit;j^=bit;if(i<j){const a=offset+i*stride,b=offset+j*stride,tr=re[a],ti=im[a];re[a]=re[b];im[a]=im[b];re[b]=tr;im[b]=ti}}for(let len=2;len<=n;len<<=1){const ang=(inverse?2:-2)*Math.PI/len,wlr=Math.cos(ang),wli=Math.sin(ang);for(let start=0;start<n;start+=len){let wr=1,wi=0;for(let j=0;j<len/2;j++){const a=offset+(start+j)*stride,b=offset+(start+j+len/2)*stride,br=re[b]*wr-im[b]*wi,bi=re[b]*wi+im[b]*wr,ar=re[a],ai=im[a];re[a]=ar+br;im[a]=ai+bi;re[b]=ar-br;im[b]=ai-bi;const nw=wr*wlr-wi*wli;wi=wr*wli+wi*wlr;wr=nw}}}if(inverse)for(let i=0;i<n;i++){const p=offset+i*stride;re[p]/=n;im[p]/=n}}
function fft2Large(re,im,inverse=false){for(let y=0;y<FILTER_N;y++)fftLine(re,im,y*FILTER_N,1,FILTER_N,inverse);for(let x=0;x<FILTER_N;x++)fftLine(re,im,x,FILTER_N,FILTER_N,inverse)}
function computeFilterSpectrum(){const re=new Float32Array(filterSource1024),im=new Float32Array(re.length);fft2Large(re,im);filterSpectrum1024={re,im}}
function mask1024(u,v){const du=Math.min(u,FILTER_N-u),dv=Math.min(v,FILTER_N-v),d=Math.hypot(du,dv);if(filterKind==='ideal-low')return d<=cutoff?1:0;if(filterKind==='gaussian-low')return Math.exp(-(d*d)/(2*cutoff*cutoff));if(filterKind==='ideal-high')return d<=cutoff?0:1;if(filterKind==='gaussian-high')return 1-Math.exp(-(d*d)/(2*cutoff*cutoff));const inner=innerDiameter/2,outer=outerDiameter/2;if(filterKind==='gaussian-band')return Math.exp(-d*d/(2*outer*outer))-Math.exp(-d*d/(2*inner*inner));return d>=inner&&d<=outer?1:0}
function paintLarge(canvas,values,shift=false,log=false,normalize=false){const ctx=canvas.getContext('2d'),im=ctx.createImageData(FILTER_N,FILTER_N);let max=normalize?0:255;if(normalize)for(let i=0;i<values.length;i++){const q=log?Math.log1p(values[i]):values[i];if(q>max)max=q}for(let y=0;y<FILTER_N;y++)for(let x=0;x<FILTER_N;x++){const sx=shift?(x+FILTER_N/2)%FILTER_N:x,sy=shift?(y+FILTER_N/2)%FILTER_N:y,q0=values[sy*FILTER_N+sx],q=log?Math.log1p(q0):q0,g=Math.round(Math.max(0,Math.min(255,normalize?q/(max||1)*255:q))),i=(y*FILTER_N+x)*4;im.data[i]=im.data[i+1]=im.data[i+2]=g;im.data[i+3]=255}ctx.putImageData(im,0,0)}
function paintSignedLarge(canvas,values){const samples=[];for(let i=0;i<values.length;i+=64)samples.push(Math.abs(values[i]));samples.sort((a,b)=>a-b);const limit=samples[Math.floor(samples.length*.995)]||1,scale=112/limit,ctx=canvas.getContext('2d'),im=ctx.createImageData(FILTER_N,FILTER_N);for(let i=0;i<values.length;i++){const g=Math.round(Math.max(0,Math.min(255,128+values[i]*scale))),p=i*4;im.data[p]=im.data[p+1]=im.data[p+2]=g;im.data[p+3]=255}ctx.putImageData(im,0,0)}
function renderFilter1024(recompute=false){const badge=$('#filterResolution');badge.classList.add('busy');badge.textContent='PROCESSING 256²…';clearTimeout(filterJob);filterJob=setTimeout(()=>{if(recompute||!filterSpectrum1024)computeFilterSpectrum();const count=FILTER_N*FILTER_N,mag=new Float32Array(count),mask=new Float32Array(count),re=new Float32Array(filterSpectrum1024.re),im=new Float32Array(filterSpectrum1024.im);for(let i=0;i<count;i++){mag[i]=Math.hypot(re[i],im[i]);const m=mask1024(i%FILTER_N,Math.floor(i/FILTER_N));mask[i]=m*255;re[i]*=m;im[i]*=m}fft2Large(re,im,true);paintLarge($('#sourceCanvas'),filterSource1024);paintLarge($('#sourceSpectrumCanvas'),mag,true,true,true);paintLarge($('#maskCanvas'),mask,true);const signed=filterKind.includes('high')||filterKind.endsWith('-band');signed?paintSignedLarge($('#resultCanvas'),re):paintLarge($('#resultCanvas'),re);$('#resultModeLabel').textContent=signed?'zero response = middle grey':'256×256 g(x,y)';updateFilterCopy();badge.classList.remove('busy');badge.textContent='256 × 256 FFT'},30)}
$('#cutoffRange').oninput=e=>{$('#cutoffOut').value=cutoff=+e.target.value;renderFilter1024()};$('#resetImage').onclick=()=>{filterSource1024=makeFilterImage1024();renderFilter1024(true)};$('#imageUpload').onchange=e=>{const file=e.target.files[0];if(!file)return;const img=new Image();img.onload=()=>{const c=document.createElement('canvas');c.width=c.height=FILTER_N;const q=c.getContext('2d'),scale=Math.max(FILTER_N/img.width,FILTER_N/img.height),w=img.width*scale,h=img.height*scale;q.drawImage(img,(FILTER_N-w)/2,(FILTER_N-h)/2,w,h);const d=q.getImageData(0,0,FILTER_N,FILTER_N).data;filterSource1024=new Float32Array(FILTER_N*FILTER_N);for(let i=0;i<filterSource1024.length;i++)filterSource1024[i]=.2126*d[i*4]+.7152*d[i*4+1]+.0722*d[i*4+2];URL.revokeObjectURL(img.src);renderFilter1024(true)};img.src=URL.createObjectURL(file)};cutoff=20;$('[data-section="filter"]').addEventListener('click',()=>{if(!filterSpectrum1024)renderFilter1024(true)});

if(false){
// Previous integrated prototype (kept inert during the dual-view redesign).
// Integrated image decomposition lab ----------------------------------------
const decomp={image:makeTestImage(),spec:null,u:0,v:0,px:16,py:16,yaw:-.42,pitch:.52,layers:64,drag:null,animation:null,order:[]};

function signedFreq(k){return k<=N/2?k:k-N}
function loadDecompFile(file){if(!file)return;const img=new Image();img.onload=()=>{const temp=document.createElement('canvas');temp.width=temp.height=N;const ctx=temp.getContext('2d');ctx.drawImage(img,0,0,N,N);const rgba=ctx.getImageData(0,0,N,N).data,next=new Float32Array(N*N);for(let i=0;i<next.length;i++)next[i]=.2126*rgba[i*4]+.7152*rgba[i*4+1]+.0722*rgba[i*4+2];decomp.image=next;URL.revokeObjectURL(img.src);prepareDecomposition()};img.src=URL.createObjectURL(file)}
function prepareDecomposition(){decomp.spec=dft2(decomp.image);decomp.order=Array.from({length:N*N},(_,i)=>i).sort((a,b)=>Math.hypot(...decomp.spec[b])-Math.hypot(...decomp.spec[a]));renderDecomposition()}
function renderDecomposition(){drawImagePlane3d();drawDecompSpectrum();drawSelectedBasis();renderAssembly();updatePixelReadout()}

function projectPixel(x,y,z=0){const c=$('#imagePlane3d'),xx=(x/N-.5)*2,yy=(y/N-.5)*2;let X=xx*Math.cos(decomp.yaw)+z*Math.sin(decomp.yaw),Z=-xx*Math.sin(decomp.yaw)+z*Math.cos(decomp.yaw),Y=yy*Math.cos(decomp.pitch)-Z*Math.sin(decomp.pitch);Z=yy*Math.sin(decomp.pitch)+Z*Math.cos(decomp.pitch);const scale=1.75/(2.55-Z);return{x:c.width/2+X*scale*c.width*.48,y:c.height/2+Y*scale*c.width*.48,z:Z}}
function drawImagePlane3d(){const c=$('#imagePlane3d'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);const cells=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const pts=[projectPixel(x,y),projectPixel(x+1,y),projectPixel(x+1,y+1),projectPixel(x,y+1)];cells.push({x,y,pts,z:pts.reduce((s,p)=>s+p.z,0)/4})}cells.sort((a,b)=>a.z-b.z);for(const cell of cells){const g=Math.round(decomp.image[cell.y*N+cell.x]);ctx.fillStyle=`rgb(${g},${g},${g})`;ctx.beginPath();ctx.moveTo(cell.pts[0].x,cell.pts[0].y);for(let i=1;i<4;i++)ctx.lineTo(cell.pts[i].x,cell.pts[i].y);ctx.closePath();ctx.fill();if(cell.x===decomp.px&&cell.y===decomp.py){ctx.strokeStyle='#33d6d0';ctx.lineWidth=3;ctx.shadowColor='#33d6d0';ctx.shadowBlur=12;ctx.stroke();ctx.shadowBlur=0}}
  const axes=[['x',projectPixel(0,N+2),projectPixel(N,N+2),'#33d6d0'],['y',projectPixel(-2,0),projectPixel(-2,N),'#f4b860']];for(const [label,a,b,col] of axes){ctx.strokeStyle=col;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();ctx.fillStyle=col;ctx.font='13px Segoe UI';ctx.fillText(label,b.x+5,b.y)}
}
function updatePixelReadout(){const g=Math.round(decomp.image[decomp.py*N+decomp.px]);$('#pixelCoord').textContent=`(x, y) = (${decomp.px}, ${decomp.py})`;$('#pixelGrey').textContent=`${g} / 255`;$('#pixelNormalized').textContent=(g/255).toFixed(3);$('#pixelSwatch').style.background=`rgb(${g},${g},${g})`}
const plane=$('#imagePlane3d');plane.onpointerdown=e=>{plane.setPointerCapture(e.pointerId);decomp.drag={x:e.clientX,y:e.clientY,yaw:decomp.yaw,pitch:decomp.pitch,moved:false}};plane.onpointermove=e=>{if(!decomp.drag)return;const dx=e.clientX-decomp.drag.x,dy=e.clientY-decomp.drag.y;decomp.drag.moved=Math.hypot(dx,dy)>4;decomp.yaw=decomp.drag.yaw+dx*.012;decomp.pitch=decomp.drag.pitch+dy*.012;drawImagePlane3d()};plane.onpointerup=e=>{if(!decomp.drag)return;if(!decomp.drag.moved){const r=plane.getBoundingClientRect(),mx=(e.clientX-r.left)*plane.width/r.width,my=(e.clientY-r.top)*plane.height/r.height;let best={d:Infinity,x:0,y:0};for(let y=0;y<N;y++)for(let x=0;x<N;x++){const p=projectPixel(x+.5,y+.5),d=(p.x-mx)**2+(p.y-my)**2;if(d<best.d)best={d,x,y}}decomp.px=best.x;decomp.py=best.y;updatePixelReadout();drawImagePlane3d()}decomp.drag=null};

function drawDecompSpectrum(){const c=$('#decompSpectrum'),ctx=c.getContext('2d'),vals=new Float32Array(N*N);let max=0;for(let sy=0;sy<N;sy++)for(let sx=0;sx<N;sx++){const u=(sx+N/2)%N,v=(sy+N/2)%N,z=decomp.spec[v*N+u],q=Math.log1p(Math.hypot(z[0],z[1]));vals[sy*N+sx]=q;max=Math.max(max,q)}const cell=c.width/N;ctx.clearRect(0,0,c.width,c.height);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=vals[y*N+x]/max,g=Math.round(7+q*248);ctx.fillStyle=`rgb(${Math.round(g*.65)},${Math.round(g*.92)},${g})`;ctx.fillRect(x*cell,y*cell,cell+.5,cell+.5)}ctx.strokeStyle='rgba(51,214,208,.28)';ctx.beginPath();ctx.moveTo(c.width/2,0);ctx.lineTo(c.width/2,c.height);ctx.moveTo(0,c.height/2);ctx.lineTo(c.width,c.height/2);ctx.stroke();const sx=((decomp.u+N/2)%N),sy=((decomp.v+N/2)%N);mark(sx,sy,'#33d6d0');mark((N-sx)%N,(N-sy)%N,'#f4b860');function mark(x,y,color){ctx.strokeStyle=color;ctx.lineWidth=3;ctx.strokeRect(x*cell+1,y*cell+1,cell-2,cell-2);ctx.shadowColor=color;ctx.shadowBlur=12;ctx.strokeRect(x*cell+2,y*cell+2,cell-4,cell-4);ctx.shadowBlur=0}}
$('#decompSpectrum').onclick=e=>{const c=e.currentTarget,r=c.getBoundingClientRect(),sx=Math.max(0,Math.min(N-1,Math.floor((e.clientX-r.left)/r.width*N))),sy=Math.max(0,Math.min(N-1,Math.floor((e.clientY-r.top)/r.height*N)));decomp.u=(sx+N/2)%N;decomp.v=(sy+N/2)%N;drawDecompSpectrum();drawSelectedBasis()};
function drawSignedField(canvas,fn,color=true){const off=document.createElement('canvas');off.width=off.height=N;const o=off.getContext('2d'),im=o.createImageData(N,N);let max=0,vals=new Float32Array(N*N);for(let y=0;y<N;y++)for(let x=0;x<N;x++){const q=fn(x,y);vals[y*N+x]=q;max=Math.max(max,Math.abs(q))}max=max||1;for(let i=0;i<vals.length;i++){const q=vals[i]/max,rgb=color?palette(q):[Math.round((q+1)*127.5),Math.round((q+1)*127.5),Math.round((q+1)*127.5)];im.data.set([...rgb,255],i*4)}o.putImageData(im,0,0);const ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(off,0,0,canvas.width,canvas.height)}
function drawSelectedBasis(){const z=decomp.spec[decomp.v*N+decomp.u],mag=Math.hypot(z[0],z[1]),phase=Math.atan2(z[1],z[0]),theta=(x,y)=>2*Math.PI*(decomp.u*x/N+decomp.v*y/N);drawSignedField($('#selectedBasisReal'),(x,y)=>Math.cos(theta(x,y)),false);drawSignedField($('#selectedBasisImag'),(x,y)=>Math.sin(theta(x,y)),false);drawSignedField($('#selectedContribution'),(x,y)=>(z[0]*Math.cos(theta(x,y))-z[1]*Math.sin(theta(x,y)))/(N*N));const su=signedFreq(decomp.u),sv=signedFreq(decomp.v);$('#selectedUV').textContent=`(u, v) = (${su}, ${sv})`;$('#selectedMagnitude').textContent=mag.toFixed(1);$('#selectedPhase').textContent=(phase*180/Math.PI).toFixed(1)+'°';$('#basisFrequencyTag').textContent=su===0&&sv===0?'DC COMPONENT':`RADIAL FREQ. ${Math.hypot(su,sv).toFixed(2)}`;$('#selectedCoeffFormula').textContent=`F(${su},${sv}) × aₙ,ᵥ(x,y)`;$('#selectedMeaning').textContent=su===0&&sv===0?'DC controls the average grey level.':`This layer varies fastest along (${su}, ${sv}); its stripes are perpendicular.`;$('#decompStoryTitle').textContent=su===0&&sv===0?'The DC layer is the starting plane':`One spectrum point is one complex image layer`;$('#decompStory').textContent=su===0&&sv===0?'It is a plane with the same value at every pixel, determined by the image average intensity.':`The selected frequency (${su}, ${sv}) sets stripe density and direction, |F| sets layer strength, and phase sets its position.`}

function renderAssembly(){const keep=new Set(decomp.order.slice(0,decomp.layers)),partial=decomp.spec.map((z,i)=>keep.has(i)?z:[0,0]),recon=dft2(partial,true).map(z=>z[0]);let mse=0;for(let i=0;i<recon.length;i++)mse+=(decomp.image[i]-recon[i])**2;mse/=recon.length;grayCanvas($('#assembledCanvas'),recon);drawLayerStack();$('#assemblyCount').textContent=decomp.layers;$('#assemblyError').textContent=mse.toFixed(2);$('#assemblyBar').style.width=(decomp.layers/(N*N)*100)+'%';$('#layerCountOut').value=decomp.layers}
function drawLayerStack(){const c=$('#layerStackCanvas'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);const visible=Math.min(14,decomp.layers),indices=decomp.order.slice(0,visible);for(let i=visible-1;i>=0;i--){const idx=indices[i],u=idx%N,v=Math.floor(idx/N),z=decomp.spec[idx],strength=Math.log1p(Math.hypot(z[0],z[1]))/12,ox=44+i*13,oy=27+(visible-1-i)*11,w=c.width-155,h=150;ctx.fillStyle=`rgba(${20+Math.round(strength*20)},${65+Math.round(strength*90)},${72+Math.round(strength*100)},.78)`;ctx.strokeStyle=i===0?'#33d6d0':'#31515b';ctx.beginPath();ctx.moveTo(ox,oy);ctx.lineTo(ox+w,oy-18);ctx.lineTo(ox+w+34,oy+h-18);ctx.lineTo(ox+34,oy+h);ctx.closePath();ctx.fill();ctx.stroke();ctx.save();ctx.clip();ctx.strokeStyle='rgba(232,241,242,.28)';ctx.lineWidth=1;const fu=Math.max(1,Math.abs(signedFreq(u))+Math.abs(signedFreq(v)));for(let k=-h;k<w+h;k+=Math.max(7,28-fu)){ctx.beginPath();ctx.moveTo(ox+k,oy-20);ctx.lineTo(ox+k+95,oy+h+20);ctx.stroke()}ctx.restore();if(i<5){ctx.fillStyle='#b6c8cc';ctx.font='10px Segoe UI';ctx.fillText(`(${signedFreq(u)},${signedFreq(v)})`,ox+w+40,oy+12)}}ctx.fillStyle='#8ca2a9';ctx.font='10px Segoe UI';ctx.fillText(visible<decomp.layers?`top ${visible} visible · ${decomp.layers-visible} more layers active`:`${visible} active layers`,18,c.height-16)}
$('#layerCountRange').oninput=e=>{decomp.layers=+e.target.value;renderAssembly()};$('#playLayers').onclick=()=>{clearInterval(decomp.animation);decomp.layers=1;$('#layerCountRange').value=1;renderAssembly();decomp.animation=setInterval(()=>{decomp.layers=Math.min(N*N,Math.ceil(decomp.layers*1.38+1));$('#layerCountRange').value=decomp.layers;renderAssembly();if(decomp.layers>=N*N)clearInterval(decomp.animation)},150)};$('#decompUpload').onchange=e=>loadDecompFile(e.target.files[0]);$('#decompSample').onclick=()=>{decomp.image=makeTestImage();prepareDecomposition()};$('#topView').onclick=()=>{decomp.yaw=0;decomp.pitch=0;drawImagePlane3d()};$('#resetView').onclick=()=>{decomp.yaw=-.42;decomp.pitch=.52;drawImagePlane3d()};prepareDecomposition();
}

if(false){
// Dual 3D decomposition workspace -------------------------------------------
const dual={image:makeTestImage(),spec:null,split:false,leftSelected:null,rightU:0,rightV:0,leftYaw:-.48,leftPitch:.48,rightYaw:-.48,rightPitch:.56,leftDrag:null,rightDrag:null,leftAnchors:[],rightPoints:[]};
function dualSigned(k){return k<=N/2?k:k-N}
function dualProject(x,y,z,c,yCenter=c.height*.48,scale=.37,yaw=0,pitch=0){let X=x*Math.cos(yaw)+z*Math.sin(yaw),Z=-x*Math.sin(yaw)+z*Math.cos(yaw),Y=y*Math.cos(pitch)-Z*Math.sin(pitch);Z=y*Math.sin(pitch)+Z*Math.cos(pitch);const p=2.6/(3.2-Z);return{x:c.width/2+X*p*c.width*scale,y:yCenter+Y*p*c.width*scale,z:Z}}
function pathQuad(ctx,pts){ctx.beginPath();ctx.moveTo(pts[0].x,pts[0].y);for(let i=1;i<4;i++)ctx.lineTo(pts[i].x,pts[i].y);ctx.closePath()}
function loadDualImage(file){if(!file)return;const img=new Image();img.onload=()=>{const t=document.createElement('canvas');t.width=t.height=N;const q=t.getContext('2d');q.drawImage(img,0,0,N,N);const d=q.getImageData(0,0,N,N).data,a=new Float32Array(N*N);for(let i=0;i<a.length;i++)a[i]=.2126*d[i*4]+.7152*d[i*4+1]+.0722*d[i*4+2];dual.image=a;URL.revokeObjectURL(img.src);prepareDual()};img.src=URL.createObjectURL(file)}
function prepareDual(){dual.spec=dft2(dual.image);dual.leftSelected=null;dual.rightU=dual.rightV=0;drawDual();updateRelation()}
function drawDual(){drawLeftScene();drawRightScene();updateDualReadouts()}

function drawTexturedPlane(ctx,c,valueAt,z=0,yaw=dual.leftYaw,pitch=dual.leftPitch,center=c.height*.49,scale=.37){const cells=[];for(let y=0;y<N;y++)for(let x=0;x<N;x++){const p=[dualProject(x/N-0.5,y/N-0.5,z,c,center,scale,yaw,pitch),dualProject((x+1)/N-0.5,y/N-0.5,z,c,center,scale,yaw,pitch),dualProject((x+1)/N-0.5,(y+1)/N-0.5,z,c,center,scale,yaw,pitch),dualProject(x/N-0.5,(y+1)/N-0.5,z,c,center,scale,yaw,pitch)];cells.push({p,val:valueAt(x,y),z:p.reduce((s,a)=>s+a.z,0)/4})}cells.sort((a,b)=>a.z-b.z);let max=0;for(const cell of cells)max=Math.max(max,Math.abs(cell.val));max=max||255;for(const cell of cells){const g=valueAt===dualImageValue?Math.max(0,Math.min(255,cell.val)):null;ctx.fillStyle=g!==null?`rgb(${g},${g},${g})`:`rgb(${palette(cell.val/max).join(',')})`;pathQuad(ctx,cell.p);ctx.fill()}}
function dualImageValue(x,y){return Math.round(dual.image[y*N+x])}
function drawLeftScene(){const c=$('#leftScene'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);dual.leftAnchors=[];drawFloor(ctx,c,'SPATIAL IMAGE / BASIS LAYERS');if(!dual.split){drawTexturedPlane(ctx,c,dualImageValue);drawPlaneFrame(ctx,c,0,dual.leftYaw,dual.leftPitch,'uploaded image');return}
  for(let i=0;i<N*N;i++){const z=-.96+1.92*i/(N*N-1),p=[dualProject(-.5,-.5,z,c,c.height*.47,.31,dual.leftYaw,dual.leftPitch),dualProject(.5,-.5,z,c,c.height*.47,.31,dual.leftYaw,dual.leftPitch),dualProject(.5,.5,z,c,c.height*.47,.31,dual.leftYaw,dual.leftPitch),dualProject(-.5,.5,z,c,c.height*.47,.31,dual.leftYaw,dual.leftPitch)],mid={x:p.reduce((s,a)=>s+a.x,0)/4,y:p.reduce((s,a)=>s+a.y,0)/4};dual.leftAnchors.push({i,x:mid.x,y:mid.y});ctx.strokeStyle=i===dual.leftSelected?'#33d6d0':'rgba(79,145,154,.075)';ctx.lineWidth=i===dual.leftSelected?3:1;pathQuad(ctx,p);ctx.stroke()}
  if(dual.leftSelected!==null){const u=dual.leftSelected%N,v=Math.floor(dual.leftSelected/N),z=-.96+1.92*dual.leftSelected/(N*N-1),coef=dual.spec[dual.leftSelected];drawTexturedPlane(ctx,c,(x,y)=>(coef[0]*Math.cos(2*Math.PI*(u*x/N+v*y/N))-coef[1]*Math.sin(2*Math.PI*(u*x/N+v*y/N)))/(N*N),z,dual.leftYaw,dual.leftPitch,c.height*.47,.31);drawPlaneFrame(ctx,c,z,dual.leftYaw,dual.leftPitch,`layer (${dualSigned(u)}, ${dualSigned(v)})`,c.height*.47,.31)}
  ctx.fillStyle='#8ca2a9';ctx.font='11px Segoe UI';ctx.fillText('1024 / 1024 layers shown along the decomposition axis',18,c.height-18)
}
function drawPlaneFrame(ctx,c,z,yaw,pitch,label,center=c.height*.49,scale=.37){const p=[dualProject(-.5,-.5,z,c,center,scale,yaw,pitch),dualProject(.5,-.5,z,c,center,scale,yaw,pitch),dualProject(.5,.5,z,c,center,scale,yaw,pitch),dualProject(-.5,.5,z,c,center,scale,yaw,pitch)];ctx.strokeStyle='#33d6d0';ctx.lineWidth=2;pathQuad(ctx,p);ctx.stroke();ctx.fillStyle='#33d6d0';ctx.font='11px Segoe UI';ctx.fillText(label,p[0].x,p[0].y-8)}
function drawFloor(ctx,c,label){ctx.fillStyle='#8ca2a9';ctx.font='9px Segoe UI';ctx.fillText(label,16,20);ctx.strokeStyle='rgba(80,120,130,.16)';for(let i=0;i<8;i++){ctx.beginPath();ctx.moveTo(0,c.height*.75+i*8);ctx.lineTo(c.width,c.height*.75+i*8);ctx.stroke()}}

function spectrumHeight(u,v){return Math.log1p(Math.hypot(...dual.spec[v*N+u]))}
function drawRightScene(){const c=$('#rightScene'),ctx=c.getContext('2d');ctx.clearRect(0,0,c.width,c.height);drawFloor(ctx,c,'MAGNITUDE SURFACE + SELECTED BASIS BELOW');let max=0;for(let i=0;i<N*N;i++)max=Math.max(max,Math.log1p(Math.hypot(...dual.spec[i])));dual.rightPoints=[];const pts=Array.from({length:N*N});for(let sy=0;sy<N;sy++)for(let sx=0;sx<N;sx++){const u=(sx+N/2)%N,v=(sy+N/2)%N,h=spectrumHeight(u,v)/max*.7,p=dualProject(sx/(N-1)-.5,sy/(N-1)-.5,h,c,c.height*.29,.38,dual.rightYaw,dual.rightPitch);pts[sy*N+sx]={...p,u,v,h};dual.rightPoints.push({...p,u,v})}
  for(let sy=0;sy<N;sy++){ctx.beginPath();for(let sx=0;sx<N;sx++){const p=pts[sy*N+sx];sx?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.strokeStyle='rgba(51,214,208,.28)';ctx.stroke()}for(let sx=0;sx<N;sx++){ctx.beginPath();for(let sy=0;sy<N;sy++){const p=pts[sy*N+sx];sy?ctx.lineTo(p.x,p.y):ctx.moveTo(p.x,p.y)}ctx.strokeStyle='rgba(51,214,208,.2)';ctx.stroke()}
  const chosen=dual.rightPoints.find(p=>p.u===dual.rightU&&p.v===dual.rightV);if(chosen){ctx.fillStyle='#f4b860';ctx.shadowColor='#f4b860';ctx.shadowBlur=15;ctx.beginPath();ctx.arc(chosen.x,chosen.y,7,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#f4b860';ctx.font='11px Segoe UI';ctx.fillText(`(${dualSigned(chosen.u)}, ${dualSigned(chosen.v)})`,chosen.x+9,chosen.y-7)}
  const u=dual.rightU,v=dual.rightV;drawBasisPlaneBelow(ctx,c,u,v);ctx.strokeStyle='rgba(244,184,96,.55)';ctx.setLineDash([5,5]);ctx.beginPath();ctx.moveTo(chosen.x,chosen.y+8);ctx.lineTo(c.width/2,c.height*.63);ctx.stroke();ctx.setLineDash([])
}
function drawBasisPlaneBelow(ctx,c,u,v){const center=c.height*.79,scale=.29,cells=[];for(let y=0;y<20;y++)for(let x=0;x<20;x++){const p=[dualProject(x/20-.5,y/20-.5,0,c,center,scale,dual.rightYaw,.18),dualProject((x+1)/20-.5,y/20-.5,0,c,center,scale,dual.rightYaw,.18),dualProject((x+1)/20-.5,(y+1)/20-.5,0,c,center,scale,dual.rightYaw,.18),dualProject(x/20-.5,(y+1)/20-.5,0,c,center,scale,dual.rightYaw,.18)],val=Math.cos(2*Math.PI*(u*x/20+v*y/20));cells.push({p,val})}for(const cell of cells){const g=Math.round((cell.val+1)*127.5);ctx.fillStyle=`rgb(${g},${g},${g})`;pathQuad(ctx,cell.p);ctx.fill()}drawPlaneFrame(ctx,c,0,dual.rightYaw,.18,`basis a(${dualSigned(u)}, ${dualSigned(v)})`,center,scale)}

function bindRotatable(canvas,side){canvas.onpointerdown=e=>{canvas.setPointerCapture(e.pointerId);dual[side+'Drag']={x:e.clientX,y:e.clientY,yaw:dual[side+'Yaw'],pitch:dual[side+'Pitch'],moved:false}};canvas.onpointermove=e=>{const d=dual[side+'Drag'];if(!d)return;const dx=e.clientX-d.x,dy=e.clientY-d.y;d.moved=Math.hypot(dx,dy)>5;dual[side+'Yaw']=d.yaw+dx*.011;dual[side+'Pitch']=d.pitch+dy*.011;side==='left'?drawLeftScene():drawRightScene()};canvas.onpointerup=e=>{const d=dual[side+'Drag'];if(!d)return;if(!d.moved){const r=canvas.getBoundingClientRect(),mx=(e.clientX-r.left)*canvas.width/r.width,my=(e.clientY-r.top)*canvas.height/r.height;if(side==='left'&&dual.split){let best=dual.leftAnchors.reduce((a,p)=>((p.x-mx)**2+(p.y-my)**2<a.d?{...p,d:(p.x-mx)**2+(p.y-my)**2}:a),{d:Infinity});dual.leftSelected=best.i;drawLeftScene();updateDualReadouts();updateRelation()}else if(side==='right'){let best=dual.rightPoints.reduce((a,p)=>((p.x-mx)**2+(p.y-my)**2<a.d?{...p,d:(p.x-mx)**2+(p.y-my)**2}:a),{d:Infinity});dual.rightU=best.u;dual.rightV=best.v;drawRightScene();updateDualReadouts();updateRelation()}}dual[side+'Drag']=null}}
bindRotatable($('#leftScene'),'left');bindRotatable($('#rightScene'),'right');
function updateDualReadouts(){$('#leftState').textContent=dual.split?'1024 basis layers separated':'combined image';if(dual.leftSelected===null)$('#leftLayerUV').textContent='none';else $('#leftLayerUV').textContent=`(u, v) = (${dualSigned(dual.leftSelected%N)}, ${dualSigned(Math.floor(dual.leftSelected/N))})`;const z=dual.spec[dual.rightV*N+dual.rightU];$('#rightUV').textContent=`(u, v) = (${dualSigned(dual.rightU)}, ${dualSigned(dual.rightV)})`;$('#rightMagnitude').textContent=Math.hypot(...z).toFixed(1);$('#rightPhase').textContent=(Math.atan2(z[1],z[0])*180/Math.PI).toFixed(1)+'°'}
function updateRelation(){const col=$('.relation-column');col.classList.remove('matched','mismatch');const right=`(${dualSigned(dual.rightU)}, ${dualSigned(dual.rightV)})`;$('#relationRight').textContent='right: '+right;if(dual.leftSelected===null){$('#relationLeft').textContent='left: —';$('#relationStatus').textContent='WAITING FOR LEFT LAYER';$('#relationTitle').textContent='Split the image and select a layer';$('#relationText').textContent='The right side is showing basis '+right+'. Select one of the 1024 layers on the left to compare them.';return}const lu=dual.leftSelected%N,lv=Math.floor(dual.leftSelected/N),left=`(${dualSigned(lu)}, ${dualSigned(lv)})`,match=lu===dual.rightU&&lv===dual.rightV;$('#relationLeft').textContent='left: '+left;$('#relationStatus').textContent=match?'EXACT BASIS MATCH':'DIFFERENT FREQUENCIES';$('#relationTitle').textContent=match?'The two sides are the same layer':'These are two different basis layers';$('#relationText').textContent=match?`F${right} sets the magnitude and phase of this left layer, while a${right} sets its stripe pattern.`:`The left side has ${left}; the right side has ${right}. Select the matching frequency or choose another left layer.`;col.classList.add(match?'matched':'mismatch')}
$('#splitImage').onclick=()=>{dual.split=!dual.split;if(!dual.split)dual.leftSelected=null;$('#splitImage').textContent=dual.split?'Combine image':'Split into 1024 basis layers';drawLeftScene();updateDualReadouts();updateRelation()};$('#decompUpload').onchange=e=>loadDualImage(e.target.files[0]);$('#decompSample').onclick=()=>{dual.image=makeTestImage();prepareDual()};$('#rightTopView').onclick=()=>{dual.rightYaw=0;dual.rightPitch=0;drawRightScene()};$('#resetDualView').onclick=()=>{dual.leftYaw=dual.rightYaw=-.48;dual.leftPitch=.48;dual.rightPitch=.56;drawDual()};prepareDual();
}

$$('.filter-type').forEach(b=>b.onclick=()=>{
  const key=b.dataset.pass?'pass':'profile';
  $$(`[data-${key}]`).forEach(x=>{const active=x===b;x.classList.toggle('active',active);x.setAttribute('aria-pressed',String(active))});
  filterKind=$('[data-profile].active').dataset.profile+'-'+$('[data-pass].active').dataset.pass;
  renderFilter1024();
});

function updateBandDiameter(key,value){
  if(key==='inner')innerDiameter=Math.max(2,Math.min(outerDiameter-2,value));
  else outerDiameter=Math.min(256,Math.max(innerDiameter+2,value));
  $('#innerDiameterRange').value=innerDiameter;$('#innerDiameterOut').value=innerDiameter;
  $('#outerDiameterRange').value=outerDiameter;$('#outerDiameterOut').value=outerDiameter;
  renderFilter1024();
}
for(const key of ['inner','outer'])$('#'+key+'DiameterRange').oninput=e=>updateBandDiameter(key,+e.target.value);

$('#aboutButton').onclick=()=>{closeLabMenu();$('#aboutDialog').showModal()};
$('#closeAbout').onclick=()=>$('#aboutDialog').close();
$('#aboutDialog').addEventListener('click',e=>{if(e.target!==e.currentTarget)return;const r=e.currentTarget.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)e.currentTarget.close()});
$('#aboutDialog').addEventListener('close',()=>$('#labMenuToggle').focus());
