import { useState, useEffect } from "react";

export function useTypingAnimation(words: string[]) {
  const [currentText, setCurrentText] = useState("");
  const [currentWordIndex, setCurrentWordIndex] = useState(0);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isPausing, setIsPausing] = useState(false);

  useEffect(() => {
    const targetText = words[currentWordIndex];
    let timer: NodeJS.Timeout;

    if (isPausing) {
      timer = setTimeout(() => {
        setIsPausing(false);
        setIsDeleting(true);
      }, 2000);
      return () => clearTimeout(timer);
    }

    if (!isDeleting && currentText === targetText) {
      timer = setTimeout(() => setIsPausing(true), 0);
      return () => clearTimeout(timer);
    }

    if (isDeleting && currentText === "") {
      timer = setTimeout(() => {
        setIsDeleting(false);
        setCurrentWordIndex((prev) => (prev + 1) % words.length);
      }, 0);
      return () => clearTimeout(timer);
    }

    const speed = isDeleting ? 30 : 80;
    timer = setTimeout(() => {
      setCurrentText((prev) =>
        isDeleting
          ? prev.substring(0, prev.length - 1)
          : targetText.substring(0, prev.length + 1)
      );
    }, speed);

    return () => clearTimeout(timer);
  }, [currentText, isDeleting, currentWordIndex, isPausing, words]);

  return currentText;
}