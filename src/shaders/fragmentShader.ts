export default
`precision highp float;

uniform mat3 translation_matrix;
uniform float angleOffset;

varying vec2 fragCoord;

void main(){
    const float maximumIterations = 400.0;

    vec3 coordinate = translation_matrix * vec3(fragCoord, 1.0);

    float x0 = coordinate.x;
    float y0 = coordinate.y;
    float x = 0.0;
    float y = 0.0;
    
    float numIterations = 0.0;
    for(float iter = 0.0; iter < 1000.0; iter++){
        
        if(x*x + y*y > 4.0){
            break;
        }
        if(numIterations >= maximumIterations){
            break;
        }
        float xtemp = x*x -y*y + x0;
        y = 2.0 * x * y + y0;
        x = xtemp;
        numIterations++;
    }
    
    vec3 color;
    if(numIterations < maximumIterations){
        float log_zn = log(x*x + y*y) / 2.0;
        float nu = log(log_zn / log(2.0))/log(2.0);

        numIterations = numIterations + 1.0 - nu;

        float color1Ratio = numIterations / maximumIterations * 50.0 + angleOffset;
        vec3 color1 = vec3( sin(color1Ratio) *0.5 + 0.5, sin(color1Ratio + 2.09437866667 ) *0.5 + 0.5, sin(color1Ratio- 2.09437866667) *0.5 + 0.5);

        float color2Ratio = (numIterations * 1.0)/ maximumIterations * 50.0 + angleOffset;
        vec3 color2 = vec3(sin(color2Ratio) *0.5 + 0.5, sin(color2Ratio + 2.09437866667 ) *0.5 + 0.5, sin(color2Ratio- 2.09437866667) *0.5 + 0.5);

        float ratio = fract(numIterations);
        color = ratio * color1 + (1.0-ratio) * color2; 

        

    }else{
        color = vec3(0.0,0.0,0.0);
    }
    gl_FragColor = vec4(color, 1.0);
}`