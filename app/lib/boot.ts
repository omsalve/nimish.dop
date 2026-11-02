import { PREVIEW_TRANSFORM, uploadBase, uploadPath } from "./cloudinary";
import { photographs } from "./collection";

/**
 * Runs while the HTML parses, before hydration: flags the splash and starts
 * downloading every frame's preview so the 3-second budget starts at byte one.
 * frames.ts adopts the same store on the client.
 */
export function bootScript() {
  const base = uploadBase(photographs[0].src) + PREVIEW_TRANSFORM;
  const paths = JSON.stringify(photographs.map((photo) => uploadPath(photo.src)));
  return `(function(){var d=document.documentElement,c=d.classList,rm=false,seen=false,save=false;c.add("js");
try{rm=matchMedia("(prefers-reduced-motion: reduce)").matches}catch(e){}
try{seen=sessionStorage.getItem("nimish:splash")==="1";sessionStorage.setItem("nimish:splash","1")}catch(e){}
try{save=!!(navigator.connection&&navigator.connection.saveData)}catch(e){}
c.add("splash-on");if(seen||save)c.add("splash-quick");if(rm)c.add("splash-calm");
// Hard cap, independent of hydration: whatever happens, the splash is gone before 3 s.
setTimeout(function(){if(!c.contains("splash-on"))return;c.add("splash-done","splash-forced");dispatchEvent(new Event("nimish:reveal"));setTimeout(function(){c.remove("splash-on")},260)},Math.max(0,2560-performance.now()));
var b=${JSON.stringify(base)},p=${paths},s={urls:[],images:[],state:[],loaded:0,listeners:[],saveData:save};
window.__nimishFrames=s;
function settle(i,ok){if(s.state[i])return;s.state[i]=ok?1:2;s.loaded++;for(var k=0;k<s.listeners.length;k++)s.listeners[k](i,ok)}
for(var i=0;i<p.length;i++)(function(i){var u=b+p[i],im=new Image();s.urls[i]=u;s.images[i]=im;s.state[i]=0;im.crossOrigin="anonymous";im.decoding="async";im.onload=function(){settle(i,true)};im.onerror=function(){settle(i,false)};if(!save)im.src=u})(i)})();`;
}
