// https://medium.com/qunabu-interactive/javascript-functional-google-translate-api-to-translate-json-values-8f8f310dab7f

/**
 * Calls the translation.googleapis
 * @param {Object} term, term to be translated the shape of `{key:"", value:""}`, eg. `{key:"fullName", value:"Full name"}
 * @param {String} target language code eg `en`
 * @param {String} key Google Api Key generated with `gcloud auth application-default print-access-token`
 * @returns {Promise} resolve object is in the same shape as input
 */
export const getTranslation = (term, target, key) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      // lets avoid throttle issue with googleapis request
      // Google API limit number of concurrent calls, we'll call the API each 50 miliseconds
      fetch("https://translation.googleapis.com/language/translate/v2", {
        method: "POST",
        headers: {
          "Content-Type": "application/json; charset=utf-8",
          Authorization: `Bearer ${decodeURI(key)}`,
        },
        redirect: "follow",
        referrer: "no-referrer",
        body: JSON.stringify({
          q: term.value,
          target: target,
        }),
      })
        .then((response) =>
          response.ok
            ? response
            : reject(`Fetch failed with status code ${response.status}`)
        )
        .then((response) => response.json()) // parses response to JSON
        .then((
          json // check if the result is valid,
        ) =>
          json.error
            ? reject(json.error) // reject if response contains error
            : resolve({
                // resole the translation
                key: term.key,
                value: json.data.translations[0].translatedText,
              })
        )
        .catch((error) => reject(error)); // reject in case of any error
    }, 50);
  });
};
