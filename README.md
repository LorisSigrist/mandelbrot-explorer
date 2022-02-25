# Mandelbrot Explorer

A WebGL based Mandelbrot Explorer, wrapped in a Webcomponent. 

## Usage
### Install
Via NPM
```bash
    npm i @dijkstra/mandelbrot-explorer
```
Then import the WebComponent script into your template to make it available.

### Attributes
Tag with all Attributes
```html
    <mandelbrot-explorer 
        width=300  height=150 
        controls frozen
        zoom=1 focalX=0 focalY=0
        iterations=500
    >
        <!--Fallback-->
    </mandelbrot-explorer>
```

- width : Self explanatory, Defaults to 300
- height : Self explanatory, Defualts to 150
- controls : Boolean, should countrol overlay be shown, defaults to false
- frozen : Boolean, disables all interactivity, defaults to false.

- zoom : Number, Zoom level of the Exporer, defaults to 1
- focalX & focalY : Number, Specify the Viewport Center in the imaginary Plane. defautls to 0,0;

- iterations: Number, how many times should the mandelbrot set be iterated (at most). Defaults to 500
