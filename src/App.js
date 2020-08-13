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

// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const SpeechToText = window.SpeechRecognition || window.webkitSpeechRecognition;

const SCRIPT_URL = `https://script.google.com/macros/s/AKfycbwfKgXwgAAehL_iKBzQ7H6A5I29dLswq5mMVDVi6fKFbIGcn-4/exec`;

const ChangeLanguage = (props) => (
  <Select
    value={props.lang}
    onChange={(e) => props.handleChangeLanguages(e.target.value)}
  >
    {Object.values(LANGUAGES).map(({ CODE, DISPLAY }) => (
      <MenuItem key={CODE} value={CODE}>
        {DISPLAY.slice(0, MAX_LISTITEM_LENGTH).trim()}
        {DISPLAY.length > MAX_LISTITEM_LENGTH ? "..." : ""}
      </MenuItem>
    ))}
  </Select>
);

const ChangeTargetLanguage = (props) => (
  <Select
    value={props.targetLang}
    labelId="translation-target"
    disabled={props.isTranslateDisabled}
    onChange={props.handleChangetargetLang}
  >
    {Object.values(LANGUAGES).map(({ CODE, DISPLAY }) => (
      <MenuItem key={CODE} value={CODE}>
        {DISPLAY.slice(0, MAX_LISTITEM_LENGTH).trim()}
        {DISPLAY.length > MAX_LISTITEM_LENGTH ? "..." : ""}
      </MenuItem>
    ))}
  </Select>
);

function App() {
  const [apiErr, setApiErr] = useState(null);
  const [speechArr, setSpeechArr] = useState([
    // {
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

  // TEST ANIMATION
  // useEffect(() => {
  //   setInterval(() => {
  //     setSpeechArr((p) => [
  //       ...p,
  //       {
  //         originalText: "hey test",
  //         translation: "heyheyhey",
  //       },
  //     ]);
  //   }, 1 * 1000);
  // }, []);

  if (recognition) {
    recognition.interimResults = true;
  }
  useEffect(() => {
    const setInterimResult = (res) => {
      const lastSpeechItem = speechArr.slice(-1)[0];
      // we're in "interim mode" if we're waiting for the speaker to finish
      const isInterimMode = !Boolean(lastSpeechItem?.translation);

      setSpeechArr([
        ...(isInterimMode
          ? // modify the last item in the array
            speechArr.slice(0, -1)
          : // add the interim result to the end
            speechArr),
        {
          originalText: res,
          originalLang: lang,
          translation: null,
          translationLang: null,
        },
      ]);
    };

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
        fetch(
          `${SCRIPT_URL}?source=${lang}&target=${targetLang}&q=${transcript}`
        )
          .then((resp) => resp.text())
          .then((resp) => {
            // resp is string "callback({sourceText: 'blabla', translatedText: 'blublu'})"
            const jsonText = resp.slice("callback(".length, -1);
            const { sourceText, translatedText } = JSON.parse(jsonText);
            setSpeechArr((prev) => [
              ...prev.slice(0, -1),
              {
                translation: translatedText,
                translationLang: targetLang,
                originalText: sourceText,
                originalLang: lang,
              },
            ]);
            // remove the interim result
            // setInterimResult("");
            setApiErr(null);
          })
          .catch((err) => {
            setApiErr(err);
          });
      } else if (!isFinal) {
        // show the interim results
        setInterimResult(transcriptCapitalized);
      }
    };

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
  }, [recognition, isPaused, targetLang, lang, speechArr]);

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
        block: "start",
        inline: "start",
      });
    }
  }, [speechArr, shouldAutoScroll]);

  const speechArrWithoutLastTwoResults = speechArr.slice(0, -2);
  const lastTwoResults = speechArr.slice(-2);
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

          {speechArrWithoutLastTwoResults.map(
            (speech, idx) => (
              // typeof speech === "object" ? (
              <div
                className={`translatedTextWrapper${
                  speech.translation ? " withTranslation" : ""
                }`}
                key={`${speech.translation}-${idx}`}
              >
                <p
                  className={`utterance originalText`}
                  data-lang={speech.originalLang}
                >
                  {speech.originalText}
                  <SpeakButton
                    isTranslation={false}
                    speech={speech.originalText}
                  />
                </p>
                <p
                  className="utterance translation"
                  data-lang={speech.translationLang}
                  // onClick={speak}
                  // onTouchStart={speak}
                >
                  {speech.translation}
                  <SpeakButton
                    isTranslation={true}
                    speech={speech.translation}
                  />
                </p>
              </div>
            )
            // ) : (
            //   <p key={`${speech}-${idx}`}>{speech}</p>
            // )
          )}
          {/* keep the last two results outside the map to allow separate rendering and animation  */}
          <div
            className={`translatedTextWrapper${
              lastTwoResults[0]?.translation ? " withTranslation" : ""
            }`}
          >
            <p
              className={`utterance originalText`}
              data-lang={lastTwoResults[0]?.originalLang}
            >
              {lastTwoResults[0]?.originalText}
              <SpeakButton
                isTranslation={false}
                speech={lastTwoResults[0]?.originalText}
              />
            </p>
            <p
              className="utterance translation"
              data-lang={lastTwoResults[0]?.translationLang}
            >
              {lastTwoResults[0]?.translation}
              <SpeakButton
                isTranslation={true}
                speech={lastTwoResults[0]?.translation}
              />
            </p>
          </div>
          <div
            className={`translatedTextWrapper last${
              lastTwoResults[1]?.translation ? " withTranslation" : ""
            }`}
          >
            <p
              className={`utterance originalText`}
              data-lang={lastTwoResults[0]?.originalLang}
            >
              {lastTwoResults[1]?.originalText}
              <SpeakButton isTranslation={false} />
            </p>
            <p
              className="utterance translation"
              data-lang={lastTwoResults[0]?.translationLang}
            >
              {lastTwoResults[1]?.translation}
              <SpeakButton isTranslation={true} />
            </p>
          </div>
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
