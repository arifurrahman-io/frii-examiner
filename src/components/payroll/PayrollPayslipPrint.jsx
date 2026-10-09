import React from "react";
import headerLogo from "../../assets/frii-report-header.png";
import { INSTITUTE_NAME } from "../../utils/reportBranding";
import { formatTaka, monthLabelBn } from "../../utils/payrollUi";
import "../../styles/payrollPayslipPrint.css";

const toBn = (value) =>
  String(value ?? "").replace(/\d/g, (digit) => "০১২৩৪৫৬৭৮৯"[digit]);

const Row = ({ label, value, strong = false }) => (
  <tr className={strong ? "ps-net" : undefined}>
    <td>{label}</td>
    <td className="num">{value}</td>
  </tr>
);

const PayrollPayslipPrint = ({ slip }) => {
  if (!slip?.teacher) return null;

  const teacher = slip.teacher;
  const monthBn = monthLabelBn(slip.month);
  const yearBn = toBn(slip.year);

  return (
    <article className="payroll-payslip-page">
      <header className="ps-masthead">
        <img
          src={headerLogo}
          alt={INSTITUTE_NAME}
          className="ps-header-logo"
        />
        <div className="ps-masthead-titles">
          <p className="ps-title">মাসিক বেতন স্লিপ</p>
          <p className="ps-meta">
            {monthBn} {yearBn}
          </p>
        </div>
      </header>

      <section className="ps-section">
        <h3>শিক্ষকের তথ্য</h3>
        <div className="ps-grid">
          <div className="ps-row">
            <span className="ps-label">নাম</span>
            <span className="ps-value">
              {teacher.banglaName || teacher.name}
            </span>
          </div>
          <div className="ps-row">
            <span className="ps-label">আইডি</span>
            <span className="ps-value">{teacher.teacherId}</span>
          </div>
          <div className="ps-row">
            <span className="ps-label">পদবি</span>
            <span className="ps-value">{teacher.designation || "—"}</span>
          </div>
          <div className="ps-row">
            <span className="ps-label">ক্যাম্পাস</span>
            <span className="ps-value">{teacher.campus?.name || "—"}</span>
          </div>
          <div className="ps-row">
            <span className="ps-label">বেতন অ্যাকাউন্ট</span>
            <span className="ps-value">{teacher.salaryBankAccount || "—"}</span>
          </div>
          {slip.providentFundEnabled ? (
            <div className="ps-row">
              <span className="ps-label">পি.এফ. অ্যাকাউন্ট</span>
              <span className="ps-value">{teacher.pfBankAccount || "—"}</span>
            </div>
          ) : null}
        </div>
      </section>

      <section className="ps-section">
        <h3>হাজিরা</h3>
        <table className="ps-table">
          <thead>
            <tr>
              <th>উপস্থিত</th>
              <th>সি.এল</th>
              <th>এল.ডব্লিউ.পি</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{toBn(slip.presentDays || 0)}</td>
              <td>{toBn(slip.clDays || 0)}</td>
              <td>{toBn(slip.lwpDays || 0)}</td>
            </tr>
          </tbody>
        </table>
      </section>

      <section className="ps-section">
        <h3>আয় ও কর্তন</h3>
        <table className="ps-table">
          <thead>
            <tr>
              <th>বিবরণ</th>
              <th className="num">টাকা</th>
            </tr>
          </thead>
          <tbody>
            <Row label="মূল বেতন" value={formatTaka(slip.basic)} />
            <Row label="বাড়ি ভাড়া (৫০%)" value={formatTaka(slip.houseRent)} />
            <Row label="মোট আয়" value={formatTaka(slip.gross)} strong />
            <Row
              label={`এল.ডব্লিউ.পি কর্তন (${toBn(slip.lwpDays || 0)} দিন)`}
              value={formatTaka(slip.lwpDeduction ?? slip.deduction)}
            />
            {slip.providentFundEnabled ? (
              <>
                <Row
                  label="পি.এফ. কর্তন (মূল বেতনের ১০%)"
                  value={formatTaka(slip.pfEmployee)}
                />
                <Row
                  label="প্রতিষ্ঠানের পি.এফ. (১০%)"
                  value={formatTaka(slip.pfInstitution)}
                />
                <Row
                  label="মোট পি.এফ. জমা"
                  value={formatTaka(slip.pfTotal)}
                  strong
                />
              </>
            ) : null}
            <Row label="নীট প্রদেয়" value={formatTaka(slip.net)} strong />
          </tbody>
        </table>
      </section>

      <p className="ps-footer">
        এই স্লিপ স্বয়ংক্রিয়ভাবে তৈরি। সি.এল কোটা বর্ষভিত্তিক ২০ দিন; ২০ দিনের
        অতিরিক্ত সি.এল এল.ডব্লিউ.পি হিসেবে গণ্য হয়। পি.এফ. চালু থাকলে মূল
        বেতনের ১০% কর্তন হয় এবং প্রতিষ্ঠান সমপরিমাণ জমা দেয়।
      </p>
    </article>
  );
};

export default PayrollPayslipPrint;
