import { jsPDF } from "jspdf";
import "jspdf-autotable";
import toast from "react-hot-toast";

/**
 * রিপোর্ট ডেটা JSON ফরম্যাট থেকে PDF তৈরি ও ডাউনলোড করে।
 * @param {Array<Object>} data - রিপোর্ট ডেটা (getReportData API থেকে প্রাপ্ত)
 * @param {Object} filters - ফিল্টার অবজেক্ট (year, typeId, classId)
 * @param {string} title - রিপোর্টের শিরোনাম
 */
export const generatePDFReport = (data, filters, title) => {
  // প্রাথমিক ডেটা সুরক্ষা
  if (!data || !Array.isArray(data) || data.length === 0) {
    toast.error("No data available to generate PDF.");
    return;
  }

  // ডেটা স্ট্রাকচার নিশ্চিত করা
  const firstRow = data[0];
  if (!firstRow || Object.keys(firstRow).length === 0) {
    toast.error("Report data structure is empty. Cannot determine headers.");
    return;
  }

  try {
    const doc = new jsPDF("l", "mm", "a4");

    // --- ১. হেডার কনফিগারেশন ---
    const pageTitle = title || "Teacher Responsibility Assignment Report";
    const now = new Date().toLocaleString();

    doc.setFontSize(18);
    doc.text(pageTitle, 148, 15, null, null, "center");

    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Generated On: ${now}`, 10, 25);

    const filterInfo = [
      `Year: ${filters.year || "All"}`,
      `Type: ${filters.typeName || "All"}`,
      `Class: ${filters.className || "All"}`,
    ].join(" | ");

    doc.text(`Filters: ${filterInfo}`, 285, 25, null, null, "right");

    // --- ২. টেবিল ডেটা প্রসেসিং ---

    // JSON key থেকে টেবিল হেডার তৈরি করা
    const tableColumn = Object.keys(firstRow).map((key) => ({
      // CamelCase to Normal Header
      header: key.replace(/([A-Z])/g, " $1").trim(),
      dataKey: key,
    }));

    // JSON ডেটা থেকে টেবিল রো তৈরি করা
    const tableRows = data.map((item) => {
      let row = {};
      tableColumn.forEach((col) => {
        let value = item[col.dataKey];

        // ডেটা সুরক্ষা: null, undefined বা অবজেক্টকে স্ট্রিংয়ে রূপান্তর করা
        if (value === null || value === undefined) {
          value = "";
        } else if (typeof value === "object") {
          // যদি কোনও অবজেক্ট আসে (যা উচিত নয়), তাকে স্ট্রিংয়ে রূপান্তর করুন
          value = JSON.stringify(value);
        }

        row[col.dataKey] = value.toString(); // চূড়ান্তভাবে স্ট্রিংয়ে রূপান্তর
      });
      return row;
    });

    // --- ৩. jspdf-autotable ব্যবহার করে টেবিল রেন্ডার করা ---

    doc.autoTable({
      startY: 30,
      // head এবং body ডেটা jspdf-autotable-এর প্রত্যাশিত বিন্যাসে দেওয়া হলো
      head: [tableColumn.map((col) => col.header)],
      body: tableRows.map((row) => tableColumn.map((col) => row[col.dataKey])),
      theme: "striped",
      headStyles: {
        fillColor: [30, 64, 175],
        textColor: 255,
        fontSize: 9,
        halign: "center",
      },
      styles: { fontSize: 8, cellPadding: 2, overflow: "linebreak" },
      margin: { top: 30, right: 10, left: 10, bottom: 10 },
      didDrawPage: (data) => {
        doc.setFontSize(8);
        doc.text(
          "Page " + doc.internal.getNumberOfPages(),
          data.settings.margin.left,
          doc.internal.pageSize.height - 5
        );
      },
    });

    // --- ৪. ফাইল সেভ করা ---

    const filename = `${pageTitle.replace(/\s/g, "_")}_${
      filters.year || new Date().getFullYear()
    }.pdf`;
    doc.save(filename);

    toast.success("PDF report downloaded successfully!");
  } catch (error) {
    // চূড়ান্ত ত্রুটির জন্য লগিং
    console.error("PDF Generation Final Error:", error);
    toast.error(
      "Could not generate PDF. Please check console for final details."
    );
  }
};
