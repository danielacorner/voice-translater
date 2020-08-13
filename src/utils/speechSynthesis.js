// copied from https://github.com/mdn/web-speech-api/
export const synth = window.speechSynthesis;

export let voices = []; // {lang: "ko-KR", name: "Google-korean", default: false}[]

function populateVoiceList() {
  if (!synth) {
    return;
  }
  voices = synth.getVoices().sort(function (a, b) {
    const aname = a.name.toUpperCase(),
      bname = b.name.toUpperCase();
    if (aname < bname) return -1;
    else if (aname === bname) return 0;
    else return +1;
  });
}

populateVoiceList();

export function speak(event) {
  if (!synth) {
    return;
  }
  const pElement = event.target.parentElement.parentElement.parentElement;
  const lang = pElement.dataset.lang;

  if (synth.speaking) {
    synth.cancel();
    return;
  }
  if (pElement.innerText !== "") {
    const utterThis = new SpeechSynthesisUtterance(pElement.innerText);
    utterThis.onend = function (event) {
      console.log("SpeechSynthesisUtterance.onend");
    };
    utterThis.onerror = function (event) {
      console.error("SpeechSynthesisUtterance.onerror");
    };

    const voiceToUse = voices.find((v) => v.lang.slice(0, 2) === lang);
    if (voiceToUse) {
      utterThis.voice = voiceToUse;
    }
    utterThis.pitch = 1;
    utterThis.rate = 1;
    utterThis.lang = lang;
    synth.speak(utterThis);
  }
}
