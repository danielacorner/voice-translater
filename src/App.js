import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
} from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import ResetIcon from "@material-ui/icons/Replay";
import TranslateIcon from "@material-ui/icons/Translate";
import PlayIcon from "@material-ui/icons/PlayArrow";
import { AppStyles } from "./AppStyles";
import { getTranslation } from "./utils/translate";

const ENGLISH = "en-US";
const KOREAN = "ko-KR";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const SpeechToText = window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [speechArr, setSpeechArr] = useState([]);
  const [interimResult, setInterimResult] = useState("");
  const [started, setStarted] = useState(false);
  const [translationTarget, setTranslationTarget] = useState("");
  const [lang, setLang] = useState(ENGLISH);
  const [isPaused, setIsPaused] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const recogStarted = useRef(false);

  const [recognition] = useState(new SpeechToText());

  recognition.interimResults = true;
  console.log("🌟🚨: App -> process.env", process.env);
  useEffect(() => {
    const handleResult = (e) => {
      // get the transcript
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join(""); // sometimes we get multiple items

      // capitalize the first letter
      const transcriptCapitalized =
        transcript[0].toUpperCase() + transcript.slice(1);

      const isFinal = Array.from(e.results).some((result) => result.isFinal);
      if (isPaused) {
        return;
      } else if (isFinal) {
        // commit it to the speech array
        if (translationTarget) {
          const apiKey = process.env.REACT_APP_PRIVATE_KEY; // https://github.com/google/google-api-javascript-client
          getTranslation(
            { key: transcript, value: transcript },
            translationTarget,
            apiKey
          ).then((result) => {
            // TODO: prefer to setSpeechArr first, then find and replace when the result comes back?
            setSpeechArr((prev) => [...prev, result.value]);
            setInterimResult("");
          });
        } else {
          setSpeechArr((prev) => [...prev, transcriptCapitalized]);
          setInterimResult("");
        }
      } else {
        // show the interim results
        setInterimResult(transcriptCapitalized);
      }
    };

    recognition.addEventListener("result", handleResult);

    // when the event ends, start it again right away
    recognition.addEventListener("end", recognition.start);

    return () => {
      // cleanup
      recognition.removeEventListener("result", handleResult);
      recognition.removeEventListener("end", recognition.start);
    };
  }, [recognition, isPaused, translationTarget]);

  const handleClick = () => {
    if (!recogStarted.current) {
      // only start the first time
      recognition.start();
    }
    recogStarted.current = true;
    setStarted(true);
    setIsPaused(false);
  };
  const handleReset = () => {
    setStarted(false);
    setSpeechArr([]);
  };
  const toggleTranslation = () => {
    setIsTranslating((p) => !p);
    // https://translation.googleapis.com/language/translate/v2
    // https://cloud.google.com/translate/docs/basic/setup-basic
  };
  const handleChangeTranslationTarget = (e) => {
    setTranslationTarget(e.target.value);
  };
  const handleChangeLanguages = (e) => {
    const newLang = e.target.value;
    recognition.lang = newLang;
    setLang(newLang);
  };
  const handlePlayPause = () => {
    setIsPaused(!isPaused);
  };

  return (
    <AppStyles className="App">
      <div className="controls">
        {started ? (
          <Button
            variant="outlined"
            onClick={handlePlayPause}
            endIcon={isPaused ? <PlayIcon /> : <MicOffIcon />}
          >
            {isPaused ? "Resume" : "Pause"}
          </Button>
        ) : (
          <Button
            variant="outlined"
            onClick={handleClick}
            endIcon={<MicIcon />}
          >
            Start
          </Button>
        )}
        <Button
          variant="outlined"
          onClick={handleReset}
          endIcon={<ResetIcon />}
          disabled={!started}
        >
          Reset
        </Button>
        <Select value={lang} onChange={handleChangeLanguages}>
          <MenuItem value={ENGLISH}>English</MenuItem>
          <MenuItem value={KOREAN}>한국어</MenuItem>
        </Select>
        <Button
          variant="outlined"
          onClick={toggleTranslation}
          endIcon={<TranslateIcon />}
          disabled={!started || !translationTarget}
        >
          {isTranslating ? "Stop" : "Trans"}
        </Button>

        <FormControl>
          <InputLabel
            shrink
            id="translation-target"
            style={{ whiteSpace: "nowrap" }}
          >
            Translate to...
          </InputLabel>
          <Select
            value={translationTarget}
            labelId="translation-target"
            onChange={handleChangeTranslationTarget}
            displayEmpty={true}
          >
            <MenuItem value={""} disabled={true}>
              -- select --
            </MenuItem>
            <MenuItem value={ENGLISH}>English</MenuItem>
            <MenuItem value={KOREAN}>한국어</MenuItem>
          </Select>
        </FormControl>
      </div>
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
        <div className="leftMargin line1"></div>
        <div className="leftMargin line2"></div>
      </div>
    </AppStyles>
  );
}

export default App;
