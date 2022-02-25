import { html, css, LitElement } from 'lit'
import { customElement, property, query } from 'lit/decorators.js'
import { when } from 'lit/directives/when.js'

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
    .controls {
      position: absolute;
      bottom: 1em;
      left: 1em;

      background-color: #fefefe;
      border: 1px solid gray;
      border-radius: 0.3em;
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
    this.gl.viewport(0, 0, this.width, this.height)
    this.gl.drawElements(this.gl.TRIANGLES, 6, this.gl.UNSIGNED_SHORT, 0)
  }

  protected updated (): void {
    if (!this.hasUpdated) return

    this.frame = requestAnimationFrame(() => {
      this._rerender()
    })
  }

  disconnectedCallback (): void {
    cancelAnimationFrame(this.frame)
  }

  protected render () {
    return html`
      <canvas width=${this.width} height=${this.height}>
        <slot></slot>
      </canvas>
      ${when(
        this.controls,
        () => html`
          <div class="controls">
            <span>Controls</span>
          </div>
        `,
        () => html``
      )}
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mandelbrot-explorer': MandelbrotExplorer
  }
}
