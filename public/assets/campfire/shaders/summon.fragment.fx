uniform sampler2D textSampler;
uniform float elapsedTime;
varying vec2 vUV;

float wavy = 3.0;
float speed = 1.0;
uniform float comp;

void main() {
    vec2 uv = vUV;
    uv.x += 0.05 * sin((elapsedTime * speed) + uv.y * wavy);
    vec4 color = texture(textSampler, uv);
    color *= vec4(1.0, 1.0, 1.0, (1.25 * comp - .25));
    gl_FragColor = color;
}
