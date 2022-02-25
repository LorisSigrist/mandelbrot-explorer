import { html, css, LitElement } from 'lit'
import { customElement, property, query, state } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'
import { classMap } from 'lit/directives/class-map.js'

import vertexShaderCode from './shaders/vertexShader'
import fragmentShaderCode from './shaders/fragmentShader'

/**
 * Mandelbrot Explorer
 *
 * @slot - Specify Fallback if WebGL or CustomElement isn't supported
 */
@customElement('mandelbrot-explorer')
export class MandelbrotExplorer extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
      transform: scale(1);
    }

    :host(:not([frozen])) canvas {
      cursor: grab;
      touch-action: none;
    }

    :host(:not([frozen])) canvas.interacting {
      cursor: grabbing;
    }

    .controls {
      position: absolute;
      bottom: 1em;
      left: 1em;

      background-color: #fefefe;
      box-shadow: 1px 1px 10px rgba(0, 0, 0, 0.2);
      border-radius: 0.3em;

      overflow: hidden;
    }
    .controls button {
      display: block;
      border: none;
      background-color: none;

      width: 2em;
      height: 2em;

      display: flex;
      justify-content: center;
      align-items: center;

      color: #333;
    }

    .controls button:disabled {
      color: #aaa;
    }
  `
  //Size
  @property({ type: Number })
  width = 300

  @property({ type: Number })
  height = 150

  //Controls
  @property({ type: Boolean })
  controls = false

  @property({ type: Boolean })
  frozen = false

  //State
  @property({ type: Number })
  focalX = 0

  @property({ type: Number })
  focalY = 0

  @property({ type: Number })
  zoom = 1

  @property({ type: Number })
  iterations = 500

  @query('canvas', true)
  canvas!: HTMLCanvasElement

  private gl!: WebGLRenderingContext

  private frame!: number

  private program!: WebGLProgram

  protected firstUpdated (): void {
    this._initializeWebGL()
    this.frame = requestAnimationFrame(() => {
      this._rerender()
    })
  }

  private _initializeWebGL (): void {
    const gl = this.canvas.getContext('webgl')
    if (!gl) {
      console.error('Mandelbrot Explorer: WebGl could not be initialized')
      return
    }

    //Initialize and Bind Vertex Buffer for Quad
    const vertexBuffer = gl.createBuffer()
    const indexBuffer = gl.createBuffer()
    const vertices = [-1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0]
    const indecies = [3, 2, 1, 3, 1, 0]
    gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer)
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW)
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer)
    gl.bufferData(
      gl.ELEMENT_ARRAY_BUFFER,
      new Uint16Array(indecies),
      gl.STATIC_DRAW
    )

    const vertexShader = gl.createShader(gl.VERTEX_SHADER)!
    gl.shaderSource(vertexShader, vertexShaderCode)
    gl.compileShader(vertexShader)
    if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
      console.error(
        'Could not compile vertex shader',
        gl.getShaderInfoLog(vertexShader)
      )
      gl.deleteShader(vertexShader)
    }

    const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER)!
    gl.shaderSource(fragmentShader, fragmentShaderCode)
    gl.compileShader(fragmentShader)
    if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
      console.error(
        'Could not compile fragment shader',
        gl.getShaderInfoLog(fragmentShader)
      )
      gl.deleteShader(fragmentShader)
    }

    this.program = gl.createProgram()!
    gl.attachShader(this.program, vertexShader)
    gl.attachShader(this.program, fragmentShader)
    gl.linkProgram(this.program)
    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      console.error('Could not link program')
      gl.deleteProgram(this.program)
    }
    gl.useProgram(this.program)

    gl.deleteShader(fragmentShader)
    gl.deleteShader(vertexShader)

    this.gl = gl
  }

  private _rerender (): void {
    if (!this.gl) {
      console.error('Mandelbrot Explorer: Could not Rerender')
    }

    //Map vertex data to vertex shader attributes
    const positionAttributeLocation = this.gl.getAttribLocation(
      this.program,
      'position'
    )
    this.gl.vertexAttribPointer(
      positionAttributeLocation,
      2,
      this.gl.FLOAT,
      false,
      0,
      0
    )
    this.gl.enableVertexAttribArray(positionAttributeLocation)

    //Set uniforms
    const translationMatrixPosition = this.gl.getUniformLocation(
      this.program,
      'translation_matrix'
    )
    this.gl.uniformMatrix3fv(translationMatrixPosition, false, [
      this.width / this.height / this.zoom,
      0,
      0,
      0,
      1 / this.zoom,
      0,
      this.focalX,
      this.focalY,
      1
    ])

    const angleOffsetPosition = this.gl.getUniformLocation(
      this.program,
      'angleOffset'
    )
    this.gl.uniform1f(angleOffsetPosition, 0)

    const iterationPosition = this.gl.getUniformLocation(
      this.program,
      'maxIterations'
    )
    this.gl.uniform1f(iterationPosition, this.iterations)

    this.gl.clearColor(0, 0, 1, 1)
    this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT)
    this.gl.viewport(0, 0, this.width*window.devicePixelRatio, this.height*window.devicePixelRatio)
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0)
  }

  protected updated (): void {
    if (!this.hasUpdated) return

    this.frame = requestAnimationFrame(() => {
      this._rerender()
    })
  }

  //Controls
  _increaseZoom () {
    if (this.frozen) return
    this.zoom *= 1.2
  }

  _decreaseZoom () {
    if (this.frozen) return
    this.zoom /= 1.2
  }

  @state()
  interacting = false

  pointers: PointerEvent[] = []

  _pointerStart (e: PointerEvent) {
    e.preventDefault()
    if (this.frozen) return
    this.interacting = true
    this.pointers.push(e)

    console.log('Pointer Down', e)
  }
  _pointerEnd (e: PointerEvent) {
    e.preventDefault()

    const prevLen = this.pointers.length

    //remove Pointer from Tracked Pointers
    this.pointers = this.pointers.filter(pt => pt.pointerId !== e.pointerId)

    if (prevLen !== this.pointers.length) {
      console.log('Pointer End')
    }

    if (this.pointers.length < 1) {
      this.interacting = false
    }
  }
  _pointerMove (e: PointerEvent) {
    e.preventDefault()
    if (this.frozen) return

    for (let i = 0; i < this.pointers.length; i++) {
      if (e.pointerId == this.pointers[i].pointerId) {

        this.focalX -= 2*(e.clientX - this.pointers[i].clientX)/this.zoom / this.width * window.devicePixelRatio;
        this.focalY += 2*(e.clientY - this.pointers[i].clientY)/this.zoom /this.height;
        this.pointers[i] = e
        break
      }
    }

    console.log('Pointer Move')
  }

  protected render () {
    return html`
      <canvas
        width=${this.width*window.devicePixelRatio}
        height=${this.height*window.devicePixelRatio}
        class=${classMap({ interacting: this.interacting })}
        @pointerdown=${this._pointerStart}
        @pointermove=${this._pointerMove}
        @pointerup=${this._pointerEnd}
        @pointercancel=${this._pointerEnd}
        @pointerout=${this._pointerEnd}
        @pointerleave=${this._pointerEnd}

        style="width: ${this.width}px; height:${this.height}px"
      >
        <slot></slot>
      </canvas>
      ${when(
        this.controls,
        () => html`
          <div class="controls">
            <button @click=${this._increaseZoom} ?disabled=${this.frozen}>
              +
            </button>
            <button @click=${this._decreaseZoom} ?disabled=${this.frozen}>
              -
            </button>
          </div>
        `,
        () => html``
      )}
    `
  }

  //Disconnect
  disconnectedCallback (): void {
    cancelAnimationFrame(this.frame)
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mandelbrot-explorer': MandelbrotExplorer
  }
}
