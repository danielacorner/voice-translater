import React, { useState, useRef, useEffect } from "react";
import {
  Button,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
} from "@material-ui/core";
import MicIcon from "@material-ui/icons/Mic";
import MicOffIcon from "@material-ui/icons/MicOff";
import SpeakIcon from "@material-ui/icons/VolumeUpRounded";
import ResetIcon from "@material-ui/icons/ReplayRounded";
import PlayIcon from "@material-ui/icons/PlayArrow";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import { AppStyles } from "./AppStyles";
import { LANGUAGES, MAX_LISTITEM_LENGTH } from "./utils/constants";
import useNoSleep from "use-no-sleep";
import { speak } from "./utils/speechSynthesis";
// https://dev.to/robertchen/how-to-use-google-translate-api-27l9
const googleTranslate = require("google-translate")(
  process.env.REACT_APP_GOOGLE_API_KEY,
  {}
);
// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const SpeechToText = window.SpeechRecognition || window.webkitSpeechRecognition;

// translate API
// const SCRIPT_URL = `https://translation.googleapis.com/language/translate/v2`;
// google script
// const SCRIPT_URL = `https://script.google.com/macros/s/AKfycbwfKgXwgAAehL_iKBzQ7H6A5I29dLswq5mMVDVi6fKFbIGcn-4/exec`;

const ChangeLanguage = (props) => (
  <Select value={props.lang} onChange={props.handleChangeLanguages}>
    {Object.values(LANGUAGES)
      .map(({ CODE, DISPLAY }) =>
        CODE ? (
          <MenuItem key={CODE} value={CODE}>
            {DISPLAY.slice(0, MAX_LISTITEM_LENGTH).trim()}
            {DISPLAY.length > MAX_LISTITEM_LENGTH ? "..." : ""}
          </MenuItem>
        ) : null
      )
      .filter(Boolean)}
  </Select>
);

const ChangeTargetLanguage = (props) => (
  <Select
    value={props.targetLang}
    labelId="translation-target"
    disabled={props.isTranslateDisabled}
    onChange={props.handleChangetargetLang}
  >
    {Object.values(LANGUAGES)
      .map(({ CODE, DISPLAY }) =>
        CODE ? (
          <MenuItem key={CODE} value={CODE}>
            {DISPLAY.slice(0, MAX_LISTITEM_LENGTH).trim()}
            {DISPLAY.length > MAX_LISTITEM_LENGTH ? "..." : ""}
          </MenuItem>
        ) : null
      )
      .filter(Boolean)}
  </Select>
);

function App() {
  const [apiErr, setApiErr] = useState(null);
  const [speechArr, setSpeechArr] = useState([
    // {
    // id:1,
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    //   originalLang: LANGUAGES.ENGLISH.CODE,
    //   translationLang: LANGUAGES.KOREAN.CODE,
    // },
  ]);
  // const [interimResult, setInterimResult] = useState("");
  const [started, setStarted] = useState(false);
  const [targetLang, setTargetLang] = useState(LANGUAGES.ENGLISH.CODE);
  const [lang, setLang] = useState(LANGUAGES.KOREAN.CODE);
  const [isPaused, setIsPaused] = useState(true);

  const recogStarted = useRef(false);

  const [recognition] = useState(SpeechToText ? new SpeechToText() : null);

  useEffect(() => {
    if (!recognition) {
      window.alert(
        "Sorry, your browser doesn't support the SpeechRecognition API 😢"
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useNoSleep(started);

  // TEST SPEECH INPUT
  // useEffect(() => {
  //   setInterval(() => {
  //     setSpeechArr((p) => [
  //       ...p,
  //       {
  //         // originalText: "hey test",
  //         originalText: "한국어",
  //         translation: null,
  //         id: p.length + 1,
  //         source: lang,
  //         target: targetLang,
  //       },
  //     ]);
  //   }, 1000 * 4);
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  if (recognition) {
    recognition.interimResults = true;
  }

  const handleResult = React.useCallback(
    (e) => {
      // get the transcript
      const transcript = Array.from(e.results)
        .map((result) => result[0])
        .map((result) => result.transcript)
        .join(""); // sometimes we get multiple items

      // capitalize the first letter
      const transcriptCapitalized =
        transcript[0].toUpperCase() + transcript.slice(1);

      const isFinal = Array.from(e.results).some((result) => result.isFinal);

      setSpeechArr([
        // if it's final, add a new item, else modify the last item
        ...(isFinal ? speechArr : speechArr.slice(0, -1)),
        {
          id: isFinal ? speechArr.length : speechArr.length - 1,
          originalText: isFinal ? null : transcriptCapitalized,
          originalLang: lang,
          translation: null,
          translationLang: null,
        },
      ]);
    },
    [lang, speechArr]
  );

  // handle start / pause
  useEffect(() => {
    if (!recognition) {
      // nada
    } else if (isPaused) {
      recognition.stop();
      recogStarted.current = false;
      recognition.removeEventListener("result", handleResult);
      recognition.removeEventListener("end", recognition.start);
    } else {
      recognition.addEventListener("result", handleResult);
      // when the event ends, start it again right away
      recognition.addEventListener("end", recognition.start);
    }

    return () => {
      if (recognition) {
        // cleanup
        recognition.removeEventListener("result", handleResult);
        recognition.removeEventListener("end", recognition.start);
      }
    };
  }, [recognition, isPaused, targetLang, lang, handleResult]);

  const handleClick = () => {
    if (recognition && !recogStarted.current) {
      // only start the first time
      recognition.lang = lang;
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

  const handleChangetargetLang = (e) => {
    setTargetLang(e.target.value);
  };
  const handleChangeLanguages = (newLang) => {
    recognition.lang = newLang;
    setLang(newLang);
  };
  const handlePlayPause = () => {
    const newIsPaused = !isPaused;
    setIsPaused(newIsPaused);
    if (recognition && !newIsPaused) {
      recognition.start();
    }
  };

  const handleSwapLanguages = () => {
    const currentLang = lang;
    const currentTarget = targetLang;
    handleChangeLanguages(currentTarget);
    setTargetLang(currentLang);
  };

  // whenever the speechArr changes, scroll to the bottom
  // (unless the user has scrolled up)
  const paperRef = useRef();
  const lastParagraphRef = useRef();
  const [overflowPx, setOverflowPx] = useState(0);
  const [shouldAutoScroll, setShouldAutoScroll] = useState(true);

  const handleScroll = (e) => {
    const { scrollHeight, offsetHeight, scrollTop } = paperRef.current;
    const userHasScrolledUp = scrollHeight - (scrollTop + offsetHeight) > 300;
    setShouldAutoScroll(!userHasScrolledUp);
  };

  useEffect(() => {
    const { scrollHeight, offsetHeight } = paperRef.current;
    setOverflowPx(scrollHeight - offsetHeight);
    // when scrolled all the way to the bottom,
    // scrollHeight = scrollTop + offsetHeight
    // keep auto-scrolling down if the user is < 300px from the bottom
    if (shouldAutoScroll) {
      // auto-scroll to the bottom
      lastParagraphRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "start",
      });
    }
  }, [speechArr, shouldAutoScroll]);

  const isTranslateDisabled = Boolean(/* !apiKey || */ apiErr);
  return (
    <AppStyles className="App" overflowPx={overflowPx}>
      {apiErr ? <h1 className="error">{apiErr}</h1> : null}
      <div className="controls shadow wide themed">
        <FormControl>
          <InputLabel
            shrink
            id="translation-target"
            style={{ whiteSpace: "nowrap" }}
          >
            I'm speaking...
          </InputLabel>
          <ChangeLanguage
            lang={lang}
            handleChangeLanguages={(e) => handleChangeLanguages(e.target.value)}
          ></ChangeLanguage>
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
          <ChangeTargetLanguage
            targetLang={targetLang}
            handleChangetargetLang={handleChangetargetLang}
            isTranslateDisabled={isTranslateDisabled}
          ></ChangeTargetLanguage>
        </FormControl>
        <div className="btnStartWrapper">
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
        </div>
      </div>
      <div className="contentWrapper wide themed shadow">
        <div
          className="content"
          ref={paperRef}
          onScroll={handleScroll}
          onTouchMove={handleScroll}
        >
          <SvgBackground />
          {speechArr.map((speech, idx) => (
            <SpeechItem
              key={`${speech.id}`}
              speech={speech}
              setApiErr={setApiErr}
              targetLang={targetLang}
              isFinal={idx !== speechArr.length - 1}
            />
          ))}
          <p className="lastParagraph" ref={lastParagraphRef}></p>
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
              stroke="rgba(5, 8, 247, 0.12)"
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

function SpeakButton({ speech, isTranslation }) {
  return speech && "speechSynthesis" in window ? (
    <IconButton
      style={{ marginLeft: isTranslation ? 12 : -16 }}
      className="btnSpeak"
      onClick={speak}
      // onTouchStart={speak}
    >
      <SpeakIcon />
    </IconButton>
  ) : null;
}

export default App;

function SpeechItem({ speech: initialSpeech, setApiErr, targetLang, isFinal }) {
  const [finalSpeech, setFinalSpeech] = useState(null);
  // once we finish speaking, fetch & use the translation
  const speech = finalSpeech || initialSpeech;

  const didFetch = useRef(false);
  const { translation, originalText, originalLang, translationLang } = speech;

  useEffect(() => {
    // if it hasn't been translated... translate it
    if (!didFetch.current && isFinal) {
      didFetch.current = true;
      googleTranslate.translate(
        originalText,
        originalLang,
        targetLang,
        function (err, translationResponse) {
          const {
            detectedSourceLanguage,
            originalText: originalTextResponse,
            translatedText,
          } = translationResponse;

          setFinalSpeech({
            translation: translatedText,
            translationLang: targetLang,
            originalText: originalTextResponse,
            originalLang: detectedSourceLanguage,
          });

          if (err) {
            setApiErr(JSON.stringify(err));
          } else {
            setApiErr(null);
          }
        }
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal]);

  return originalText === "null" ? null : (
    <div
      className={`translatedTextWrapper${
        translation ? " withTranslation" : ""
      }`}
    >
      <p className={`utterance originalText`} data-lang={originalLang}>
        {originalText}
        <SpeakButton isTranslation={false} speech={originalText} />
      </p>
      <p
        className="utterance translation"
        data-lang={translationLang}
        // onClick={speak}
        // onTouchStart={speak}
      >
        {translation}
        <SpeakButton isTranslation={true} speech={translation} />
      </p>
    </div>
  );
}
