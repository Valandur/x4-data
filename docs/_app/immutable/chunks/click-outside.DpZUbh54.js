import{_ as E,N as x,Z as i,$ as w,q as C}from"./runtime.CgAJfRN4.js";import{a as L}from"./attributes.CbJHqulJ.js";import{g as k,i as q}from"./index-client.CtYz58gO.js";import{i as g}from"./disclose-version.V-uf_1lL.js";function N(e,c,r){E(()=>{var a=x(()=>c(e,r==null?void 0:r())||{});if(a!=null&&a.destroy)return()=>a.destroy()})}function l(e,c,r,a=r){e.addEventListener(c,r);const n=e.__on_r;n?e.__on_r=()=>{n(),a()}:e.__on_r=a,L()}function P(e,c,r){l(e,"input",()=>{r(h(e)?b(e.value):e.value)}),i(()=>{var a=c();if(g&&e.defaultValue!==e.value){r(e.value);return}h(e)&&a===b(e.value)||e.type==="date"&&!a&&!e.value||(e.value=a??"")})}function S(e,c,r,a,n){var s=r.getAttribute("type")==="checkbox",o=e;let v=!1;if(c!==null)for(var _ of c){var u=o;o=u[_],o===void 0&&(o=u[_]=[])}o.push(r),l(r,"change",()=>{var f=r.__value;s&&(f=m(o,f,r.checked)),n(f)},()=>n(s?[]:null)),i(()=>{var f=a();if(g&&r.defaultChecked!==r.checked){v=!0;return}s?(f=f||[],r.checked=k(f).includes(k(r.__value))):r.checked=q(r.__value,f)}),w(()=>{var f=o.indexOf(r);f!==-1&&o.splice(f,1)}),C(()=>{if(o.sort((d,y)=>d.compareDocumentPosition(y)===4?-1:1),v){var f;if(s)f=m(o,f,r.checked);else{var t=o.find(d=>d.checked);f=t==null?void 0:t.__value}n(f)}})}function V(e,c,r){l(e,"change",()=>{var a=e.checked;r(a)}),c()==null&&r(!1),i(()=>{var a=c();e.checked=!!a})}function m(e,c,r){for(var a=new Set,n=0;n<e.length;n+=1)e[n].checked&&a.add(e[n].__value);return r||a.delete(c),Array.from(a)}function h(e){var c=e.type;return c==="number"||c==="range"}function b(e){return e===""?null:+e}function Z(e){const c=r=>{r.target&&!e.contains(r.target)&&e.dispatchEvent(new CustomEvent("outclick"))};return document.addEventListener("click",c,!0),{destroy(){document.removeEventListener("click",c,!0)}}}export{N as a,V as b,Z as c,P as d,S as e};
