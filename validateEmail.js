// RFC - 3696 Local and Email Address validation (https://datatracker.ietf.org/doc/html/rfc3696#section-3)
const validator = require("email-validator");

const validateCharIsANumberAndLetter = (char) => {
  // checks if a character is a letter or number
  if (
    (char >= "a" && char <= "z") === false &&
    (char >= "A" && char <= "Z") === false &&
    (char >= "0" && char <= "9") === false
  ) {
    return false;
  }
  return true;
};

const validateTopLevelDomain = (topLevelDomain) => {
  // top level domains cannot start with a - or end with a dash
  if (
    topLevelDomain[0] === "-" ||
    topLevelDomain[topLevelDomain.length - 1] === "-"
  ) {
    return false;
  }

  //strict length limit between 2 and 63
  if (topLevelDomain.length < 2 || topLevelDomain.length > 63) {
    return false;
  }

  // top level domains cannot have spaces
  if (topLevelDomain.indexOf(" ") >= 0) {
    return false;
  }

  //top level domains can only contain hyphens (non consecutive), numbers and letters
  let hyphen_tracker = 0;
  for (let i = 0; i < topLevelDomain.length; i++) {
    const char = topLevelDomain[i];
    // if the character is not a letter, number or a hyphen return false
    if (validateCharIsANumberAndLetter(char) === false && char !== "-") {
      return false;
    }

    if (char === "-") {
      hyphen_tracker += 1;
    } else {
      hyphen_tracker = 0;
    }

    if (hyphen_tracker > 1) {
      return false;
    }
  }
  return true;
};

const validateLocal = (local) => {
  //the local part cannot be longer than 64 characters
  if (local.length > 64) {
    return false;
  }

  // local cannot start with a . or end with a .
  if (local[0] === "." || local[local.length - 1] === ".") {
    return false;
  }

  const validSpecialCharacters = [
    "!",
    "#",
    "$",
    "%",
    "&",
    "'",
    "*",
    "+",
    "-",
    "/",
    "=",
    "?",
    "^",
    "_",
    "`",
    ".",
    "{",
    "|",
    "} ",
    "~",
  ];

  let backSlashCheck = 0;
  let quoteCheck = 0;
  for (let i = 0; i < local.length; i++) {
    const char = local[i];

    // checks if the character is valid
    if (backSlashCheck > 0) {
      console.log("BACKSLASH FOUND ANY VALUE IS WELCOME :)");
      backSlashCheck = 0;
    } else if (quoteCheck > 0) {
      console.log("QOUTES FOUND ANY VALUE IS WELCOME :)");
    } else {
      if (
        validateCharIsANumberAndLetter(char) === false &&
        validSpecialCharacters.includes(char) === false
      ) {
        return false;
      }
    }

    //periods cannot appear consecutively if they do the pass fails
    if (i + 1 > local.length) {
      if (char === "." && local[i + 1] === ".") {
        return false;
      }
    }

    // checks to see if the backslash is present if so then the next value can be any ascii value
    // (if the backslash is back to back then we don't increase the backslash check since the prev backslash)
    if (char === "/" && backSlashCheck === 0) {
      backSlashCheck += 1;
    }

    // checks if qoutations are found and if so we allow any values in them
    // once the quotes have been lifted then we remove that lee way
    if (char === '"' && quoteCheck === 0) {
      quoteCheck += 1;
    } else if (char === '"' && quoteCheck > 0) {
      quoteCheck = 0;
    }
  }

  // checks if quotes ended and if not we return false
  if (quoteCheck > 0) {
    return false;
  }

  return true;
};

const validateEmailStrict = (email) => {
  // emails cannot start with and end with periods
  if (email[0] === "." || email[email.length - 1] === ".") {
    return false;
  }

  // emails can only be up to 320 characters
  // Qoute from RFC - 3696 That limit is a maximum of 64 characters (octets) in the "local part" (before the "@") and a maximum of 255 characters (octets) in the domain part (after the "@") for a total length of 320 characters.
  if (email.length > 320 || email.length < 1) {
    return false;
  }

  // preforms a split of the email by the @ symbol (checking if it is only consisting of two parts the local and octets)
  emailSplitList = email.split("@");
  if (emailSplitList.length !== 2) {
    return false;
  }

  // local can include letters numbers special characters
  const localPart = emailSplitList[0];
  const fullDomain = emailSplitList[1];

  // checks if the local part is valid and if not it returns false
  const isLocalValid = validateLocal(localPart);
  if (isLocalValid === false) {
    return false;
  }

  // determines if the domain consists of two parts the (the domain and top level domain)
  if (fullDomain.split(".").length !== 2) {
    return false;
  }

  //maximum of 255 characters (octets) in the domain part (after the "@")
  if (fullDomain.length > 255 || fullDomain.length < 1) {
    return false;
  }

  const topLevelDomain = fullDomain.split(".")[1];
  // determines if the top level domain is valid
  const isTopLevelDomain = validateTopLevelDomain(topLevelDomain);
  // if not returns false
  if (isTopLevelDomain === false) {
    return false;
  }

  return true;
};

function validateEmailExternalLib(email) {
  return validator.validate(email);
}

function main() {
  // calls the profiler
  console.profile();

  test_string_one = "ml60379@umbc.edu";
  test_string_two = "email@@down.edu";
  test_string_three = "firekcjsnkjcssnc";
  test_string_four = "john@john.com";

  console.log(validateEmailStrict(test_string_one));
  console.log(validateEmailStrict(test_string_two));
  console.log(validateEmailStrict(test_string_three));
  console.log(validateEmailStrict(test_string_four));

  console.log();

  console.log(validateEmailExternalLib(test_string_one));
  console.log(validateEmailExternalLib(test_string_two));
  console.log(validateEmailExternalLib(test_string_three));
  console.log(validateEmailExternalLib(test_string_four));

  // ends the profiler
  console.profileEnd();
}

main();
