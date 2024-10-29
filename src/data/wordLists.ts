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
    words: ["merci", "oui", "non", "bien", "mal", "grand", "petit", "chien"]
  },
  // New French word list
  {
    name: "Common French Words",
    language: "fr-CA",
    words: [
      "abri", "amour", "avion", "barbe", "bonjour", "date", "groupe", "ligne", "maladie", "mine",
      "minute", "or", "pile", "poudre", "retenir", "rire", "son", "sorte", "sucre", "tour",
      "vivre", "vue"
    ]
  },
  {
    name: "French G-Words",
    language: "fr-CA",
    words: [
      "âge", "argent", "danger", "gagner", "garder",
      "genre", "gorge", "goutte", "guerre", "langue",
      "magasin", "ménage", "nuage", "protéger", "village",
      "voyage"
    ]
  }
];
