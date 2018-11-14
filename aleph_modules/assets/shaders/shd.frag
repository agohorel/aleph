// modified version of: 
// Title: shader.frag
// Author: https://github.com/m90
// Date: 5.11.18
// https://github.com/processing/p5.js/pull/2881/commits/22b57e21d3196c8d28ea7d6cce29fa6cd18b3be2

precision highp float; varying vec2 vPos;
uniform vec2 p;
uniform float r;
const int I = 500;
void main() {
  vec2 c = p + vPos * r, z = c;
  float n = 0.0;
  for (int i = I; i > 0; i --) {
    if(z.x*z.x+z.y*z.y > 4.0) {
      n = float(i)/float(I);
      break;
    }
    z = vec2(z.x*z.x-z.y*z.y, 2.0*z.x*z.y) + c;
  }
  gl_FragColor = vec4(0.5-cos(n*15.0)/2.0,0.5-cos(n*15.0)/2.0,0.5-cos(n*15.0)/2.0,1.0);
}