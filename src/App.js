import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  TextField,
  IconButton,
} from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import ResetIcon from "@material-ui/icons/Replay";
import TranslateIcon from "@material-ui/icons/Translate";
import DoneIcon from "@material-ui/icons/Done";
import PlayIcon from "@material-ui/icons/PlayArrow";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import { AppStyles } from "./AppStyles";
import getGoogleTranslate from "google-translate";

// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes
const ENGLISH = "en";
const KOREAN = "ko";

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const SpeechToText = window.SpeechRecognition || window.webkitSpeechRecognition;

function App() {
  const [apiKey, setApiKey] = useState(
    window.localStorage.getItem("api_key") || null
  ); // https://github.com/google/google-api-javascript-client
  const googleTranslate = apiKey && getGoogleTranslate(apiKey);
  const [apiErr, setApiErr] = useState(null);
  const [speechArr, setSpeechArr] = useState([
    // "hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi ",
    // "hi",
    // "hi",
    // "hi",
    // "hi",
    // TODO: fix overlap
    // "hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hey heyheyheyheyheyheyheyheyheyheyhey",
    // "hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi hi ",
    // "hi",
    // "hi",
    // "hi",
    // "hi",
    // "hi",
    // "hi",
    // "hi",
    // { translation: "heyhiho", originalText: "hieou" },
    // "hi",
    // "hi",
    // "hi",
    // "hi",
    // "hi",
  ]);
  const [interimResult, setInterimResult] = useState("");
  const [started, setStarted] = useState(false);
  const [targetLang, setTargetLang] = useState(KOREAN);
  const [lang, setLang] = useState(ENGLISH);
  const [isPaused, setIsPaused] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const recogStarted = useRef(false);

  const [recognition] = useState(new SpeechToText());

  recognition.interimResults = true;
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
        const shouldTranslate =
          isTranslating && targetLang && targetLang !== lang && googleTranslate;
        if (shouldTranslate) {
          // if translating,
          googleTranslate.translate(
            transcript,
            lang,
            targetLang,
            (err, result) => {
              if (err) {
                setApiErr(err);
              } else {
                setSpeechArr((prev) => [
                  ...prev,
                  {
                    translation: result.translatedText,
                    originalText: result.originalText,
                  },
                ]);
                // remove the interim result
                setInterimResult("");
              }
            }
          );
        } else {
          setSpeechArr((prev) => [...prev, transcriptCapitalized]);
          // remove the interim result
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
  }, [
    recognition,
    isPaused,
    targetLang,
    lang,
    apiKey,
    googleTranslate,
    isTranslating,
  ]);

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
  const handleChangetargetLang = (e) => {
    setTargetLang(e.target.value);
  };
  const handleChangeLanguages = (e) => {
    const newLang = e.target.value;
    recognition.lang = newLang;
    setLang(newLang);
  };
  const handlePlayPause = () => {
    setIsPaused(!isPaused);
  };
  const [newApiKey, setNewApiKey] = useState(null);
  const handleChangeApiKey = (e) => {
    setNewApiKey(e.target.value);
  };
  const handleSubmitApiKey = (e) => {
    e.preventDefault();
    window.localStorage.setItem("api_key", newApiKey);
    setApiKey(newApiKey);
    setApiErr(null);
  };
  const handleRemoveApiKey = () => {
    window.localStorage.removeItem("api_key");
    setApiKey(null);
  };
  const handleSwapLanguages = () => {
    setLang(targetLang);
    setTargetLang(lang);
  };

  // whenever the speechArr changes, scroll to the bottom
  // (unless the user has scrolled up)
  const paperRef = useRef();
  const interimRef = useRef();
  const [overflowPx, setOverflowPx] = useState(0);

  useEffect(() => {
    const { scrollHeight, offsetHeight } = paperRef.current;
    setOverflowPx(scrollHeight - offsetHeight);
    // when scrolled all the way to the bottom,
    // scrollHeight = scrollTop + offsetHeight
    // const userHasScrolledUp = scrollHeight - (scrollTop + offsetHeight) < 100; // doesn't have to be 0
    // if (!userHasScrolledUp) {
    // auto-scroll to the bottom
    interimRef.current.scrollIntoView({
      behavior: "smooth",
      block: "end",
      inline: "start",
    });
    // }
  }, [speechArr, interimResult]);

  const isTranslateDisabled = Boolean(!apiKey || apiErr);
  return (
    <AppStyles className="App" overflowPx={overflowPx}>
      {!isTranslateDisabled && (
        <div className="swapApiKey">
          <Button size="small" variant="outlined" onClick={handleRemoveApiKey}>
            Swap API key
          </Button>
        </div>
      )}
      {isTranslateDisabled && (
        <form
          className="apiKeyPrompt shadow wide themed"
          onSubmit={handleSubmitApiKey}
        >
          <TextField
            type="text"
            variant="outlined"
            onChange={handleChangeApiKey}
            label={"Google Translate API key"}
            error={Boolean(apiErr)}
            helperText={apiErr ? JSON.parse(apiErr.body).error.message : null}
          />
          <IconButton disabled={!newApiKey}>
            <DoneIcon />
          </IconButton>
        </form>
      )}
      <div className="controls shadow wide themed">
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
        <FormControl>
          <InputLabel
            shrink
            id="translation-target"
            style={{ whiteSpace: "nowrap" }}
          >
            I'm speaking...
          </InputLabel>
          <Select value={lang} onChange={handleChangeLanguages}>
            <MenuItem value={ENGLISH}>English</MenuItem>
            <MenuItem value={KOREAN}>한국어</MenuItem>
          </Select>
        </FormControl>

        <div className="swapBtnWrapper">
          <IconButton onClick={handleSwapLanguages}>
            <SwapIcon />
          </IconButton>
        </div>

        <FormControl>
          <InputLabel
            shrink
            id="translation-target"
            style={{ whiteSpace: "nowrap" }}
          >
            Translate to...
          </InputLabel>
          <Select
            value={targetLang}
            labelId="translation-target"
            disabled={isTranslateDisabled}
            onChange={handleChangetargetLang}
          >
            <MenuItem value={KOREAN}>한국어</MenuItem>
            <MenuItem value={ENGLISH}>English</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="outlined"
          onClick={toggleTranslation}
          endIcon={<TranslateIcon />}
          disabled={!started || !targetLang || isTranslateDisabled}
        >
          {isTranslating ? "Stop" : "Trans"}
        </Button>
      </div>
      <div className="contentWrapper wide themed shadow">
        <div className="content" ref={paperRef}>
          <SvgBackground />

          {speechArr.map((speech, idx) =>
            typeof speech === "object" ? (
              <div
                className="translatedTextWrapper"
                key={`${speech.translation}-${idx}`}
              >
                <p className="translation">{speech.translation}</p>
                <p className="originalText">{speech.originalText}</p>
              </div>
            ) : (
              <p key={`${speech}-${idx}`}>{speech}</p>
            )
          )}
          <p className="interimResult" ref={interimRef}>
            {interimResult}
          </p>
          <div className="leftMargin line1"></div>
          <div className="leftMargin line2"></div>
        </div>
        <IconButton
          className="btnReset"
          onClick={handleReset}
          disabled={!started}
        >
          <ResetIcon />
        </IconButton>
      </div>
    </AppStyles>
  );
}

function SvgBackground() {
  return (
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
              stroke="rgba(5, 8, 247, 0.16)"
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
  );
}

export default App;
