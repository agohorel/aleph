// modified version of: 
// Title: shader.vert
// Author: https://github.com/m90
// Date: 5.11.18
// https://github.com/processing/p5.js/pull/2881/commits/22b57e21d3196c8d28ea7d6cce29fa6cd18b3be2

precision highp float; varying vec2 vPos;
attribute vec3 aPosition;
void main() { vPos = (gl_Position = vec4(aPosition,0.5)).xy; }