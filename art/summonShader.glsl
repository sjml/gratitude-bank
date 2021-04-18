#iChannel0 "./text_test.png"

float wavy = 3.0;
float speed = 1.0;

void main() {
    vec2 uv = (gl_FragCoord.xy / iResolution.xy);
    uv.x += 0.05 * sin((iTime * speed) + uv.y * wavy);
    vec4 color = texture(iChannel0, uv);
    gl_FragColor = color;
}
