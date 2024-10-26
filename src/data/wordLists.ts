export interface WordList {
  name: string;
  language: string;
  words: string[];
}

export const wordLists: WordList[] = [
  {
    name: "Basic English Words",
    language: "en-CA",
    words: ["apple", "banana", "cat", "dog", "elephant", "frog", "giraffe", "house", "ice cream", "jacket"]
  },
  {
    name: "Intermediate English Words",
    language: "en-CA",
    words: ["beautiful", "curious", "delightful", "enormous", "fantastic", "graceful", "harmonious", "incredible", "jubilant", "knowledge"]
  },
  // Basic French Words
  {
    name: "Basic French Words",
    language: "fr-CA",
    words: ["bonjour", "merci", "oui", "non", "bien", "mal", "grand", "petit", "chien"]
  }
];
