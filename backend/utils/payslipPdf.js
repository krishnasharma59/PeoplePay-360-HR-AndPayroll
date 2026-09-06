import PDFDocument from "pdfkit";

const money = (amount) => `INR ${Number(amount || 0).toLocaleString("en-IN", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export function createPayslipPdf(payslip, payrollRun, employee) {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ size: "A4", margin: 50 });
    const chunks = [];
    doc.on("data", (chunk) => chunks.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(chunks)));
    doc.on("error", reject);
    doc.fillColor("#2563eb").fontSize(22).font("Helvetica-Bold").text("PeoplePay360");
    doc.fillColor("#111827").fontSize(16).text("Salary Payslip", { align: "right" });
    doc.moveDown(1).strokeColor("#cbd5e1").moveTo(50, doc.y).lineTo(545, doc.y).stroke().moveDown();
    doc.font("Helvetica-Bold").fontSize(11).text("Employee details");
    doc.font("Helvetica").fontSize(10).text(`Name: ${employee.firstName} ${employee.lastName}`);
    doc.text(`Employee ID: ${employee.employeeCode}`); doc.text(`Department: ${employee.department}`);
    doc.moveUp(3).text(`Pay period: ${payrollRun.periodName}`, { align: "right" });
    doc.text(`Pay date: ${new Date(payrollRun.payDate).toLocaleDateString("en-IN")}`, { align: "right" });
    doc.moveDown(2);
    const table = (title, lines) => {
      doc.font("Helvetica-Bold").fontSize(11).fillColor("#111827").text(title);
      doc.moveDown(0.4);
      lines.forEach(([label, value]) => { doc.font("Helvetica").fontSize(10).fillColor("#334155").text(label, 60); doc.font("Helvetica-Bold").fillColor("#111827").text(value, 420, doc.y - 12, { width: 120, align: "right" }); });
      doc.moveDown(1);
    };
    table("Earnings", [["Basic salary", money(payslip.earnings.basicSalary)], ["Allowances", money(payslip.earnings.allowances)], ["Overtime pay", money(payslip.earnings.overtimePay)], ["Bonus", money(payslip.earnings.bonus)], ["Gross earnings", money(payslip.earnings.gross)]]);
    table("Deductions", [["Tax withholding", money(payslip.deductions.tax)], ["Unpaid leave", money(payslip.deductions.unpaidLeave)], ["Total deductions", money(payslip.deductions.total)]]);
    doc.roundedRect(50, doc.y, 495, 42, 6).fill("#eff6ff"); doc.fillColor("#1e3a8a").font("Helvetica-Bold").fontSize(13).text("Net pay", 65, doc.y - 30); doc.text(money(payslip.netPay), 380, doc.y - 15, { width: 145, align: "right" });
    doc.moveDown(4).font("Helvetica").fontSize(8).fillColor("#64748b").text("This is a system-generated payslip from PeoplePay360. It does not require a signature.", { align: "center" });
    doc.end();
  });
}
