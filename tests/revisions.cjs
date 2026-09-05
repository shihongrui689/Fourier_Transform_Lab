const fs = require('node:fs');
const vm = require('node:vm');
const assert = require('node:assert/strict');
const source = fs.readFileSync('app.js', 'utf8');
function functionSource(name) {
  const start = source.indexOf(`function ${name}(`);
  const body = source.indexOf('{', start);
  let depth = 1, end = body + 1;
  while (depth && end < source.length) { if (source[end] === '{') depth++; if (source[end] === '}') depth--; end++; }
  return source.slice(start, end);
}
const context = vm.createContext({assert});
vm.runInContext(`
const mix={re:1,im:-0.75,pairs:[],selected:null,nextColor:0},mixSize=32,pairColors=['blue','green'];
const stopBuild=()=>{},renderMixer=()=>{},selectPair=p=>mix.selected=p;
let filterKind='ideal-low',cutoff=20,innerDiameter=22,outerDiameter=40;const N=32,FILTER_N=256;
${['wrapFrequency','frequencyAt','conjugateOf','selfConjugate','addPair','mixerValues','maskAt','mask1024'].map(functionSource).join('\n')}
addPair(-3,2); assert.equal(mix.selected.u,3);assert.equal(mix.selected.v,-2);
addPair(3,-2);assert.equal(mix.pairs.length,1);
addPair(0,4);assert.equal(mix.selected.v,-4);assert.equal(mix.pairs.length,2);
assert.notEqual(mix.pairs[0].color,mix.pairs[1].color);
addPair(0,-4);assert.equal(mix.pairs.length,2);
addPair(0,0);assert.equal(mix.pairs.length,2);
assert.equal(mix.selected.im,-0.75);
for(const coefficient of [{re:1.25,im:0.75},{re:0,im:-1},{re:-1.5,im:0.5},{re:0,im:0}]){
mix.pairs=[{u:3,v:2,...coefficient}];
const {vals}=mixerValues();let re=0,im=0;
for(let y=0;y<32;y++)for(let x=0;x<32;x++){const angle=2*Math.PI*(3*x/32+2*y/32);re+=vals[y*32+x]*Math.cos(angle);im-=vals[y*32+x]*Math.sin(angle)}
assert.ok(Math.abs(re-coefficient.re)<1e-6);assert.ok(Math.abs(im-coefficient.im)<1e-6);
let conjugateRe=0,conjugateIm=0;for(let y=0;y<32;y++)for(let x=0;x<32;x++){const theta=2*Math.PI*(-3*x/32-2*y/32);conjugateRe+=vals[y*32+x]*Math.cos(theta);conjugateIm-=vals[y*32+x]*Math.sin(theta)}
assert.ok(Math.abs(conjugateRe-coefficient.re)<1e-6);assert.ok(Math.abs(conjugateIm+coefficient.im)<1e-6);
}
for(const profile of ['ideal','gaussian'])for(const pass of ['low','high','band']){
 filterKind=profile+'-'+pass;
 for(let u=0;u<256;u+=7)for(let v=0;v<256;v+=9){const h=mask1024(u,v);assert.ok(Number.isFinite(h)&&h>=0&&h<=1);assert.ok(Math.abs(h-mask1024((256-u)%256,(256-v)%256))<1e-12)}
 assert.equal(mask1024(0,0),pass==='low'?1:0);
}
assert.equal(frequencyAt(0),-16);assert.equal(frequencyAt(1),15);assert.equal(wrapFrequency(16),-16);
addPair(-16,3);const count=mix.pairs.length;addPair(-16,-3);assert.equal(mix.pairs.length,count);
mix.pairs=[];addPair(-16,-16);assert.equal(mix.selected.im,0);assert.ok(Math.abs(mixerValues().vals[0]-mix.re/1024)<1e-8);
filterKind='ideal-band';innerDiameter=12;outerDiameter=36;assert.equal(mask1024(5,0),0);assert.equal(mask1024(6,0),1);assert.equal(mask1024(18,0),1);assert.equal(mask1024(19,0),0);innerDiameter=22;outerDiameter=40;
filterKind='gaussian-band';assert.ok(mask1024(16,0)>mask1024(0,0));assert.ok(mask1024(16,0)>mask1024(120,0));
filterKind='ideal-band';assert.equal(mask1024(10,0),0);assert.equal(mask1024(15,0),1);assert.equal(mask1024(21,0),0);
`, context);
console.log('PASS: conjugate selection, axis convention, distinct colors, DFT coefficient normalization, all six filter masks and band-pass response.');
