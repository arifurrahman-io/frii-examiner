import { useState, useEffect } from "react";

function useDebounce(value, delay) {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    // delay সময়ের পর ভ্যালু সেট করুন
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    // প্রতিটি রেন্ডারে টাইমআউট বাতিল করুন (নতুন ইনপুট এলে)
    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default useDebounce;
