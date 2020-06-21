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
import ResetIcon from "@material-ui/icons/Replay";
import TranslateIcon from "@material-ui/icons/Translate";
import PlayIcon from "@material-ui/icons/PlayArrow";
import SwapIcon from "@material-ui/icons/SwapHoriz";
import { AppStyles } from "./AppStyles";
// import getGoogleTranslate from "google-translate";
import { LANGUAGES, MAX_LISTITEM_LENGTH } from "./utils/constants";
import useNoSleep from "use-no-sleep";

// https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes

window.AudioContext = window.AudioContext || window.webkitAudioContext;

const SpeechToText = window.SpeechRecognition || window.webkitSpeechRecognition;

const SCRIPT_URL = `https://script.google.com/macros/s/AKfycbwfKgXwgAAehL_iKBzQ7H6A5I29dLswq5mMVDVi6fKFbIGcn-4/exec`;

const ChangeLanguage = (props) => (
  <Select value={props.lang} onChange={props.handleChangeLanguages}>
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
  // const [apiKey, setApiKey] = useState(
  //   window.localStorage.getItem("api_key") || null
  // ); // https://github.com/google/google-api-javascript-client
  // const googleTranslate = apiKey && getGoogleTranslate(apiKey);
  const [apiErr, setApiErr] = useState(null);
  const [speechArr, setSpeechArr] = useState([
    // {
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // },
    // {
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // },
    // {
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // },
    // {
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // },
    // {
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // },
    // {
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // },
    // {
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // },
    // {
    //   translation:
    //     "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
    //   originalText:
    //     "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // },
    // "Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean Korean ",
    // "한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 한국어 ",
  ]);
  // const [interimResult, setInterimResult] = useState("");
  const [started, setStarted] = useState(false);
  const [targetLang, setTargetLang] = useState(LANGUAGES.KOREAN.CODE);
  const [lang, setLang] = useState(LANGUAGES.ENGLISH.CODE);
  const [isPaused, setIsPaused] = useState(true);
  const [isTranslating, setIsTranslating] = useState(false);

  const recogStarted = useRef(false);

  const [recognition] = useState(new SpeechToText());

  useNoSleep(started);

  // TEST ANIMATION
  // useEffect(() => {
  //   setTimeout(() => {
  //     setSpeechArr([
  //       {
  //         originalText: "hey test",
  //         translation: null,
  //       },
  //     ]);
  //   }, 0.5 * 1000);
  //   setTimeout(() => {
  //     setSpeechArr([
  //       {
  //         originalText: "hey test",
  //         translation: "heyheyhey",
  //       },
  //     ]);
  //   }, 0.5 * 2000);
  //   setTimeout(() => {
  //     setSpeechArr([
  //       {
  //         originalText: "hey test",
  //         translation: "heyheyhey",
  //       },
  //       { originalText: "second test", translation: null },
  //     ]);
  //   }, 0.5 * 3000);
  //   setTimeout(() => {
  //     setSpeechArr([
  //       {
  //         originalText: "hey test",
  //         translation: "heyheyhey",
  //       },
  //       { originalText: "second test", translation: "helloooo" },
  //     ]);
  //   }, 0.5 * 4000);
  // }, []);

  recognition.interimResults = true;
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
          translation: null,
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
        // commit it to the speech array
        const shouldTranslate =
          isTranslating && targetLang && targetLang !== lang;
        if (shouldTranslate) {
          // if translating,
          // THIS VERSION USES FREE GOOGLE APP SCRIPT
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
                  originalText: sourceText,
                },
              ]);
              // remove the interim result
              // setInterimResult("");
              setApiErr(null);
            })
            .catch((err) => {
              setApiErr(err);
            });

          // THIS VERSION USES API KEY
          // googleTranslate.translate(
          //   transcript,
          //   lang,
          //   targetLang,
          //   (err, result) => {
          //     if (err) {
          //       setApiErr(err);
          //     } else {
          //       setSpeechArr((prev) => [
          //         ...prev,
          //         {
          //           translation: result.translatedText,
          //           originalText: result.originalText,
          //         },
          //       ]);
          //       // remove the interim result
          //       setInterimResult("");
          //     }
          //   }
          // );
        } else {
          // setSpeechArr((prev) => [
          //   ...prev,
          //   {
          //     translation: null,
          //     originalText: transcriptCapitalized,
          //   },
          // ]);
          // remove the interim result
          // setInterimResult("");
        }
      } else if (!isFinal) {
        // setSpeechArr((prev) => [
        //   ...prev,
        //   {
        //     translation: null,
        //     originalText: transcriptCapitalized,
        //   },
        // ]);
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
    speechArr,
    // apiKey,
    // googleTranslate,
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
  // const [newApiKey, setNewApiKey] = useState(null);
  // const handleChangeApiKey = (e) => {
  //   setNewApiKey(e.target.value);
  // };
  // const handleSubmitApiKey = (e) => {
  //   e.preventDefault();
  //   window.localStorage.setItem("api_key", newApiKey);
  //   setApiKey(newApiKey);
  //   setApiErr(null);
  // };
  // const handleRemoveApiKey = () => {
  //   window.localStorage.removeItem("api_key");
  //   setApiKey(null);
  // };
  const handleSwapLanguages = () => {
    const currentLang = lang;
    const currentTarget = targetLang;
    setLang(currentTarget);
    setTargetLang(currentLang);
  };

  // whenever the speechArr changes, scroll to the bottom
  // (unless the user has scrolled up)
  const paperRef = useRef();
  const lastParagraphRef = useRef();
  const [overflowPx, setOverflowPx] = useState(0);

  useEffect(() => {
    const { scrollHeight, offsetHeight, scrollTop } = paperRef.current;
    setOverflowPx(scrollHeight - offsetHeight);
    // when scrolled all the way to the bottom,
    // scrollHeight = scrollTop + offsetHeight
    const userHasScrolledUp = scrollHeight - (scrollTop + offsetHeight) < 100; // doesn't have to be 0
    console.log("🌟🚨: App -> userHasScrolledUp", userHasScrolledUp);
    if (!userHasScrolledUp) {
      // auto-scroll to the bottom
      lastParagraphRef.current.scrollIntoView({
        behavior: "smooth",
        block: "end",
        inline: "start",
      });
    }
  }, [speechArr]);

  const speechArrWithoutLastTwoResults = speechArr.slice(0, -2);
  const lastTwoResults = speechArr.slice(-2);
  const isTranslateDisabled = Boolean(/* !apiKey || */ apiErr);
  return (
    <AppStyles className="App" overflowPx={overflowPx}>
      {apiErr ? <h1 className="error">{apiErr}</h1> : null}
      {/* {!isTranslateDisabled && (
        <div className="swapApiKey">
          <Button size="small" variant="outlined" onClick={handleRemoveApiKey}>
            Swap API key
          </Button>
        </div>
      )} */}
      {/* {isTranslateDisabled && (
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
      )} */}
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
          <ChangeLanguage
            lang={lang}
            handleChangeLanguages={handleChangeLanguages}
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

          {speechArrWithoutLastTwoResults.map(
            (speech, idx) => (
              // typeof speech === "object" ? (
              <div
                className={`translatedTextWrapper${
                  speech.translation ? " withTranslation" : ""
                }`}
                key={`${speech.translation}-${idx}`}
              >
                <p className={`originalText`}>{speech.originalText}</p>
                <p className="translation">{speech.translation}</p>
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
            <p className={`originalText`}>{lastTwoResults[0]?.originalText}</p>
            <p className="translation">{lastTwoResults[0]?.translation}</p>
          </div>
          <div
            className={`translatedTextWrapper last${
              lastTwoResults[1]?.translation ? " withTranslation" : ""
            }`}
          >
            <p className={`originalText`}>{lastTwoResults[1]?.originalText}</p>
            <p className="translation" ref={lastParagraphRef}>
              {lastTwoResults[1]?.translation}
            </p>
          </div>

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

export default App;
