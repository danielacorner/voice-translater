import styled from "styled-components/macro";

const PAPER_MARGINTOP_EMS = 2;
const CONTROLS_HEIGHT_EMS = 5;
const BREAKPOINT_TWOROWS = 552;

export const AppStyles = styled.div`
  min-height: 100vh;
  overflow: hidden;
  background: hsl(42, 96%, 59%);
  .shadow {
    box-shadow: 10px 11px 3px #0000002b;
  }
  .wide {
    min-width: 320px;
    width: calc(100vw - 2em);
    max-width: 900px;
  }
  .themed {
    background: white;
    border-radius: 8px;
    margin: auto;
  }
  .controls,
  .content {
    display: grid;
  }
  .controls {
    height: ${CONTROLS_HEIGHT_EMS * 2}em;
    @media (min-width: ${BREAKPOINT_TWOROWS}px) {
      height: ${CONTROLS_HEIGHT_EMS}em;
    }
    padding: 1em;
    grid-template-columns: repeat(auto-fit, minmax(72px, 1fr));
    align-items: center;
    justify-content: center;
    grid-gap: 1em 2em;
    margin-top: 2em;
    .swapBtnWrapper {
      display: grid;
      place-items: center;
    }
  }
  .svgBackground {
    pointer-events: none;
  }
  .apiKeyPrompt {
    padding: 1em;
    width: fit-content;
    display: grid;
    grid-auto-flow: column;
    grid-gap: 0.5em;
    margin: ${PAPER_MARGINTOP_EMS}em auto 0;
  }
  .swapApiKey {
    position: absolute;
    top: 0;
    right: 0;
    transform: scale(0.65);
    transform-origin: top right;
    padding: 6px 1.5em;
    width: fit-content;
    max-width: 900px;
  }
  .contentWrapper {
    position: relative;
    .btnReset {
      position: absolute;
      top: -24px;
      right: -4px;
      border: 1px solid hsla(0, 0%, 75%, 1);
    }
    .content {
      overflow: auto;
      padding: 1em 1em 1em 5em;
      p {
        padding: 1em 1em 1em 0;
      }
      max-height: calc(
        100vh - ${3 * PAPER_MARGINTOP_EMS + 2 * CONTROLS_HEIGHT_EMS}em
      );
      @media (min-width: ${BREAKPOINT_TWOROWS}px) {
        max-height: calc(
          100vh - ${3 * PAPER_MARGINTOP_EMS + CONTROLS_HEIGHT_EMS}em
        );
      }
      margin-top: ${PAPER_MARGINTOP_EMS}em;
      min-height: 80px;
      align-items: start;
      justify-content: left;
      grid-gap: 0.7em;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      position: relative;
      .svgBackground {
        position: absolute;
        top: 0.5em;
        left: 0;
        bottom: 0;
        right: 0;
      }
      .leftMargin {
        position: absolute;
        left: 4em;
        height: 100%;
        width: 2px;
        height: 100%;
        background: hsla(0, 0%, 0%, 0.1);
        &.line2 {
          left: 4.5em;
        }
      }
    }
    .translatedTextWrapper {
      position: relative;
      .originalText {
        white-space: nowrap;
        position: absolute;
        top: -1.1em;
        color: hsla(0, 0%, 30%, 1);
        font-size: 0.8em;
        letter-spacing: 0.1em;
      }
    }
  }
`;
