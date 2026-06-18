/**
 * @jest-environment jsdom
 */

const fs = require("fs");
const path = require("path");

const html = fs.readFileSync(
  path.resolve(__dirname, "..", "index.html"),
  "utf-8",
);

const {
  addElementToDOM,
  removeElementFromDOM,
  initializeDOMInteractions,
} = require("../index.js");
const { error } = require("console");

//each function is split into is own nested 'describe' block for organizational purposes
describe("index.js", () => {
  let dynamicContent;
  //handle initialization for each test
  beforeEach(() => {
    document.body.innerHTML = html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1];//adding only the body from index.html to unsure accurate comparison for test cases where no changes are supposed to occur
    dynamicContent = document.querySelector("#dynamic-content");
    require("../index.js");
    initializeDOMInteractions();
  });

  //test initial state
  test("dynamic-content is blank on load", () => {
    expect(dynamicContent.innerHTML).toBe("");
  });

  describe("addElementToDOM", () => {
    test("changes the element with matching containerId to have the provided innerHTML", () => {
      addElementToDOM("dynamic-content", "Test Change");
      expect(document.querySelector("#dynamic-content").innerHTML).toBe(
        "Test Change",
      );
    });
    test("does nothing if provided an incorrect element id", () => {
      addElementToDOM("test-fail", "Should Not Exist");
      expect(document.body.innerHTML).not.toContain("Should Not Exist");
      expect(document.body.innerHTML).toBe(html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]);
    });
  });

  describe("removeElementFromDOM", () => {
    test("removes designated element", () => {
      const testElement = document.createElement("p");
      testElement.id = "test-element";
      document.body.appendChild(testElement);
      removeElementFromDOM("test-element");
      expect(document.querySelector("#test-element")).toBe(null);
    });
    test("does nothing if provided an incorrect element id", () => {
      removeElementFromDOM("test-fail");
      expect(document.body.innerHTML).toBe(html.match(/<body[^>]*>([\s\S]*)<\/body>/i)[1]);
    });
  });

  describe("simulateClick", () => {
    test('Clicking the "Simulate Click" button updates the "dynamic-content" element', () => {
      const button = document.querySelector("#simulate-click");
      button.click();
      expect(dynamicContent.textContent).toBe("Button Clicked!");
    });
  });

  describe("handleFormSubmit", () => {
    //set element referenses for handleFormSubmit
    let form, userInput, errorMessage;

    beforeEach(() => {
      form = document.querySelector("#user-form");
      userInput = document.querySelector("#user-input");
      errorMessage = document.querySelector("#error-message");
    });

    test("updates dynamic-content to the inputted text", () => {
      userInput.value = "test";
      form.submit();
      expect(dynamicContent.innerHTML).toBe("test");
    });

    test("displays error message when submitting an empty string", () => {
      userInput.value = "";
      form.submit();
      expect(dynamicContent.innerHTML).toBe("");
      expect(errorMessage.textContent).toBe("Input cannot be empty");
      expect(errorMessage.classList).not.toContain("hidden");
    });

    test("removes error message when submitting a string after submitting an empty string", () => {
      userInput.value = "";
      form.submit();
      userInput.value = "test successful follow-up";
      form.submit();
      expect(dynamicContent.innerHTML).toBe("test successful follow-up");
      expect(errorMessage.textContent).toBe("");
      expect(errorMessage.classList).toContain("hidden");
    });
  });
});
