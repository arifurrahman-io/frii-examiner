export const A4_HEIGHT_PX = Math.round((297 * 96) / 25.4);

export const fitLetterToPage = (letter) => {
  if (!letter) return;

  letter.style.transform = "none";
  letter.style.height = "auto";
  letter.style.maxHeight = "none";
  letter.style.minHeight = "0";
  letter.style.overflow = "visible";
  void letter.offsetHeight;

  const page = letter.closest(".increment-letter-page");
  const target = page?.clientHeight || A4_HEIGHT_PX;
  const contentHeight = Math.ceil(letter.scrollHeight);

  if (contentHeight > target + 1) {
    const scale = target / contentHeight;
    letter.style.transformOrigin = "top left";
    letter.style.transform = `scale(${scale})`;
    return;
  }

  letter.style.minHeight = `${target}px`;
  letter.style.height = `${target}px`;
};
