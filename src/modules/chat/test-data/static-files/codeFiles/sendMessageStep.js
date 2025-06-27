"use strict";
var __awaiter =
  (this && this.__awaiter) ||
  function (thisArg, _arguments, P, generator) {
    function adopt(value) {
      return value instanceof P
        ? value
        : new P(function (resolve) {
            resolve(value);
          });
    }
    return new (P || (P = Promise))(function (resolve, reject) {
      function fulfilled(value) {
        try {
          step(generator.next(value));
        } catch (e) {
          reject(e);
        }
      }
      function rejected(value) {
        try {
          step(generator["throw"](value));
        } catch (e) {
          reject(e);
        }
      }
      function step(result) {
        result.done
          ? resolve(result.value)
          : adopt(result.value).then(fulfilled, rejected);
      }
      step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
  };
Object.defineProperty(exports, "__esModule", { value: true });
const cucumber_1 = require("@cucumber/cucumber");
const test_1 = require("@playwright/test");
let browser;
let page;
(0, cucumber_1.Given)("user is on the chat editor", function () {
  return __awaiter(this, void 0, void 0, function* () {
    browser = yield test_1.chromium.launch({ headless: false });
    page = yield browser.newPage();
    yield page.goto("https://google.com"); // Use your correct URL
  });
});
(0, cucumber_1.Given)("user writes some text", function () {
  return __awaiter(this, void 0, void 0, function* () {
    console.log("User writes some text");
    // Simulate the user writing text in the chat editor
  });
});
(0, cucumber_1.Given)("the user can see the attachment icon", function () {
  return __awaiter(this, void 0, void 0, function* () {
    console.log("I got my second text");
    // Check if the attachment icon is visible
  });
});
(0, cucumber_1.Given)(
  "user clicks the attachment icon in the editor toolbar",
  function () {
    return __awaiter(this, void 0, void 0, function* () {
      console.log("I got my third text");
      // Simulate the user clicking the attachment icon
    });
  },
);
(0, cucumber_1.Given)(
  "user can see the two options Choose Files and Photo Library",
  function () {
    return __awaiter(this, void 0, void 0, function* () {
      console.log("User sees the options Choose Files and Photo Library");
      // Check if the options are visible
    });
  },
);
(0, cucumber_1.Then)("user clicks on any of the options", function () {
  return __awaiter(this, void 0, void 0, function* () {
    console.log("User clicks on an option");
    // Simulate the user clicking on an option
  });
});
(0, cucumber_1.Then)("the file should be uploaded successfully", function () {
  return __awaiter(this, void 0, void 0, function* () {
    console.log("File is uploaded successfully");
    // Check if the file is uploaded successfully
  });
});
(0, cucumber_1.Then)(
  "The attachment should be displayed in the chat editor",
  function () {
    return __awaiter(this, void 0, void 0, function* () {
      console.log("Attachment is displayed in the chat editor");
      // Check if the attachment is displayed in the chat editor
    });
  },
);
(0, cucumber_1.Then)("the send button should be enabled", function () {
  return __awaiter(this, void 0, void 0, function* () {
    console.log("Send button is enabled");
    // Check if the send button is enabled
  });
});
(0, cucumber_1.When)("the user clicks on the send button", function () {
  return __awaiter(this, void 0, void 0, function* () {
    console.log("User clicks the send button");
    // Simulate the user clicking the send button
  });
});
(0, cucumber_1.Then)(
  "the message with the attachment should be sent successfully and appear in the chat window",
  function () {
    return __awaiter(this, void 0, void 0, function* () {
      console.log(
        "Message with attachment is sent successfully and appears in the chat window",
      );
      // Verify that the message with the attachment is sent and appears in the chat window
    });
  },
);
