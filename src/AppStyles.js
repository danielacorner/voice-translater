import styled from "styled-components/macro";

export const AppStyles = styled.div`
  min-height: 100vh;
  overflow: hidden;
  background: hsl(42, 96%, 59%);
  .controls,
  .content {
    min-width: 320px;
    width: calc(100vw - 2em);
    max-width: 900px;
    background: white;
    border-radius: 8px;
    margin: auto;
    display: grid;
    box-shadow: 10px 11px 3px #0000002b;
  }
  .controls {
    padding: 1em;
    grid-template-columns: repeat(auto-fit, minmax(64px, 1fr));
    align-items: center;
    justify-content: center;
    grid-gap: 1em 2em;
    margin-top: 2em;
  }
  .svgBackground {
    pointer-events: none;
  }
  .content {
    padding: 1em 1em 1em 5em;
    margin-top: 2em;
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
`;
