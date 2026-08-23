import React, { useLayoutEffect, useRef } from "react";
import "../../styles/incrementLetterPrint.css";
import friiLogo from "../../assets/frii-logo.png";
import htSignature from "../../assets/ht-signature.png";
import { fitLetterToPage } from "../../utils/incrementLetterFit";
import {
  LETTER_CRITERIA_BY_ROLE,
  LETTER_SCORE_OPTIONS,
  defaultEffectiveFromLabel,
  formatBnFiscalYear,
  formatBnFiscalYearLong,
  formatBnLetterDate,
  formatBnMoney,
  getLetterRecipientMeta,
  percentToFiveScale,
  toBnDigits,
} from "../../utils/incrementUi";

const DottedMoney = ({ value, suffix = "টাকা" }) => (
  <span className="il-money">
    <span className="il-money-fill">
      {formatBnMoney(value || 0)} {suffix}
    </span>
  </span>
);

const KeyValueRow = ({ label, value, suffix = "টাকা" }) => (
  <div className="il-kv">
    <span className="il-kv-label">{label}</span>
    <span className="il-kv-colon">:</span>
    <DottedMoney value={value} suffix={suffix} />
  </div>
);

const RatingChecks = ({ selected }) => (
  <div className="il-checks">
    {LETTER_SCORE_OPTIONS.map((option) => (
      <span
        key={option.value}
        className={`il-check${selected === option.value ? " is-on" : ""}`}
      >
        <span className="il-check-box" aria-hidden="true">
          {selected === option.value ? "✓" : ""}
        </span>
        {option.label}
      </span>
    ))}
  </div>
);

const IncrementLetterPrint = ({ teacher, letter, evaluateeRole, criteria }) => {
  const letterRef = useRef(null);
  const savedAmounts = letter?.criterionAmounts || [];
  const officialCopy = LETTER_CRITERIA_BY_ROLE[evaluateeRole] || [];
  const sourceRows = criteria?.length
    ? criteria
    : letter?.averages?.byCriterion || [];
  const averages = letter?.averages?.byCriterion || [];
  const isRatedLetter =
    evaluateeRole === "incharge" || evaluateeRole === "coordinator";

  const criterionRows = (officialCopy.length ? officialCopy : sourceRows).map(
    (official, index) => {
      const source =
        sourceRows.find((row) => (row.code || "") === official.code) ||
        sourceRows[index] ||
        {};
      const criterionId = String(source._id || source.criterion || "");
      const amountRow = savedAmounts.find(
        (row) => String(row.criterion) === criterionId
      );
      const averageRow =
        averages.find((row) => String(row.criterion) === criterionId) ||
        averages.find((row) => row.titleBn === official.titleBn);
      return {
        titleBn: official.titleBn || source.titleBn,
        descriptionBn: official.descriptionBn || source.descriptionBn || "",
        amount: amountRow?.amount ?? source.amount ?? 0,
        score: percentToFiveScale(averageRow?.average),
      };
    }
  );

  const compact = !isRatedLetter && criterionRows.length > 4;

  useLayoutEffect(() => {
    const node = letterRef.current;
    if (!node) return undefined;

    let cancelled = false;
    const run = () => {
      if (!cancelled) fitLetterToPage(node);
    };

    run();
    const images = [...node.querySelectorAll("img")];
    images.forEach((image) => {
      if (!image.complete) image.addEventListener("load", run);
    });
    document.fonts?.ready?.then(run);

    return () => {
      cancelled = true;
      images.forEach((image) => image.removeEventListener("load", run));
    };
  }, [teacher, letter, evaluateeRole, criteria, compact, isRatedLetter]);

  if (!teacher || !letter) return null;

  const { honorificName, roleLine, cityLine } = getLetterRecipientMeta(
    teacher,
    evaluateeRole
  );
  const fiscalYearBn = formatBnFiscalYear(letter.fiscalYear);
  const fiscalYearLongBn = formatBnFiscalYearLong(letter.fiscalYear);
  const letterDate = formatBnLetterDate(letter.letterDate || new Date());
  const effectiveLabel = toBnDigits(
    letter.effectiveFromLabel || defaultEffectiveFromLabel(letter.fiscalYear)
  );
  const letterClass = [
    "il-letter",
    compact ? "il-letter--compact" : "",
    isRatedLetter ? "il-letter--rated" : "",
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <section className="increment-letter-page" aria-label="Increment letter">
      <article ref={letterRef} className={letterClass}>
        <div className="il-letter-main">
          <div className="il-masthead">
            <div className="il-masthead-copy">
              <p className="il-date">তারিখ: {letterDate}</p>
              <p className="il-to">জনাব,</p>
              <p className="il-name">{honorificName},</p>
              <p className="il-meta">{roleLine},</p>
              <p className="il-meta">{cityLine}</p>
            </div>
            <img
              className="il-logo"
              src={friiLogo}
              alt="Faizur Rahman Ideal Institute"
            />
          </div>

          <p className="il-subject">
            বিষয়: {fiscalYearBn} অর্থবছরের বার্ষিক কর্মমূল্যায়ন ও বেতন বৃদ্ধি
            সংক্রান্ত।
          </p>

          <p className="il-salam">আসসালামু আলাইকুম ওয়া রাহমাতুল্লাহ।</p>

          {evaluateeRole === "incharge" ? (
            <>
              <p className="il-body">
                আপনাকে পূর্বেই অবহিত করা হয়েছিল যে, প্রতিষ্ঠানের বার্ষিক
                ইনক্রিমেন্ট নির্ধারণের ক্ষেত্রে কেবল পদ ও চাকরির মেয়াদ নয়;
                বরং সারা বছরের পারফরম্যান্স বিশেষ গুরুত্ব দিয়ে মূল্যায়ন করা
                হবে।
              </p>
              <p className="il-body">
                দায়িত্বশীল কর্মকর্তাদের পর্যবেক্ষণ ও মূল্যায়নের ভিত্তিতে শিফট
                ইনচার্জ/সহ. ইনচার্জ হিসাবে বিভিন্ন সূচকে আপনার সার্বিক
                কর্মমূল্যায়ন নিম্নরূপ:
              </p>
            </>
          ) : evaluateeRole === "coordinator" ? (
            <>
              <p className="il-body">
                আপনাকে পূর্বেই অবহিত করা হয়েছিল যে, প্রতিষ্ঠানের বার্ষিক
                ইনক্রিমেন্ট নির্ধারণের ক্ষেত্রে কেবল পদ ও চাকরির মেয়াদ নয়;
                বরং সারা বছরের পারফরম্যান্স বিশেষ গুরুত্ব দিয়ে মূল্যায়ন করা
                হবে।
              </p>
              <p className="il-body">
                দায়িত্বশীল কর্মকর্তাদের পর্যবেক্ষণ ও মূল্যায়নের ভিত্তিতে ব্রাঞ্চ
                কো-অর্ডিনেটর হিসাবে বিভিন্ন সূচকে আপনার সার্বিক কর্মমূল্যায়ন
                নিম্নরূপ:
              </p>
            </>
          ) : (
            <p className="il-body">
              আপনাকে পূর্বেই অবহিত করা হয়েছিল যে, প্রতিষ্ঠানের বার্ষিক
              ইনক্রিমেন্ট নির্ধারণের ক্ষেত্রে কেবল পদ ও চাকরির মেয়াদ নয়; বরং
              সারা বছরের পারফরমেন্স বিশেষ গুরুত্ব দিয়ে মূল্যায়ন করা হবে। এ
              প্রেক্ষিতে দায়িত্বশীলদের পর্যবেক্ষণ ও মূল্যায়নের ভিত্তিতে বিভিন্ন
              সূচকে আপনার সার্বিক কর্মমূল্যায়ন নিম্নরূপ:
            </p>
          )}

          {isRatedLetter
            ? criterionRows.map((item, index) => (
                <div className="il-rate" key={`${item.titleBn}-${index}`}>
                  <p className="il-rate-line">
                    {toBnDigits(index + 1)}।{" "}
                    {String(item.descriptionBn || "").replace(/।\s*$/u, "")}:
                  </p>
                  <RatingChecks selected={item.score} />
                </div>
              ))
            : criterionRows.map((item, index) => (
                <div className="il-criterion" key={`${item.titleBn}-${index}`}>
                  <div className="il-criterion-head">
                    <p className="il-criterion-title">
                      {toBnDigits(index + 1)}| {item.titleBn}:
                    </p>
                    <DottedMoney value={item.amount} />
                  </div>
                  {item.descriptionBn ? (
                    <p className="il-consider">
                      (বিবেচ্য বিষয়: {item.descriptionBn})
                    </p>
                  ) : null}
                </div>
              ))}

          <div className="il-section">
            <p className="il-section-title">
              বেতন বৃদ্ধি <span className="il-en">(Increment Details)</span>:
              উপরোক্ত মূল্যায়নের আলোকে {fiscalYearLongBn} অর্থবছরের জন্য আপনার
              বেতন নিম্নরূপ পুনঃনির্ধারণ করা হলো :
            </p>
            <KeyValueRow
              label="সাধারণ ইনক্রিমেন্ট"
              value={letter.generalIncrement}
            />
            <KeyValueRow
              label="পারফরম্যান্সভিত্তিক ইনক্রিমেন্ট"
              value={letter.performanceIncrement}
            />
            <KeyValueRow label="মোট ইনক্রিমেন্ট" value={letter.totalIncrement} />
          </div>

          <div className="il-section">
            <p className="il-section-lead">ফলে {effectiveLabel} হতে আপনার</p>
            <KeyValueRow
              label="মূল বেতন"
              value={letter.newBasic}
              suffix="টাকা এবং"
            />
            <KeyValueRow
              label="বাড়ি ভাড়া"
              value={letter.newHouseRent}
              suffix="টাকা বাবদ"
            />
            <KeyValueRow
              label="সর্বমোট মাসিক বেতন"
              value={letter.totalMonthly}
              suffix="টাকা।"
            />
          </div>

          <p className="il-salary-note">
            পরবর্তী নির্দেশনা না দেওয়া পর্যন্ত অন্যান্য ভাতা (যদি প্রযোজ্য হয়)
            পূর্বের ন্যায় বহাল থাকবে।
          </p>

          <p className="il-close">
            আমরা আশা করি, আগামী বছর আপনি প্রতিটি মূল্যায়ন সূচকে নিজেকে আরও উন্নত
            করার আন্তরিক প্রচেষ্টা অব্যাহত রাখবেন, ইনশাআল্লাহ। আল্লাহ তাআলা আমাদের
            সবাইকে সততা, আমানতদারিতা ও নিষ্ঠার সাথে নিজ নিজ দায়িত্ব পালনের তাওফিক
            দান করুন। আমীন।
          </p>
        </div>

        <div className="il-sign">
          <img
            className="il-sign-img"
            src={htSignature}
            alt=""
            aria-hidden="true"
          />
          <p className="il-sign-name">(মো: রুহুল আমীন)</p>
          <p>প্রধান শিক্ষক</p>
          <p>ফয়জুর রহমান আইডিয়াল ইনস্টিটিউট।</p>
        </div>
      </article>
    </section>
  );
};

export default IncrementLetterPrint;
