import{Q as t,q as c,g as b,U as o,s as a,v as l,m as f}from"./runtime.CIU5QNyZ.js";import{s as _}from"./entry.B_btq6MM.js";function g(s,e,u){if(s==null)return e(void 0),t;const n=s.subscribe(e,u);return n.unsubscribe?()=>n.unsubscribe():n}function y(s,e,u){let n=u[e];const r=n===void 0;r&&(n={store:null,last_value:null,value:f(o),unsubscribe:t},u[e]=n),(r||n.store!==s)&&(n.unsubscribe(),n.store=s??null,n.unsubscribe=d(s,n.value));const i=b(n.value);return i===o?n.last_value:i}function d(s,e){return s==null?(a(e,void 0),t):g(s,u=>a(e,u))}function N(s){p(()=>{let e;for(e in s)s[e].unsubscribe()})}function U(s,e,u){return s.set(u),e}function p(s){c(()=>()=>l(s))}const v=()=>{const s=_;return{page:{subscribe:s.page.subscribe},navigating:{subscribe:s.navigating.subscribe},updated:s.updated}},k={subscribe(s){return v().page.subscribe(s)}};export{U as m,k as p,y as s,N as u};
