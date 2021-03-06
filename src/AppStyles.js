import styled from "styled-components/macro";

const PAPER_MARGINTOP_EMS = 2;
const CONTROLS_HEIGHT_EMS = 8;

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
    height: ${CONTROLS_HEIGHT_EMS}em;
    padding: 1em;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    align-content: space-between;
    justify-content: center;
    grid-gap: 0.5em 0.5em;
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
      padding: 1.4em 1em 1em 5em;
      max-height: calc(
        100vh - ${3 * PAPER_MARGINTOP_EMS + CONTROLS_HEIGHT_EMS}em
      );
      margin-top: ${PAPER_MARGINTOP_EMS}em;
      min-height: 80px;
      align-items: start;
      justify-items: left;
      grid-gap: 11px;
      p:not(.lastParagraph) {
        height: min-content;
      }

      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
        Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
      position: relative;
      .svgBackground {
        position: absolute;
        top: 0.5em;
        left: 0;
        bottom: ${(props) => -props.overflowPx}px;
        right: 0;
      }
      .leftMargin {
        position: absolute;
        left: 4em;
        height: 100%;
        width: 2px;
        height: calc(100% + ${(props) => props.overflowPx}px);
        background: hsla(0, 100%, 50%, 0.1);
        &.line2 {
          left: 4.25em;
        }
      }
    }
    .translatedTextWrapper {
      position: relative;
      /* height: 56px; */
      display: flex;
      flex-direction: column;
      align-items: start;
      font-size: 1.1em;
      &.last {
        padding-bottom: 2em;
      }
      .originalText {
        transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
      }
      .translation {
        transition: opacity 0.3s cubic-bezier(0.25, 0.46, 0.45, 0.94),
          transform 0.6s cubic-bezier(0.25, 0.46, 0.45, 0.94);
        opacity: 0;
        transform: translateY(-8px);
      }
      &.withTranslation {
        .originalText {
          color: hsla(0, 0%, 30%, 1);
          font-size: 0.8em;
          letter-spacing: 0.1em;
        }
        .translation {
          opacity: 1;
          transform: translateY(0px);
        }
      }
    }
  }
  .utterance {
    position: relative;
    .btnSpeak {
      position: absolute;
      left: -68px;
      height: 48px;
      top: calc(50% - 24px);
      color: rgba(0, 0, 0, 0.3);
    }
  }
  .btnStartWrapper {
    grid-column: 1 / -1;
    button {
      width: 100%;
    }
  }
  .lastParagraph {
    height: 10vh;
    width: 100%;
  }
`;
