import { html, css, LitElement } from 'lit'
import { customElement, property } from 'lit/decorators.js'

/**
 * Mandelbrot Explorer
 *
 * @slot - This element has a slot
 * @csspart button - The button
 */
@customElement('mandelbrot-explorer')
export class MandelbrotExplorer extends LitElement {
  static styles = css`
    :host {
      display: inline-block;
    }
  `
  @property({ type: Number })
  width = 300

  @property({ type: Number })
  height = 150

  render () {
    return html`
      <canvas width=${this.width} height=${this.height}>
        <slot></slot>
      </canvas>
    `
  }
}

declare global {
  interface HTMLElementTagNameMap {
    'mandelbrot-explorer': MandelbrotExplorer
  }
}
