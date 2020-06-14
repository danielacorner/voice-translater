import React, { useState } from "react";
import { useMount } from "./utils/hooks";
import styled from "styled-components/macro";
import { Button } from "@material-ui/core";

const AppStyles = styled.div`
  min-height: 100vh;
  overflow: hidden;
  background: hsl(42, 96%, 59%);

  .content {
    padding: 1em 1em 1em 2em;
    border-radius: 8px;
    margin: auto;
    margin-top: 2em;
    min-width: 360px;
    max-width: 900px;
    background: white;
    display: grid;
    justify-content: left;
    min-height: 80px;
    align-items: center;
    grid-gap: 1em;
    box-shadow: 10px 11px 3px #0000002b;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen,
      Ubuntu, Cantarell, "Open Sans", "Helvetica Neue", sans-serif;
    position: relative;
    .btnStartWrapper {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: grid;
      place-items: center;
    }
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
`;

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const SpeechToText = window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [speechArr, setSpeechArr] = useState([]);
  const [interimResult, setInterimResult] = useState("");
  const [started, setStarted] = useState(false);

  const [recognition] = useState(new SpeechToText());

  recognition.interimResults = true;

  useMount(() => {
    const handleResult = (e) => {
      console.log("🌟🚨: results", e.results);
      const isFinal = Array.from(e.results).some((result) => result.isFinal);

      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join("");

      console.log("🌟🚨:", transcript);
      console.log("🌟🚨: handleResult -> isFinal", isFinal);

      if (isFinal) {
        // commit it to the speech array
        setSpeechArr((prev) => {
          console.log("🌟🚨: handleResult -> prev", prev);

          return [...prev, transcript];
        });
        setInterimResult("");
      } else {
        // interim results
        setInterimResult(transcript);
      }
    };

    recognition.addEventListener("result", handleResult);
    recognition.addEventListener("end", recognition.start);

    console.log("🌟🚨: App -> recognition", recognition);

    return () => recognition.removeEventListener("result", handleResult);
  });

  const handleClick = () => {
    console.log("starting");
    recognition.start();
    setStarted(true);
  };
  return (
    <AppStyles className="App">
      <div className="content">
        <div className="svgBackground">
          <svg width="100%" height="100%">
            <defs>
              <pattern
                id="lines"
                x="0"
                y="0"
                width="1"
                height="2em"
                patternUnits="userSpaceOnUse"
              >
                <line
                  stroke="hsla(0,0%,0%,0.1)"
                  x1="0"
                  x2="100"
                  y1="0"
                  y2="0"
                  strokeWidth="2"
                />
              </pattern>
            </defs>

            <rect x="0" y="0" width="100%" height="100%" fill="url(#lines)" />
          </svg>
        </div>

        {speechArr.map((speech, idx) => (
          <p key={`${speech}-${idx}`}>{speech}</p>
        ))}
        <p>{interimResult}</p>
        {!started && (
          <div className="btnStartWrapper">
            <Button variant="outlined" onClick={handleClick}>
              start recording
            </Button>
          </div>
        )}
        <div className="leftMargin line1"></div>
        <div className="leftMargin line2"></div>
      </div>
    </AppStyles>
  );
}

export default App;
