# Mandelbrot Explorer

![Mandelbrot Explorer image](/preview.png)

A WebGL based Mandelbrot Explorer, wrapped in a Webcomponent. Documentation is below. Check out a demo [here](https://www.sigrst.dev/apps/mandelbrot-explorer).

## Features
 - [x] Renders the mandelbrot set with an arbitrary ammount of iterations
 - [x] Mouse controls for panning
 - [x] Map controls for zooming
 - [x] Touch controls for panning & zooming
 - [x] Respect Device Pixel Density
 - [ ] Color customization
 - [ ] Emmit Events in response to internal state change
 - [ ] Touchpad Controls

:warning: **Disclaimer:** Because this is a WebGl Based implementation, the precision is limited. After about 100'000x Zoom the 32-bit-float precision limit is reached and the image falls appart.



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


All the Attributes set the *initial* values of these properties. Unless frozen is specified, user-interaction can modify this internal state.

- width : Number, Defaults to 300
- height : Number, Defualts to 150
- controls : Boolean, should countrol overlay be shown, defaults to false
- frozen : Boolean, disables all interactivity, defaults to false.

- zoom : Number, Zoom level of the Exporer, defaults to 1
- focalX & focalY : Number, Specify the Viewport Center in the imaginary Plane. defautls to 0,0;

- iterations: Number, how many times should the mandelbrot set be iterated (at most). Defaults to 500

## Performance
The Explorer fully rerenders, when any attributes are changed, or whenever the user interacts with it. 

On mobile Devices, user interactivity at a high iteration count can result in low framerates on lower end devices. 

On Desktop it is basically always at 60+ fps.

If you just want a still image, specify the frozen attribute to turn off all interactivity, causing no rerenders (unless attributes change). 


If you want to keep interactivty, but have performance issues, try these steps:

    1. Reduce number of iterations
    2. Shrink Explorer Area