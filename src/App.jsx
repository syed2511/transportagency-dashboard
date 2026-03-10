import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, signInWithCustomToken, signInAnonymously } from "firebase/auth";
import { getFirestore, collection, onSnapshot, doc, addDoc, setDoc, updateDoc, deleteDoc, where, query, writeBatch, getDocs, getDoc } from "firebase/firestore";

/* =======================================================================
  LOCAL DEVELOPMENT INSTRUCTIONS:
  To use this code in your local project, make the following 2 changes:

  1. Replace the Firebase Initialization block below with your import:
     import { db, auth } from './firebaseConfig.js';
     
  2. In your local editor, do a "Find and Replace All":
     Find:    'artifacts', appId, 'users', 
     Replace: 'users',
  =======================================================================
*/

// --- Firebase Initialization (Canvas Environment) ---
const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Icon Components ---
const TruckIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 18H3c-.6 0-1-.4-1-1V7c0-.6.4-1 1-1h10c.6 0 1 .4 1 1v11" /><path d="M14 9h4l4 4v4h-8v-4l-4-4Z" /><path d="M10 18h4" /><circle cx="7" cy="18" r="2" /><circle cx="17" cy="18" r="2" /></svg>;
const PlusCircleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" /></svg>;
const FileTextIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7.5L14.5 2z" /><polyline points="14 2 14 8 20 8" /><line x1="16" y1="13" x2="8" y2="13" /><line x1="16" y1="17" x2="8" y2="17" /><line x1="10" y1="9" x2="8" y2="9" /></svg>;
const DollarSignIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" y1="1" x2="12" y2="23" /><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" /></svg>;
const DownloadIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" y1="15" x2="12" y2="3" /></svg>;
const UsersIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path d="M22 21v-2a4 4 0 0 0-3-3.87" /><path d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>;
const BriefcaseIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path></svg>;
const AlertTriangleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path><line x1="12" y1="9" x2="12" y2="13"></line><line x1="12" y1="17" x2="12.01" y2="17"></line></svg>;
const InfoIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>;
const CheckCircleIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>;
const LogOutIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>;
const SettingsIcon = (props) => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>

// --- Global Configs & Helpers ---
const getFinancialYear = () => { const today = new Date(); const currentMonth = today.getMonth(); const currentYear = today.getFullYear(); if (currentMonth >= 3) { return `${currentYear}-${(currentYear + 1).toString().slice(-2)}`; } else { return `${currentYear - 1}-${currentYear.toString().slice(-2)}`; } };

const numberToWords = (num) => {
    const a = ['', 'one ', 'two ', 'three ', 'four ', 'five ', 'six ', 'seven ', 'eight ', 'nine ', 'ten ', 'eleven ', 'twelve ', 'thirteen ', 'fourteen ', 'fifteen ', 'sixteen ', 'seventeen ', 'eighteen ', 'nineteen '];
    const b = ['', '', 'twenty', 'thirty', 'forty', 'fifty', 'sixty', 'seventy', 'eighty', 'ninety'];
    const inWords = (n, s) => {
        let str = '';
        if (n > 19) { str += b[Math.floor(n / 10)] + (n % 10 > 0 ? ' ' : '') + a[n % 10]; } else { str += a[n]; }
        if (n) { str = str.trim() + ' ' + s + ' '; }
        return str;
    };
    let n = Math.floor(num);
    if (n === 0) return "ZERO";
    let str = '';
    const crore = Math.floor(n / 10000000); n %= 10000000;
    if (crore > 0) str += inWords(crore, 'crore');
    const lakh = Math.floor(n / 100000); n %= 100000;
    if (lakh > 0) str += inWords(lakh, 'lakh');
    const thousand = Math.floor(n / 1000); n %= 1000;
    if (thousand > 0) str += inWords(thousand, 'thousand');
    const hundred = Math.floor(n / 100); n %= 100;
    if (hundred > 0) str += inWords(hundred, 'hundred');
    if (str && n > 0) str += 'and ';
    if (n > 0) str += inWords(n, '');
    return str.trim().toUpperCase().replace(/\s+/g, ' ') + " ONLY";
};

// Robust Alphanumeric Sorting Logic
const alphanumericComparator = (strA, strB) => {
    const regex = /^(\d*)(.*)$/;
    const [, numAStr, suffixA] = String(strA || '').match(regex) || ["", "", String(strA || '')];
    const [, numBStr, suffixB] = String(strB || '').match(regex) || ["", "", String(strB || '')];

    const numA = parseInt(numAStr, 10);
    const numB = parseInt(numBStr, 10);

    if (!isNaN(numA) && !isNaN(numB)) {
        if (numA !== numB) return numA - numB;
        return suffixA.localeCompare(suffixB);
    }
    if (!isNaN(numA)) return -1;
    if (!isNaN(numB)) return 1;
    return String(strA || '').localeCompare(String(strB || ''));
};

const defaultCompanyConfigs = {
    "GLOBAL LOGISTICS": {
        header: "GLOBAL LOGISTICS",
        prefix: "GL",
        address: "2-42-69/3 ILTD JUNCTION, RAJAMAHENDRAVARAM",
        panNo: "LJBPS6830H",
        phone: "9885086504, 7981658659",
        email: "GLOBALRJY1@GMAIL.COM",
        bankAccounts: [
            { name: "HDFC BANK", ac: "50200117398447", ifsc: "HDFC0000215", branch: "DANVAIPETA, RAJAHMUNDRY" },
            { name: "ICICI BANK", ac: "631505500740", ifsc: "ICIC0006315", branch: "T NAGAR, RAJAHMUNDRY" }
        ]
    },
    "SRI KUMAR TRANSPORT": {
        header: "SRI KUMAR TRANSPORT",
        prefix: "SKT",
        address: "6-93/7/4, NEAR KONTHAMURU PANCHAYATI OFFICE",
        phone: "9885086504, 9390680009",
        email: "SKTC.RJY@GMAIL.COM",
        bankAccounts: [
            { name: "ICICI BANK", ac: "631505013772", ifsc: "ICIC0006315", branch: "T NAGAR, RAJAHMUNDRY" }
        ]
    },
    "SAI KUMAR TRANSPORT": {
        header: "SAI KUMAR TRANSPORT",
        prefix: "SAI",
        address: "6-93/7/4, NEAR KONTHAMURU PANCHAYATI OFFICE",
        phone: "9885086504, 9390680009",
        email: "SKTC.RJY@GMAIL.COM",
        bankAccounts: [
            { name: "BANK OF MAHARASHTRA", ac: "60380956429", ifsc: "MAHB0001126", branch: "T NAGAR, RAJAHMUNDRY" }
        ]
    }
};

// --- PDF Generation Functions ---
const generatePdfForBill = (bill, lrsInBill, showAlert, companyConfigs) => {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const config = companyConfigs[bill.companyName];
        if (!config) { showAlert("Config Error", `No bill format configured for ${bill.companyName}`); return; }
        const party = bill.billTo === 'Consignor' ? lrsInBill[0].consignor : lrsInBill[0].consignee;

        let yPos = 18;
        doc.setFontSize(22);
        doc.setFont("helvetica", "bold");
        doc.text(config.header, 105, yPos, { align: "center" });

        doc.setFontSize(10);
        doc.setFont("helvetica", "normal");
        
        if (config.address) {
            yPos += 6;
            doc.text(config.address, 105, yPos, { align: "center" });
        }
        
        if (config.panNo || config.enrollmentNo) {
            yPos += 5;
            doc.setFont("helvetica", "bold");
            const parts = [];
            if (config.panNo) parts.push(`PAN: ${config.panNo}`);
            if (config.enrollmentNo) parts.push(`Enrollment No: ${config.enrollmentNo}`);
            doc.text(parts.join(" | "), 105, yPos, { align: "center" });
            doc.setFont("helvetica", "normal");
        }

        yPos += 5;
        doc.line(14, yPos, 196, yPos);
        
        yPos += 7;
        doc.setFont("helvetica", "bold");
        doc.text(`BILL NO. ${config.prefix}/${bill.billNumber}/${getFinancialYear()}`, 14, yPos);
        doc.text(`RAJAHMUNDRY`, 196, yPos, { align: "right" });
        
        yPos += 5;
        doc.setFont("helvetica", "normal");
        doc.text(`DT: ${new Date(bill.billDate).toLocaleDateString("en-GB")}`, 196, yPos, { align: "right" });
        
        yPos += 8;
        doc.text("TO", 14, yPos);
        yPos += 6;
        doc.setFont("helvetica", "bold");
        doc.text(party.name, 14, yPos);
        yPos += 6;
        doc.setFont("helvetica", "normal");
        doc.text(party.address || "N/A", 14, yPos);
        if (party.gstin) { 
            yPos += 6; 
            doc.setFont("helvetica", "bold"); 
            doc.text(`GSTIN: ${party.gstin}`, 14, yPos); 
        }
        yPos += 10;
        doc.text("SUB: Regd - Transportation Bill.", 14, yPos);
        const processedTrucks = new Set();
        const tableBody = lrsInBill.map(lr => {
            const truckNumbersArray = (lr.truckDetails?.truckNumbers || [lr.truckDetails?.truckNumber]).filter(Boolean);
            const primaryTruck = truckNumbersArray[0] || 'N/A';
            const truckNumbersString = truckNumbersArray.join(', ');

            const originalFreight = Number(lr.billDetails?.amount) || 0;
            const ratePerTon = Number(lr.billDetails?.ratePerTon) || 0;
            const weight = Number(lr.loadingDetails?.weight) || 0;
            
            let rateForPdf, freightForPdf;
            if (ratePerTon > 0 && weight > 0) {
                rateForPdf = ratePerTon;
                freightForPdf = Math.round(ratePerTon * weight);
            } else {
                rateForPdf = originalFreight;
                freightForPdf = originalFreight;
            }
            
            let displayRate, displayFreight;
            if (processedTrucks.has(primaryTruck)) {
                displayRate = 'DO';
                displayFreight = 'DO';
            } else {
                displayRate = rateForPdf.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                displayFreight = freightForPdf.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                processedTrucks.add(primaryTruck);
            }
            
            return [
                lr.lrNumber || '',
                new Date(lr.bookingDate).toLocaleDateString("en-GB"),
                lr.loadingDetails?.loadingPoint || '',
                lr.loadingDetails?.unloadingPoint || '',
                lr.loadingDetails?.weight || '',
                displayRate,
                displayFreight,
                truckNumbersString
            ];
        });

        const totalAmount = Number(bill.totalAmount) || 0;
        const displayTotal = totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        doc.autoTable({
            startY: yPos + 5,
            head: [['LR NO', 'DATE', 'FROM', 'TO', 'WEIGHT', 'RATE', 'FREIGHT', 'TRUCK NO']],
            body: tableBody,
            theme: 'grid',
            headStyles: { halign: 'center', fontStyle: 'bold' },
            styles: { halign: 'center' },
            footStyles: { halign: 'center', fontStyle: 'bold' },
            columnStyles: {
                0: { cellWidth: 15 }, 1: { cellWidth: 22 }, 2: { cellWidth: 29 }, 3: { cellWidth: 28 },
                4: { cellWidth: 19 }, 5: { cellWidth: 26 }, 6: { cellWidth: 26 }, 7: { cellWidth: 27 }
            },
            foot: [ ['', '', '', '', '', 'TOTAL', displayTotal, ''] ],
            didDrawPage: function (data) {
                let finalY = data.cursor.y;
                doc.setFont("helvetica", "bold");
                doc.text(`Total Rupees ${numberToWords(bill.totalAmount)}`, 14, finalY + 15);
                doc.setFontSize(10);
                doc.text("* Reverse Charge Mechanism: Yes", 14, finalY + 22);
                
                finalY += 30;
                doc.setFont("helvetica", "bold");
                doc.text("OUR BANK DETAILS:", 14, finalY);
                doc.setFont("helvetica", "normal");
                
                const bankDetails = bill.bankDetails || (config.bankAccounts ? config.bankAccounts[0] : {});
                
                doc.text(bankDetails.name || config.bank || '', 14, finalY + 5);
                doc.text(config.header, 14, finalY + 10);
                doc.text(`ACCOUNT NO. ${bankDetails.ac || config.ac || ''}`, 14, finalY + 15);
                doc.text(`IFSC CODE: ${bankDetails.ifsc || config.ifsc || ''}`, 14, finalY + 20);
                doc.text(bankDetails.branch || config.bankBranch || 'RAJAHMUNDRY', 14, finalY + 25);
                
                doc.setFont("helvetica", "bold");
                doc.text(`For ${config.header}`, 196, finalY + 30, { align: "right" });

                const pageHeight = doc.internal.pageSize.getHeight();
                const pageLeftMargin = 14;
                const pageRightMargin = 196;
                let bottomY = pageHeight - 15;
                doc.setFontSize(9);
                doc.setFont("helvetica", "bold");

                if (config.phone) doc.text(`Contact: ${config.phone}`, pageLeftMargin, bottomY);
                if (config.email) doc.text(`Email: ${config.email}`, pageRightMargin, bottomY, { align: 'right' });

                doc.setFontSize(9);
                doc.setFont("helvetica", "italic");
                doc.text("*THIS IS COMPUTER GENERATED. NO SIGNATURE REQUIRED.", 105, pageHeight - 8, { align: "center" });
            }
        });

        doc.save(`Bill-${bill.billNumber}.pdf`);
    } catch (error) {
        console.error("Failed to generate PDF:", error);
        showAlert("Download Failed", "An error occurred while generating the PDF. Please check the console for details.");
    }
};

const generateDueStatementPDF = (party, bills, lrs, showAlert, companyConfigs) => {
    try {
        const { jsPDF } = window.jspdf;
        const doc = new jsPDF();
        const config = companyConfigs[party.companyName] || { header: party.companyName };
        
        doc.setFontSize(18);
        doc.setFont('helvetica', 'bold');
        doc.text(config.header, 105, 15, { align: 'center' });
        doc.setFontSize(14);
        doc.text('STATEMENT OF ACCOUNT', 105, 22, { align: 'center' });
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.text(`Date: ${new Date().toLocaleDateString('en-GB')}`, 196, 30, { align: 'right' });

        let y = 40;
        doc.setFontSize(12);
        doc.text('To:', 14, y);
        y += 6;
        doc.setFont('helvetica', 'bold');
        doc.text(party.name, 14, y);
        y += 6;
        doc.setFont('helvetica', 'normal');
        doc.text(party.address || "N/A", 14, y);

        const tableBody = [];
        let totalDue = 0;

        const unpaidBills = bills.filter(b => b.status !== 'Paid');
        
        unpaidBills.forEach(bill => {
            const billLrs = bill.lrIds.map(id => lrs.find(l => l.id === id)).filter(Boolean);
            
            billLrs.forEach((lr, index) => {
                const truckNumbersArray = (lr.truckDetails?.truckNumbers || [lr.truckDetails?.truckNumber]).filter(Boolean);
                const truckNumbersString = truckNumbersArray.join(', ') || 'N/A';

                const originalFreight = Number(lr.billDetails?.amount) || 0;
                const ratePerTon = Number(lr.billDetails?.ratePerTon) || 0;
                const weight = Number(lr.loadingDetails?.weight) || 0;
                const lrAmount = (ratePerTon > 0 && weight > 0) ? Math.round(ratePerTon * weight) : originalFreight;

                totalDue += lrAmount;

                const displayAmount = lrAmount.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

                tableBody.push([
                    index === 0 ? new Date(bill.billDate).toLocaleDateString('en-GB') : '',
                    index === 0 ? bill.billNumber : '',
                    lr.lrNumber || '',
                    truckNumbersString,
                    lr.loadingDetails?.unloadingPoint || '',
                    displayAmount
                ]);
            });
        });

        const displayTotal = totalDue.toLocaleString('en-IN', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

        doc.autoTable({
            startY: y + 10,
            head: [['BILL DATE', 'BILL NO.', 'LR NO.', 'TRUCK NO(S)', 'DESTINATION', 'AMOUNT']],
            body: tableBody,
            theme: 'grid',
            headStyles: { halign: 'center', fontStyle: 'bold' },
            styles: { halign: 'center' },
            columnStyles: { 
                0: { cellWidth: 22 }, 
                1: { cellWidth: 22 }, 
                2: { cellWidth: 20 }, 
                3: { cellWidth: 45 }, 
                4: { cellWidth: 43 }, 
                5: { cellWidth: 30, halign: 'right' } 
            },
            foot: [ ['', '', '', '', 'Total Due:', displayTotal] ],
            footStyles: { halign: 'right', fontStyle: 'bold' },
        });
        
        doc.save(`Due-Statement-${party.name}-${party.companyName}.pdf`);
    } catch (error) {
        console.error("Failed to generate Statement PDF:", error);
        showAlert("Download Failed", "An error occurred while generating the Statement PDF.");
    }
};

// --- UI Components ---
const AlertModal = ({ title, message, onClose }) => ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"> <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm"> <div className="flex items-start gap-4"> <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 sm:mx-0 sm:h-10 sm:w-10"> <InfoIcon className="h-6 w-6 text-blue-600" /> </div> <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"> <h3 className="text-lg leading-6 font-medium text-gray-900">{title}</h3> <div className="mt-2"> <p className="text-sm text-gray-500">{message}</p> </div> </div> </div> <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse"> <button onClick={onClose} className="btn-primary w-full sm:w-auto">OK</button> </div> </div> <style>{`.btn-primary{background:#4F46E5; color:white; padding:8px 16px; border-radius:8px; font-weight:500;} .btn-primary:hover{background:#4338CA;}`}</style> </div> );
const ConfirmModal = ({ message, onConfirm, onCancel }) => ( <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4"> <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-sm"> <div className="flex items-start gap-4"> <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100 sm:mx-0 sm:h-10 sm:w-10"><AlertTriangleIcon className="h-6 w-6 text-red-600" /></div> <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left"> <h3 className="text-lg leading-6 font-medium text-gray-900">Confirm Action</h3> <div className="mt-2"><p className="text-sm text-gray-500">{message}</p></div> </div> </div> <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse gap-3"> <button onClick={onConfirm} className="btn-danger w-full sm:w-auto">Delete</button> <button onClick={onCancel} className="btn-secondary w-full sm:w-auto mt-2 sm:mt-0">Cancel</button> </div> </div> <style>{`.btn-danger { background-color: #DC2626; color: white; padding: 8px 16px; border-radius: 8px; font-weight: 500; } .btn-danger:hover { background-color: #B91C1C; } .btn-secondary { background-color: #E5E7EB; color: #374151; padding: 8px 16px; border-radius: 8px; font-weight: 500; } .btn-secondary:hover { background-color: #D1D5DB; }`}</style> </div> );

const PaymentModal = ({ bill, onClose, onSave }) => {
    const [receivedAmount, setReceivedAmount] = useState(bill.totalAmount || 0);
    const [deductionAmount, setDeductionAmount] = useState(0);
    const [deductionReason, setDeductionReason] = useState('');
    const [paymentDate, setPaymentDate] = useState(new Date().toISOString().split('T')[0]);
    const [remarks, setRemarks] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        onSave({
            receivedAmount: Number(receivedAmount),
            deductionAmount: Number(deductionAmount),
            deductionReason,
            paymentDate,
            remarks,
            status: 'Paid'
        });
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4 text-slate-800 border-b pb-2">Mark Bill #{bill.billNumber} as Paid</h3>
                <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <Input label="Amount Received (₹)" type="number" step="0.01" value={receivedAmount} onChange={e => setReceivedAmount(e.target.value)} required />
                    <Input label="Deduction Amount (₹)" type="number" step="0.01" value={deductionAmount} onChange={e => setDeductionAmount(e.target.value)} />
                    <Input label="Reason for Deduction" type="text" value={deductionReason} onChange={e => setDeductionReason(e.target.value)} placeholder="e.g., TDS, Shortage" />
                    <Input label="Remarks (Optional)" type="text" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any additional information..." />
                    <Input label="Payment Received Date" type="date" value={paymentDate} onChange={e => setPaymentDate(e.target.value)} required />
                    
                    <div className="flex justify-end gap-2 pt-4">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" className="btn-primary bg-green-600 hover:bg-green-700">Save Payment</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

const NavButton = ({ icon, label, active, onClick }) => (<button onClick={onClick} className={`flex items-center gap-2 px-3 py-2 rounded-md font-semibold text-sm transition-colors ${active ? 'bg-indigo-600 text-white shadow-sm' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'}`}>{React.cloneElement(icon, { className: 'h-5 w-5' })} {label}</button>);
const Section = ({ title, children, gridCols = 'md:grid-cols-3' }) => <div className="py-4"><h3 className="font-bold text-lg mb-4 text-slate-700 border-b pb-2">{title}</h3><div className={`grid grid-cols-1 gap-4 ${gridCols}`}>{children}</div></div>;
const Input = ({ label, as = 'input', children, ...props }) => <div className="flex flex-col"><label className="text-sm font-medium mb-1 text-slate-600">{label}</label>{React.createElement(as, { ...props, className:"p-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" }, children)}</div>;
const PartySelector = ({ parties, onSelect, onAddNew, selectedPartyName }) => <select value={parties.find(p=>p.name === selectedPartyName)?.id || ''} onChange={(e) => e.target.value === 'add_new' ? onAddNew() : onSelect(parties.find(p => p.id === e.target.value))} className="p-2 border rounded-md w-full bg-white"><option value="">Select Party</option>{parties.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}<option value="add_new" className="font-bold text-indigo-600">... Add New Party ...</option></select>;
const InfoBox = ({ data }) => <div className="mt-2 text-sm bg-slate-50 p-3 rounded-md min-h-[6rem] border"><p className="font-semibold text-slate-700">Address:</p><p className="text-slate-600">{data?.address || 'N/A'}</p><p className="font-semibold text-slate-700 mt-1">GSTIN:</p><p className="text-slate-600">{data?.gstin || 'N/A'}</p></div>;

function PartyFormModal({ party, onSave, onCancel, showAlert }) {
    const [formData, setFormData] = useState(party || { name: '', address: '', gstin: '', mobile: '', email: '' });
    useEffect(() => { setFormData(party || { name: '', address: '', gstin: '', mobile: '', email: '' }); }, [party]);
    const handleChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleSave = () => { if (!formData.name) { showAlert("Validation Error", "Party name is required."); return; } onSave(formData); };
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 p-4">
            <div className="bg-white p-6 rounded-lg shadow-xl w-full max-w-md">
                <h3 className="text-lg font-bold mb-4">{party ? 'Edit Party' : 'Add New Party'}</h3>
                <div className="space-y-4">
                    <Input label="Party Name (Required)" name="name" value={formData.name} onChange={handleChange} />
                    <Input label="Address" name="address" value={formData.address} onChange={handleChange} />
                    <Input label="GSTIN" name="gstin" value={formData.gstin} onChange={handleChange} />
                    <Input label="Mobile Number" name="mobile" value={formData.mobile || ''} onChange={handleChange} placeholder="Contact Number" />
                    <Input label="Email Address" name="email" type="email" value={formData.email || ''} onChange={handleChange} placeholder="email@example.com" />
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button type="button" onClick={onCancel} className="btn-secondary">Cancel</button>
                    <button type="button" onClick={handleSave} className="btn-primary">Save Party</button>
                </div>
            </div>
        </div>
    );
}

// --- View Components ---
function LrView({ lrs, bills, handleEditLr, handleDelete, setView, handleDeleteRequest, selectedMonth, setSelectedMonth }) {
    const [activeCompany, setActiveCompany] = useState('ALL');
    const companies = ['ALL', 'SAI KUMAR TRANSPORT', 'SRI KUMAR TRANSPORT', 'GLOBAL LOGISTICS'];
    const billedLrIds = new Set(bills.flatMap(b => b.lrIds));

    const sortedLrs = useMemo(() => {
        const filtered = lrs
            .filter(lr => activeCompany === 'ALL' || lr.companyName === activeCompany)
            .filter(lr => {
                if (!selectedMonth) return true;
                return lr.bookingDate.startsWith(selectedMonth);
            });

        return [...filtered].sort((a, b) => {
            if (activeCompany === 'ALL') {
                return b.bookingDate.localeCompare(a.bookingDate);
            }
            return alphanumericComparator(a.lrNumber, b.lrNumber); // Ascending Order for Alphanumeric LRs
        });
    }, [lrs, activeCompany, selectedMonth]);

    return (
        <div>
            <div className="flex flex-col sm:flex-row justify-between items-center mb-4 gap-2">
                <h2 className="text-2xl font-bold text-slate-800">Lorry Receipts</h2>
                <div className="flex gap-2 items-center">
                    <Input label="Filter by Month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                    <button onClick={() => setView('add_lr')} className="btn-primary flex items-center gap-2 mt-6"><PlusCircleIcon className="h-5 w-5"/>Add New LR</button>
                </div>
            </div>
            <div className="border-b border-slate-200 mb-4 flex-wrap flex">
                {companies.map(c => <button key={c} onClick={() => setActiveCompany(c)} className={`py-2 px-4 text-sm font-medium ${activeCompany === c ? 'border-b-2 border-indigo-500 text-indigo-600' : 'text-slate-500 hover:text-slate-800'}`}>{c}</button>)}
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead><tr><th className="th">LR No.</th><th className="th">Date</th><th className="th">Company</th><th className="th">Consignee</th><th className="th">Status</th><th className="th">Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedLrs.map(lr => (
                            <tr key={lr.id}>
                                <td className="td">{lr.lrNumber}</td>
                                <td className="td">{lr.bookingDate}</td>
                                <td className="td">{lr.companyName}</td>
                                <td className="td">{lr.consignee?.name}</td>
                                <td className="td"><span className={`px-2 py-1 text-xs font-semibold rounded-full ${billedLrIds.has(lr.id) ? 'bg-blue-100 text-blue-800' : 'bg-slate-100 text-slate-800'}`}>{billedLrIds.has(lr.id) ? 'Billed' : 'Unbilled'}</span></td>
                                <td className="td flex gap-4">
                                    <button onClick={() => handleEditLr(lr)} className="text-indigo-600 font-semibold">Edit</button>
                                    <button onClick={() => handleDeleteRequest(`Are you sure you want to delete LR #${lr.lrNumber}?`, () => handleDelete(lr.id, 'lrs'))} className="text-red-600 font-semibold">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`.th{text-align:left; padding:12px 8px; font-weight:600; color: #4B5563; background-color:#F9FAFB;} .td{padding:12px 8px; white-space:nowrap;} .btn-primary{background:#4F46E5; color:white; padding:8px 16px; border-radius:8px; justify-content:center;}`}</style>
        </div>
    );
}

function LrForm({ userId, setView, parties, existingLr, showAlert, onEditParty }) {
    const getInitialData = useCallback(() => ({ companyName: 'SAI KUMAR TRANSPORT', lrNumber: '', bookingDate: new Date().toISOString().split('T')[0], truckDetails: { truckNumbers: [''] }, loadingDetails: { loadingPoint: '', unloadingPoint: '', articles: '', weight: '' }, consignor: { name: '', address: '', gstin: '' }, consignee: { name: '', address: '', gstin: '' }, billDetails: { amount: '', ratePerTon: '' }, isBilled: false }), []);
    const [formData, setFormData] = useState(existingLr || getInitialData());
    useEffect(() => { if (existingLr) { const truckDetails = existingLr.truckDetails || {}; const truckNumbers = Array.isArray(truckDetails.truckNumbers) && truckDetails.truckNumbers.length > 0 ? truckDetails.truckNumbers : (truckDetails.truckNumber ? [truckDetails.truckNumber] : ['']); setFormData({ ...existingLr, truckDetails: { ...truckDetails, truckNumbers } }); } else { setFormData(getInitialData()); } }, [existingLr, getInitialData]);
    const handlePartySelect = (party, type) => { if (party) setFormData(prev => ({ ...prev, [type]: { name: party.name, address: party.address, gstin: party.gstin } }));};
    const handleChange = (e, section, field) => setFormData(prev => ({ ...prev, [section]: { ...prev[section], [field]: e.target.value } }));
    const handleRootChange = (e) => setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    const handleTruckNumberChange = (e, index) => { const newTruckNumbers = [...(formData.truckDetails.truckNumbers || [])]; newTruckNumbers[index] = e.target.value; setFormData(prev => ({ ...prev, truckDetails: { ...prev.truckDetails, truckNumbers: newTruckNumbers }})); };
    const addTruckNumberField = () => { const currentTrucks = formData.truckDetails.truckNumbers || []; setFormData(prev => ({ ...prev, truckDetails: { ...prev.truckDetails, truckNumbers: [...currentTrucks, ''] }})); };
    const removeTruckNumberField = (index) => { const newTruckNumbers = formData.truckDetails.truckNumbers.filter((_, i) => i !== index); setFormData(prev => ({ ...prev, truckDetails: { ...prev.truckDetails, truckNumbers: newTruckNumbers }})); };
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!formData.lrNumber || !formData.billDetails?.amount) { showAlert("Validation Error", "LR Number and Freight Amount are required."); return; }
        const finalFormData = { ...formData, truckDetails: { ...formData.truckDetails, truckNumbers: formData.truckDetails.truckNumbers.filter(num => num && num.trim() !== '') } };
        try {
            if (existingLr && existingLr.id) {
                const { id, ...dataToSave } = finalFormData;
                const lrRef = doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/lrs` : `users/${userId}/lrs`, id);
                await setDoc(lrRef, dataToSave);
            } else {
                await addDoc(collection(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/lrs` : `users/${userId}/lrs`), finalFormData);
            }
            showAlert("Success", `LR #${finalFormData.lrNumber} saved successfully!`);
            setView('lrs');
        } catch (error) { console.error("Error saving LR:", error); showAlert("Save Failed", "Could not save the LR data."); }
    };
    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold">{existingLr ? `Edit LR #${existingLr.lrNumber}` : 'Create Lorry Receipt'}</h2>
            <Section title="Core Details">
                <Input label="Company" name="companyName" value={formData.companyName} onChange={handleRootChange} as="select">
                    <option>SAI KUMAR TRANSPORT</option><option>SRI KUMAR TRANSPORT</option><option>GLOBAL LOGISTICS</option>
                </Input>
                <Input label="LR Number" name="lrNumber" value={formData.lrNumber} onChange={handleRootChange} required />
                <Input label="Booking Date" name="bookingDate" type="date" value={formData.bookingDate} onChange={handleRootChange} required />
            </Section>
            <Section title="Party Details" gridCols="lg:grid-cols-2">
                <div>
                    <h3 className="font-semibold mb-2 text-slate-600">Consignor (Sender)</h3>
                    <PartySelector parties={parties} selectedPartyName={formData.consignor?.name} onSelect={(p) => handlePartySelect(p, 'consignor')} onAddNew={() => onEditParty()} />
                    <InfoBox data={formData.consignor} />
                </div>
                <div>
                    <h3 className="font-semibold mb-2 text-slate-600">Consignee (Receiver)</h3>
                    <PartySelector parties={parties} selectedPartyName={formData.consignee?.name} onSelect={(p) => handlePartySelect(p, 'consignee')} onAddNew={() => onEditParty()}/>
                    <InfoBox data={formData.consignee} />
                </div>
            </Section>
            <Section title="Shipment & Freight">
                <Input label="Loading Point" value={formData.loadingDetails.loadingPoint || ''} onChange={(e) => handleChange(e, 'loadingDetails', 'loadingPoint')} />
                <Input label="Unloading Point" value={formData.loadingDetails.unloadingPoint || ''} onChange={(e) => handleChange(e, 'loadingDetails', 'unloadingPoint')} />
                <Input label="Articles" value={formData.loadingDetails.articles || ''} onChange={(e) => handleChange(e, 'loadingDetails', 'articles')} />
                <Input label="Weight" value={formData.loadingDetails.weight || ''} onChange={(e) => handleChange(e, 'loadingDetails', 'weight')} />
                <div className="md:col-span-3 space-y-2">
                    <label className="text-sm font-medium mb-1 text-slate-600">Truck Numbers</label>
                    {(formData.truckDetails?.truckNumbers || ['']).map((truckNumber, index) => (
                        <div key={index} className="flex items-center gap-2">
                            <input type="text" value={truckNumber} onChange={(e) => handleTruckNumberChange(e, index)} className="p-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 w-full" placeholder={`Truck Number ${index + 1}`} />
                            {formData.truckDetails.truckNumbers.length > 1 && ( <button type="button" onClick={() => removeTruckNumberField(index)} className="p-2 text-red-500 hover:text-red-700"> Remove </button> )}
                        </div>
                    ))}
                    <button type="button" onClick={addTruckNumberField} className="text-indigo-600 font-semibold text-sm mt-2">Add Another Truck</button>
                </div>
                <Input label="Freight Amount (₹)" type="number" step="0.01" value={formData.billDetails.amount || ''} onChange={(e) => handleChange(e, 'billDetails', 'amount')} required />
                <Input label="Rate per Ton (Optional)" type="number" step="0.01" value={formData.billDetails.ratePerTon || ''} onChange={(e) => handleChange(e, 'billDetails', 'ratePerTon')} />
            </Section>
            <div className="flex justify-end gap-4 pt-4 border-t">
                <button type="button" onClick={() => setView('lrs')} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">Save LR</button>
            </div>
            <style>{`.btn-primary{background:#4F46E5; color:white; padding:8px 16px; border-radius:8px;} .btn-secondary{background:#E5E7EB; color:#374151; padding:8px 16px; border-radius:8px;}`}</style>
        </form>
    );
}

function BillingView({ userId, setView, bills, lrs, handleDeleteRequest, handleEditBill, showAlert, selectedMonth, setSelectedMonth, companyConfigs }) {
    const [paymentBill, setPaymentBill] = useState(null);

    const handleDeleteBill = async (billId, lrIds) => {
        const batch = writeBatch(db);
        const billRef = doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/bills` : `users/${userId}/bills`, billId);
        batch.delete(billRef);
        lrIds.forEach(lrId => {
            const lrRef = doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/lrs` : `users/${userId}/lrs`, lrId);
            batch.update(lrRef, { isBilled: false });
        });
        await batch.commit();
    };

    const handleDownload = (bill) => {
        if (!window.jspdf || !window.jspdf.jsPDF) { showAlert("Library Error", "jsPDF is not available."); return; }
        const lrsInBill = bill.lrIds.map(id => lrs.find(lr => lr.id === id)).filter(Boolean);
        if (lrsInBill.length > 0) generatePdfForBill(bill, lrsInBill, showAlert, companyConfigs);
        else showAlert("Data Not Found", "Shipment data for this bill could not be found.");
    };

    const handleSavePayment = async (paymentData) => {
        try {
            const billRef = doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/bills` : `users/${userId}/bills`, paymentBill.id);
            await updateDoc(billRef, paymentData);
            setPaymentBill(null);
            showAlert("Success", "Payment details saved successfully.");
        } catch (error) {
            console.error("Error marking bill as paid:", error);
            showAlert("Error", "Could not update the bill status.");
        }
    };

    const sortedBills = useMemo(() => {
        return bills
            .filter(bill => {
                if (!selectedMonth) return true;
                return bill.billDate.startsWith(selectedMonth);
            })
            .sort((a, b) => alphanumericComparator(a.billNumber, b.billNumber)); // Ascending Order for alphanumeric Bills
    }, [bills, selectedMonth]);

    return (
        <div>
            {paymentBill && <PaymentModal bill={paymentBill} onClose={() => setPaymentBill(null)} onSave={handleSavePayment} />}
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Billing</h2>
                <div className="flex flex-wrap gap-2 items-center">
                    <Input label="Filter by Month" type="month" value={selectedMonth} onChange={(e) => setSelectedMonth(e.target.value)} />
                    <button onClick={() => setView('create_bill')} className="btn-primary flex items-center gap-2 mt-6"><PlusCircleIcon/>Create Bill</button>
                </div>
            </div>
            <div className="space-y-3">
                {sortedBills.map(bill => (
                    <div key={bill.id} className={`p-4 border rounded-lg transition-shadow hover:shadow-md ${bill.status === 'Paid' ? 'bg-green-50' : 'bg-slate-50'}`}>
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <p className="font-bold text-slate-800">{bill.companyName} - Bill #{bill.billNumber}</p>
                                <p className="text-sm text-slate-600">{bill.partyName}</p>
                                <div className="mt-2">
                                    <span className={`inline-block px-2 py-1 text-xs font-semibold rounded-full ${bill.status === 'Paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-200 text-yellow-800'}`}>
                                        {bill.status || 'Due'}
                                    </span>
                                </div>
                                {bill.status === 'Paid' && (
                                    <div className="mt-3 text-sm text-green-800 bg-green-100 p-2 rounded-md border border-green-200 inline-block">
                                        <p><strong>Paid on:</strong> {new Date(bill.paymentDate).toLocaleDateString('en-GB')} | <strong>Received:</strong> ₹{Number(bill.receivedAmount).toFixed(2)}</p>
                                        {bill.deductionAmount > 0 && (
                                            <p className="mt-1 text-red-600"><strong>Deduction:</strong> ₹{Number(bill.deductionAmount).toFixed(2)} <em>({bill.deductionReason})</em></p>
                                        )}
                                        {bill.remarks && (
                                            <p className="mt-1 text-slate-700"><strong>Remarks:</strong> {bill.remarks}</p>
                                        )}
                                    </div>
                                )}
                            </div>
                            <div className="flex items-center gap-2 self-end sm:self-center">
                                <span className="font-bold text-lg text-slate-700">₹{bill.totalAmount.toFixed(2)}</span>
                                <button onClick={() => handleDownload(bill)} className="btn-icon"><DownloadIcon className="h-5 w-5"/></button>
                                {bill.status !== 'Paid' && (
                                    <button onClick={() => setPaymentBill(bill)} title="Mark as Paid" className="p-2 rounded-md bg-green-500 text-white hover:bg-green-600 transition-colors">
                                        <CheckCircleIcon className="h-5 w-5"/>
                                    </button>
                                )}
                                <button onClick={() => handleEditBill(bill)} className="text-indigo-600 font-semibold px-2">Edit</button>
                                <button onClick={() => handleDeleteRequest(`Delete Bill #${bill.billNumber}? Associated LRs will be marked as unbilled.`, () => handleDeleteBill(bill.id, bill.lrIds))} className="btn-icon-danger">Delete</button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
            <style>{`.btn-primary{background:#4F46E5; color:white; padding:8px 16px; border-radius:8px; font-weight:500;} .btn-icon{background:#E5E7EB; color:#374151; padding:8px; border-radius:8px;} .btn-icon-danger{background:#FEE2E2; color:#DC2626; padding:8px; border-radius:8px;}`}</style>
        </div>
    );
}

function CreateBillForm({ userId, setView, lrs, showAlert, companyConfigs, editingBill }) {
    const [billNumber, setBillNumber] = useState('');
    const [billDate, setBillDate] = useState(new Date().toISOString().split('T')[0]);
    const [selectedLrs, setSelectedLrs] = useState([]);
    const [companyName, setCompanyName] = useState('GLOBAL LOGISTICS');
    const [billTo, setBillTo] = useState('Consignee');
    const [partyName, setPartyName] = useState('');
    const [bankAccountIndex, setBankAccountIndex] = useState(0);

    useEffect(() => {
        if (editingBill) {
            setBillNumber(editingBill.billNumber); setBillDate(editingBill.billDate); setCompanyName(editingBill.companyName);
            setBillTo(editingBill.billTo); setPartyName(editingBill.partyName); setSelectedLrs(editingBill.lrIds);
            if (editingBill.bankDetails && companyConfigs[editingBill.companyName]?.bankAccounts) {
                const idx = companyConfigs[editingBill.companyName].bankAccounts.findIndex(acc => acc.ac === editingBill.bankDetails.ac);
                if (idx !== -1) setBankAccountIndex(idx);
            }
        }
    }, [editingBill, companyConfigs]);

    const availableLrs = useMemo(() => {
        return lrs.filter(lr => lr.companyName === companyName && (!lr.isBilled || (editingBill && editingBill.lrIds.includes(lr.id))));
    }, [lrs, companyName, editingBill]);

    const handleCompanyChange = (e) => { setCompanyName(e.target.value); setSelectedLrs([]); setPartyName(''); setBankAccountIndex(0); };
    const handleLrSelection = (lrId) => {
        const lr = availableLrs.find(l => l.id === lrId);
        if (!lr) return;
        const currentParty = billTo === 'Consignor' ? lr.consignor.name : lr.consignee.name;
        if (selectedLrs.length === 0) { setPartyName(currentParty); setSelectedLrs([lrId]); } 
        else if (partyName === currentParty) { setSelectedLrs(prev => prev.includes(lrId) ? prev.filter(id => id !== lrId) : [...prev, lrId]); } 
        else { showAlert("Party Mismatch", `Please select LRs for the same party (${partyName}).`); }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!billNumber || selectedLrs.length === 0) { showAlert("Validation Error", "Please provide a bill number and select at least one LR."); return; }
        const totalAmount = selectedLrs.reduce((sum, lrId) => {
            const lr = lrs.find(l => l.id === lrId);
            if (!lr) return sum;
            const originalFreight = parseFloat(lr.billDetails?.amount) || 0;
            const ratePerTon = parseFloat(lr.billDetails?.ratePerTon) || 0;
            const weight = parseFloat(lr.loadingDetails?.weight) || 0;
            return sum + ((ratePerTon > 0 && weight > 0) ? Math.round(ratePerTon * weight) : originalFreight);
        }, 0);
        
        const config = companyConfigs[companyName];
        const selectedBankDetails = config.bankAccounts ? config.bankAccounts[bankAccountIndex] : null;

        const newBillData = { billNumber, billDate, companyName, billTo, partyName, lrIds: selectedLrs, totalAmount, status: editingBill ? editingBill.status : 'Due', bankDetails: selectedBankDetails };
        
        const batch = writeBatch(db);
        if (editingBill) {
            batch.update(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/bills` : `users/${userId}/bills`, editingBill.id), newBillData);
            editingBill.lrIds.filter(id => !selectedLrs.includes(id)).forEach(id => batch.update(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/lrs` : `users/${userId}/lrs`, id), { isBilled: false }));
        } else {
            batch.set(doc(collection(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/bills` : `users/${userId}/bills`)), newBillData);
        }
        selectedLrs.forEach(lrId => batch.update(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/lrs` : `users/${userId}/lrs`, lrId), { isBilled: true }));
        await batch.commit();
        setView('billing');
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            <h2 className="text-2xl font-bold">{editingBill ? `Edit Bill #${editingBill.billNumber}` : 'Create New Bill'}</h2>
            <Section title="Bill Details">
                <Input label="Bill Number" value={billNumber} onChange={e => setBillNumber(e.target.value)} required />
                <Input label="Bill Date" type="date" value={billDate} onChange={e => setBillDate(e.target.value)} />
                <Input label="Company" value={companyName} as="select" onChange={handleCompanyChange} disabled={!!editingBill}>
                    <option>GLOBAL LOGISTICS</option><option>SRI KUMAR TRANSPORT</option><option>SAI KUMAR TRANSPORT</option>
                </Input>
                {companyConfigs[companyName]?.bankAccounts?.length > 0 && (
                    <div className="flex flex-col">
                        <label className="text-sm font-medium mb-1 text-slate-600">Select Bank Account</label>
                        <select value={bankAccountIndex} onChange={(e) => setBankAccountIndex(Number(e.target.value))} className="p-2 border rounded-md bg-white focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500">
                            {companyConfigs[companyName].bankAccounts.map((bank, index) => <option key={index} value={index}>{bank.name} - {bank.ac}</option>)}
                        </select>
                    </div>
                )}
                <Input label="Bill To" value={billTo} as="select" onChange={e => {setBillTo(e.target.value); setSelectedLrs([]); setPartyName('');}} disabled={!!editingBill}>
                    <option value="Consignee">Consignee</option><option value="Consignor">Consignor</option>
                </Input>
            </Section>
            <Section title={`Select LRs for ${companyName}`}>
                {partyName && <p className="font-semibold text-indigo-600 mb-2">Billing To Party: {partyName}</p>}
                <div className="max-h-60 overflow-y-auto space-y-2 p-2 bg-slate-50 border rounded-md">
                    {availableLrs.length > 0 ? availableLrs.map(lr => {
                        const originalFreight = parseFloat(lr.billDetails?.amount) || 0;
                        const ratePerTon = parseFloat(lr.billDetails?.ratePerTon) || 0;
                        const weight = parseFloat(lr.loadingDetails?.weight) || 0;
                        const displayAmount = (ratePerTon > 0 && weight > 0) ? Math.round(ratePerTon * weight).toFixed(2) : originalFreight.toFixed(2);
                        const isSelected = selectedLrs.includes(lr.id);
                        return (
                            <div key={lr.id} onClick={() => handleLrSelection(lr.id)} className={`p-3 border rounded-md cursor-pointer transition-colors ${isSelected ? 'bg-indigo-100 border-indigo-300' : 'bg-white hover:bg-indigo-50'}`}>
                                <p className="font-semibold">LR #{lr.lrNumber} - <span className="font-normal">{billTo === 'Consignor' ? lr.consignor.name : lr.consignee.name}</span> - <span className="font-bold">₹{displayAmount}</span>
                                {editingBill && editingBill.lrIds.includes(lr.id) && <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded">Current</span>}
                                </p>
                            </div>
                        )
                    }) : <p className="text-slate-500 text-center p-4">No available LRs found for this company.</p>}
                </div>
            </Section>
            <div className="flex justify-end gap-4">
                <button type="button" onClick={() => setView('billing')} className="btn-secondary">Cancel</button>
                <button type="submit" className="btn-primary">{editingBill ? 'Update Bill' : 'Create Bill'}</button>
            </div>
            <style>{`.btn-primary{background:#4F46E5; color:white; padding:8px 16px; border-radius:8px;} .btn-secondary{background:#E5E7EB; color:#374151; padding:8px 16px; border-radius:8px;}`}</style>
        </form>
    );
}

function PartiesView({ parties, handleDelete, handleDeleteRequest, onEditParty, showAlert }) {
    const sortedParties = useMemo(() => {
        return [...parties].sort((a, b) => {
            const nameCompare = (a.name || '').localeCompare(b.name || '');
            if (nameCompare !== 0) return nameCompare;
            const dateA = a.createdAt ? new Date(a.createdAt) : new Date(0);
            const dateB = b.createdAt ? new Date(b.createdAt) : new Date(0);
            return dateB - dateA;
        });
    }, [parties]);

    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Manage Parties</h2>
                <div className="flex gap-2">
                    <button onClick={() => onEditParty()} className="btn-primary flex items-center gap-2">
                        <PlusCircleIcon className="h-5 w-5"/> Add Party
                    </button>
                </div>
            </div>
            <div className="overflow-x-auto">
                <table className="min-w-full text-sm">
                    <thead><tr><th className="th">Name</th><th className="th">Address</th><th className="th">Mobile</th><th className="th">Email</th><th className="th">GSTIN</th><th className="th">Actions</th></tr></thead>
                    <tbody className="divide-y divide-slate-100">
                        {sortedParties.map(p => (
                            <tr key={p.id}>
                                <td className="td font-semibold text-slate-700">{p.name}</td>
                                <td className="td">{p.address}</td>
                                <td className="td">{p.mobile || '-'}</td>
                                <td className="td text-blue-600">{p.email || '-'}</td>
                                <td className="td">{p.gstin}</td>
                                <td className="td flex gap-4">
                                    <button onClick={() => onEditParty(p)} className="text-indigo-600 font-semibold">Edit</button>
                                    <button onClick={() => handleDeleteRequest(`Are you sure you want to delete party '${p.name}'?`, () => handleDelete(p.id, 'parties'))} className="text-red-600 font-semibold">Delete</button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
            <style>{`.th{text-align:left; padding:12px 8px; font-weight:600; color:#4B5563; background-color:#F9FAFB;} .td{padding:12px 8px;} .btn-primary{background:#4F46E5; color:white; padding:8px 16px; border-radius:8px;} `}</style>
        </div>
    );
}

function CompanySettingsView({ companyConfigs, setCompanyConfigs, userId, showAlert }) {
    const [selectedCompany, setSelectedCompany] = useState(Object.keys(companyConfigs)[0]);
    const [details, setDetails] = useState({ panNo: '', enrollmentNo: '', address: '', phone: '', email: '' });
    const [newAccount, setNewAccount] = useState({ name: '', ac: '', ifsc: '', branch: '' });

    useEffect(() => {
        const conf = companyConfigs[selectedCompany] || {};
        setDetails({
            panNo: conf.panNo || '',
            enrollmentNo: conf.enrollmentNo || '',
            address: conf.address || '',
            phone: conf.phone || '',
            email: conf.email || '',
        });
    }, [selectedCompany, companyConfigs]);

    const handleSaveCompanyDetails = async () => {
        const updatedConfig = { 
            ...companyConfigs, 
            [selectedCompany]: { ...companyConfigs[selectedCompany], ...details } 
        };
        try {
            await setDoc(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/settings` : `users/${userId}/settings`, 'companyConfigs'), updatedConfig);
            setCompanyConfigs(updatedConfig);
            showAlert("Success", "Company details successfully updated!");
        } catch (error) {
            console.error(error);
            showAlert("Error", "Could not save company details.");
        }
    };

    const handleAddAccount = async () => {
        if (!newAccount.name || !newAccount.ac) { showAlert("Validation Error", "Bank Name and Account Number are required."); return; }
        const updatedConfig = { ...companyConfigs };
        if (!updatedConfig[selectedCompany].bankAccounts) updatedConfig[selectedCompany].bankAccounts = [];
        updatedConfig[selectedCompany].bankAccounts.push({ ...newAccount });

        try {
            await setDoc(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/settings` : `users/${userId}/settings`, 'companyConfigs'), updatedConfig);
            setCompanyConfigs(updatedConfig);
            setNewAccount({ name: '', ac: '', ifsc: '', branch: '' });
            showAlert("Success", "Bank account added.");
        } catch (error) { showAlert("Error", "Could not save bank account."); }
    };

    const handleRemoveAccount = async (index) => {
        const updatedConfig = { ...companyConfigs };
        updatedConfig[selectedCompany].bankAccounts.splice(index, 1);
        try {
            await setDoc(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${userId}/settings` : `users/${userId}/settings`, 'companyConfigs'), updatedConfig);
            setCompanyConfigs(updatedConfig);
            showAlert("Success", "Bank account removed.");
        } catch (error) { showAlert("Error", "Could not remove bank account."); }
    };

    return (
        <div className="max-w-5xl mx-auto">
            <h2 className="text-2xl font-bold mb-6">Manage Company Settings</h2>
            
            <div className="bg-white p-6 rounded-lg shadow border mb-6">
                <Input label="Select Company to Edit" value={selectedCompany} as="select" onChange={(e) => setSelectedCompany(e.target.value)}>
                    {Object.keys(companyConfigs).map(name => <option key={name} value={name}>{name}</option>)}
                </Input>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                <div className="bg-white p-6 rounded-lg border shadow-sm">
                    <h3 className="font-bold text-lg mb-4 text-slate-700 border-b pb-2">Company Information</h3>
                    <div className="space-y-4">
                        <Input label="PAN Number" value={details.panNo} onChange={(e) => setDetails({...details, panNo: e.target.value.toUpperCase()})} placeholder="e.g. ABCDE1234F" />
                        <Input label="Enrollment No (Optional)" value={details.enrollmentNo} onChange={(e) => setDetails({...details, enrollmentNo: e.target.value})} />
                        <Input label="Full Address" value={details.address} onChange={(e) => setDetails({...details, address: e.target.value})} />
                        <Input label="Contact Numbers" value={details.phone} onChange={(e) => setDetails({...details, phone: e.target.value})} />
                        <Input label="Email Address" value={details.email} onChange={(e) => setDetails({...details, email: e.target.value})} />
                        <button onClick={handleSaveCompanyDetails} className="w-full btn-primary mt-2 bg-indigo-600 hover:bg-indigo-700">Save Information</button>
                    </div>
                </div>

                <div className="space-y-6">
                    <div className="bg-white p-6 rounded-lg border shadow-sm">
                        <h3 className="font-bold text-lg mb-4 text-slate-700 border-b pb-2">Add Bank Account</h3>
                        <div className="space-y-3">
                            <Input label="Bank Name" value={newAccount.name} onChange={(e) => setNewAccount({...newAccount, name: e.target.value})} placeholder="e.g., HDFC Bank" />
                            <Input label="Account Number" value={newAccount.ac} onChange={(e) => setNewAccount({...newAccount, ac: e.target.value})} />
                            <Input label="IFSC Code" value={newAccount.ifsc} onChange={(e) => setNewAccount({...newAccount, ifsc: e.target.value})} />
                            <Input label="Branch / Address" value={newAccount.branch} onChange={(e) => setNewAccount({...newAccount, branch: e.target.value})} />
                            <button onClick={handleAddAccount} className="w-full btn-primary mt-2">Add Account</button>
                        </div>
                    </div>
                    
                    <div className="bg-slate-50 p-6 rounded-lg border">
                        <h3 className="font-bold text-lg mb-4 text-slate-700">Existing Bank Accounts</h3>
                        <div className="space-y-3 max-h-60 overflow-y-auto pr-2">
                            {companyConfigs[selectedCompany].bankAccounts?.map((account, index) => (
                                <div key={index} className="p-3 bg-white border rounded shadow-sm flex justify-between items-start">
                                    <div>
                                        <p className="font-bold text-indigo-700">{account.name}</p>
                                        <p className="text-sm">A/C: {account.ac}</p>
                                        <p className="text-sm text-slate-500">IFSC: {account.ifsc}</p>
                                    </div>
                                    <button onClick={() => handleRemoveAccount(index)} className="text-red-500 hover:text-red-700 text-sm font-semibold">Remove</button>
                                </div>
                            ))}
                            {(!companyConfigs[selectedCompany].bankAccounts || companyConfigs[selectedCompany].bankAccounts.length === 0) && (
                                <p className="text-slate-500 italic">No bank accounts configured.</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
            <style>{`.btn-primary{background:#4F46E5; color:white; padding:8px 16px; border-radius:8px; font-weight:500;}`}</style>
        </div>
    );
}

function StatementView({ bills, lrs, parties, showAlert, companyConfigs }) {
    const billsByPartyAndCompany = bills.reduce((acc, bill) => {
        const party = parties.find(p => p.name === bill.partyName);
        if (party) {
            const key = `${party.id}-${bill.companyName}`;
            if (!acc[key]) {
                acc[key] = {
                    partyId: party.id, partyName: party.name, partyAddress: party.address,
                    companyName: bill.companyName, bills: [],
                    totalBilled: 0, totalPaid: 0, totalDue: 0
                };
            }
            acc[key].bills.push(bill);
            acc[key].totalBilled += bill.totalAmount;
            if (bill.status === 'Paid') {
                acc[key].totalPaid += (bill.receivedAmount || 0) + (bill.deductionAmount || 0);
            } else {
                acc[key].totalDue += bill.totalAmount;
            }
        }
        return acc;
    }, {});
    
    const handleDownloadPdf = (statementGroup) => {
        if (!window.jspdf || !window.jspdf.jsPDF) { showAlert("Library Error", "jsPDF is not available."); return; }
        generateDueStatementPDF(
            { name: statementGroup.partyName, address: statementGroup.partyAddress, companyName: statementGroup.companyName },
            statementGroup.bills, lrs, showAlert, companyConfigs
        );
    };

    const handleExportLedgers = () => {
        if (typeof window.XLSX === 'undefined') { showAlert("Library Error", "XLSX is not available."); return; }

        const allStatementBills = [];
        
        Object.values(billsByPartyAndCompany).forEach(group => {
            group.bills.forEach(bill => {
                const billLrs = bill.lrIds.map(id => lrs.find(l => l.id === id)).filter(Boolean);
                
                if (billLrs.length === 0) {
                    allStatementBills.push({
                        "Party Name": group.partyName,
                        "Company": group.companyName,
                        "Bill No": bill.billNumber,
                        "Date": new Date(bill.billDate).toLocaleDateString('en-GB'),
                        "LR No": "N/A",
                        "Truck No": "N/A",
                        "Consignee Name": bill.partyName,
                        "LR Amount": Number(bill.totalAmount).toFixed(2),
                        "Bill Total": Number(bill.totalAmount).toFixed(2),
                        "Amount Received": bill.status === 'Paid' ? Number(bill.receivedAmount || 0).toFixed(2) : '',
                        "Date Received": bill.status === 'Paid' && bill.paymentDate ? new Date(bill.paymentDate).toLocaleDateString('en-GB') : '',
                        "Deduction Amount": bill.status === 'Paid' ? Number(bill.deductionAmount || 0).toFixed(2) : '',
                        "Deduction Reason": bill.status === 'Paid' ? (bill.deductionReason || '') : '',
                        "Remarks": bill.status === 'Paid' ? (bill.remarks || '') : '',
                        "Status": bill.status || 'Due'
                    });
                    return;
                }

                billLrs.forEach((lr, index) => {
                    const truckNumbersString = (lr.truckDetails?.truckNumbers || [lr.truckDetails?.truckNumber]).filter(Boolean).join(', ') || 'N/A';
                    
                    const originalFreight = Number(lr.billDetails?.amount) || 0;
                    const ratePerTon = Number(lr.billDetails?.ratePerTon) || 0;
                    const weight = Number(lr.loadingDetails?.weight) || 0;
                    const lrAmount = (ratePerTon > 0 && weight > 0) ? Math.round(ratePerTon * weight) : originalFreight;

                    allStatementBills.push({
                        "Party Name": group.partyName,
                        "Company": group.companyName,
                        "Bill No": bill.billNumber,
                        "Date": new Date(bill.billDate).toLocaleDateString('en-GB'),
                        "LR No": lr.lrNumber || 'N/A',
                        "Truck No": truckNumbersString,
                        "Consignee Name": lr.consignee?.name || bill.partyName,
                        "LR Amount": lrAmount.toFixed(2),
                        "Bill Total": index === 0 ? Number(bill.totalAmount).toFixed(2) : '', 
                        "Amount Received": (bill.status === 'Paid' && index === 0) ? Number(bill.receivedAmount || 0).toFixed(2) : '',
                        "Date Received": (bill.status === 'Paid' && bill.paymentDate && index === 0) ? new Date(bill.paymentDate).toLocaleDateString('en-GB') : '',
                        "Deduction Amount": (bill.status === 'Paid' && index === 0) ? Number(bill.deductionAmount || 0).toFixed(2) : '',
                        "Deduction Reason": (bill.status === 'Paid' && index === 0) ? (bill.deductionReason || '') : '',
                        "Remarks": (bill.status === 'Paid' && index === 0) ? (bill.remarks || '') : '',
                        "Status": bill.status || 'Due'
                    });
                });
            });
        });

        if (allStatementBills.length === 0) { showAlert("No Data", "No ledger data to export."); return; }
        const worksheet = window.XLSX.utils.json_to_sheet(allStatementBills);
        const workbook = window.XLSX.utils.book_new();
        window.XLSX.utils.book_append_sheet(workbook, worksheet, "Party Ledgers");
        window.XLSX.writeFile(workbook, "Ledger_Statements_Export.xlsx");
    };
    
    return (
        <div>
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold">Statements & Ledgers</h2>
                <button onClick={handleExportLedgers} className="btn-secondary flex items-center gap-2 bg-green-50 hover:bg-green-100 text-green-700 border border-green-200">
                    <DownloadIcon className="h-5 w-5"/>
                    Export Ledgers to Excel
                </button>
            </div>

            <div className="space-y-4">
                {Object.keys(billsByPartyAndCompany).length > 0 ? Object.values(billsByPartyAndCompany).map(group => (
                    <div key={`${group.partyId}-${group.companyName}`} className="p-4 border rounded-lg bg-slate-50 transition-shadow hover:shadow-md">
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                            <div>
                                <p className="font-bold text-slate-800 text-lg">{group.partyName}</p>
                                <p className="text-sm text-indigo-600 font-semibold">{group.companyName}</p>
                                <div className="mt-2 text-sm text-slate-600">
                                    <span className="font-medium">Billed: ₹{group.totalBilled.toFixed(2)}</span>
                                    <span className="mx-2">|</span>
                                    <span className="text-green-600 font-medium">Paid/Settled: ₹{group.totalPaid.toFixed(2)}</span>
                                    <span className="mx-2">|</span>
                                    <span className="text-red-600 font-bold">Due: ₹{group.totalDue.toFixed(2)}</span>
                                </div>
                            </div>
                            <button onClick={() => handleDownloadPdf(group)} className="btn-primary flex items-center gap-2 self-end sm:self-center bg-indigo-600">
                                <DownloadIcon className="h-5 w-5"/>
                                Download Due PDF
                            </button>
                        </div>
                    </div>
                )) : <p className="text-slate-500 text-center p-4">No statements to show.</p>}
            </div>
            <style>{`.btn-primary{background:#4F46E5; color:white; padding:8px 16px; border-radius:8px; font-weight:500} .btn-secondary { padding: 8px 16px; border-radius: 8px; font-weight: 500; }`}</style>
        </div>
    );
}

// --- Login Screen Component ---
function LoginScreen({ showAlert }) {
    const [isRegistering, setIsRegistering] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    
    const handleAuthAction = async (e) => {
        e.preventDefault();
        if (!email || !password) { showAlert("Authentication Error", "Please enter both email and password."); return; }
        try {
            if (isRegistering) await createUserWithEmailAndPassword(auth, email, password);
            else await signInWithEmailAndPassword(auth, email, password);
        } catch (error) { showAlert("Authentication Failed", error.message); }
    };
    return (
        <div className="min-h-screen bg-slate-100 flex flex-col justify-center items-center p-4">
            <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-center mb-6"><TruckIcon className="h-12 w-12 text-indigo-600" /></div>
                <h2 className="text-2xl font-bold text-center text-slate-800 mb-6">{isRegistering ? 'Create an Account' : 'Transport Dashboard Login'}</h2>
                <form onSubmit={handleAuthAction} className="space-y-6">
                    <Input label="Email Address" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
                    <Input label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} required />
                    <div><button type="submit" className="w-full bg-indigo-600 text-white p-3 rounded-md font-semibold hover:bg-indigo-700 transition-colors">{isRegistering ? 'Sign Up' : 'Sign In'}</button></div>
                </form>
                <div className="mt-6 text-center"><button onClick={() => setIsRegistering(!isRegistering)} className="text-sm text-indigo-600 hover:underline">{isRegistering ? 'Already have an account? Sign In' : "Don't have an account? Sign Up"}</button></div>
            </div>
        </div>
    );
}

// --- Main App Component ---
function App() {
    const [view, setView] = useState(() => localStorage.getItem('currentView') || 'lrs');
    const [lrs, setLrs] = useState([]);
    const [bills, setBills] = useState([]);
    const [parties, setParties] = useState([]);
    const [editingLr, setEditingLr] = useState(null);
    const [editingBill, setEditingBill] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [confirmation, setConfirmation] = useState(null);
    const [alertInfo, setAlertInfo] = useState(null);
    const [editingParty, setEditingParty] = useState(null);
    const [isPartyModalOpen, setIsPartyModalOpen] = useState(false);
    const [dataLoaded, setDataLoaded] = useState(false);
    const [scriptsLoaded, setScriptsLoaded] = useState(false); 
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [configs, setConfigs] = useState(defaultCompanyConfigs);

    const showAlert = useCallback((title, message) => setAlertInfo({ title, message }), []);
    
    useEffect(() => {
        if (!user) return;
        const fetchSettings = async () => {
            try {
                const snap = await getDoc(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/settings` : `users/${user.uid}/settings`, 'companyConfigs'));
                if (snap.exists()) setConfigs(snap.data());
            } catch (err) { console.error("Error fetching settings:", err); }
        };
        fetchSettings();
    }, [user]);

    useEffect(() => {
        const loadScript = (src) => new Promise((resolve, reject) => {
            if (document.querySelector(`script[src="${src}"]`)) { resolve(); return; }
            const script = document.createElement('script'); script.src = src; script.onload = resolve; script.onerror = reject; document.head.appendChild(script);
        });

        loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js")
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.23/jspdf.plugin.autotable.min.js"))
            .then(() => loadScript("https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js"))
            .then(() => setScriptsLoaded(true))
            .catch(error => { showAlert("Loading Error", "Could not load required libraries for PDF/Excel export."); });
    }, [showAlert]);
    
    useEffect(() => {
        const initAuth = async () => {
            try {
                if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
                    await signInWithCustomToken(auth, __initial_auth_token);
                } else {
                    await signInAnonymously(auth);
                }
            } catch (error) {
                console.error("Custom token sign-in failed:", error);
            }
        };
        initAuth();

        const unsubscribe = onAuthStateChanged(auth, (user) => {
            setUser(user); setLoading(false);
            if (!user) { setDataLoaded(false); localStorage.clear(); }
        });
        return () => unsubscribe();
    }, []);
    
    useEffect(() => {
        if (!user) { setDataLoaded(false); setLrs([]); setBills([]); setParties([]); return; }
        const unsubscribers = ['lrs', 'bills', 'parties'].map(path => {
            const setter = path === 'lrs' ? setLrs : path === 'bills' ? setBills : setParties;
            return onSnapshot(query(collection(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/${path}` : `users/${user.uid}/${path}`)), (snapshot) => {
                setter(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
            });
        });
        setDataLoaded(true);
        return () => unsubscribers.forEach(unsub => unsub());
    }, [user]);

    const handleSetView = (newView) => { setEditingLr(null); setEditingBill(null); localStorage.removeItem('editingLrId'); setView(newView); };
    const handleEditLr = (lr) => { localStorage.setItem('editingLrId', lr.id); setEditingLr(lr); setView('add_lr'); };
    const handleEditBill = (bill) => { setEditingBill(bill); setView('create_bill'); };

    useEffect(() => { localStorage.setItem('currentView', view); }, [view]);
    useEffect(() => {
        if(lrs.length > 0) {
            const savedLrId = localStorage.getItem('editingLrId');
            if (savedLrId) {
                const lrToEdit = lrs.find(lr => lr.id === savedLrId);
                if (lrToEdit) setEditingLr(lrToEdit); else localStorage.removeItem('editingLrId');
            }
        }
    }, [lrs]);
    
    const handleDeleteRequest = useCallback((message, onConfirmAction) => setConfirmation({ message, onConfirm: onConfirmAction }), []);
    const handleConfirmDelete = () => { if (confirmation?.onConfirm) confirmation.onConfirm(); setConfirmation(null); };
    const handleCancelDelete = () => setConfirmation(null);
    const handleDelete = useCallback(async (id, collectionName) => {
        if (!user) return;
        try { await deleteDoc(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/${collectionName}` : `users/${user.uid}/${collectionName}`, id)); } 
        catch (error) { showAlert("Deletion Failed", `Could not delete the item from ${collectionName}.`); }
    }, [user, showAlert]);
    
    const handleOpenPartyModal = (party = null) => { setEditingParty(party); setIsPartyModalOpen(true); };
    
    const handleSaveParty = async (partyData) => {
        if (!user) return;
        try {
            if (partyData.id) {
                const { id, ...dataToSave } = partyData;
                const batch = writeBatch(db);
                const originalParty = parties.find(p => p.id === id);
                batch.update(doc(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/parties` : `users/${user.uid}/parties`, id), dataToSave);

                const lrsCnorSnap = await getDocs(query(collection(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/lrs` : `users/${user.uid}/lrs`), where('consignor.name', '==', originalParty.name)));
                lrsCnorSnap.forEach(docSnap => batch.update(docSnap.ref, { consignor: dataToSave }));

                const lrsCneeSnap = await getDocs(query(collection(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/lrs` : `users/${user.uid}/lrs`), where('consignee.name', '==', originalParty.name)));
                lrsCneeSnap.forEach(docSnap => batch.update(docSnap.ref, { consignee: dataToSave }));

                const billsSnap = await getDocs(query(collection(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/bills` : `users/${user.uid}/bills`), where('partyName', '==', originalParty.name)));
                billsSnap.forEach(docSnap => batch.update(docSnap.ref, { partyName: dataToSave.name }));
                
                await batch.commit();
                showAlert("Success", "Party updated successfully across all records.");
            } else {
                await addDoc(collection(db, typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/parties` : `users/${user.uid}/parties`), { ...partyData, createdAt: new Date().toISOString() });
                showAlert("Success", "New party added successfully.");
            }
        } catch (error) { showAlert("Save Failed", "Could not save the party details."); } 
        finally { setIsPartyModalOpen(false); setEditingParty(null); }
    };

    const injectTestData = async () => {
        if (!user) return;
        try {
            const batch = writeBatch(db);
            const getPath = (coll) => typeof __app_id !== 'undefined' ? `artifacts/${appId}/users/${user.uid}/${coll}` : `users/${user.uid}/${coll}`;

            const party1Ref = doc(collection(db, getPath('parties')));
            const party2Ref = doc(collection(db, getPath('parties')));

            const party1 = { name: "Acme Corp", address: "123 Industrial Park, Delhi", gstin: "22AAAAA0000A1Z5", mobile: "9876543210", createdAt: new Date().toISOString() };
            const party2 = { name: "Globex Inc", address: "456 Business Rd, Mumbai", gstin: "33BBBBB0000B1Z5", mobile: "9123456780", createdAt: new Date().toISOString() };

            batch.set(party1Ref, party1);
            batch.set(party2Ref, party2);

            const lr1Ref = doc(collection(db, getPath('lrs')));
            const lr2Ref = doc(collection(db, getPath('lrs')));
            const lr3Ref = doc(collection(db, getPath('lrs')));
            const lr4Ref = doc(collection(db, getPath('lrs')));

            batch.set(lr1Ref, {
                companyName: 'SAI KUMAR TRANSPORT', lrNumber: '1001', bookingDate: '2026-03-01',
                truckDetails: { truckNumbers: ['AP16TH1234'] }, loadingDetails: { loadingPoint: 'Delhi', unloadingPoint: 'Mumbai', articles: '100 Boxes', weight: '10' },
                consignor: { name: party1.name, address: party1.address, gstin: party1.gstin }, consignee: { name: party2.name, address: party2.address, gstin: party2.gstin },
                billDetails: { amount: '15000', ratePerTon: '1500' }, isBilled: true
            });

            batch.set(lr2Ref, {
                companyName: 'SAI KUMAR TRANSPORT', lrNumber: '1001-A', bookingDate: '2026-03-02',
                truckDetails: { truckNumbers: ['AP16TH5678'] }, loadingDetails: { loadingPoint: 'Delhi', unloadingPoint: 'Mumbai', articles: '50 Boxes', weight: '5' },
                consignor: { name: party1.name, address: party1.address, gstin: party1.gstin }, consignee: { name: party2.name, address: party2.address, gstin: party2.gstin },
                billDetails: { amount: '7500', ratePerTon: '1500' }, isBilled: true
            });

            batch.set(lr3Ref, {
                companyName: 'GLOBAL LOGISTICS', lrNumber: '1002', bookingDate: '2026-03-05',
                truckDetails: { truckNumbers: ['AP16TH9999'] }, loadingDetails: { loadingPoint: 'Mumbai', unloadingPoint: 'Delhi', articles: '200 Bags', weight: '20' },
                consignor: { name: party2.name, address: party2.address, gstin: party2.gstin }, consignee: { name: party1.name, address: party1.address, gstin: party1.gstin },
                billDetails: { amount: '20000', ratePerTon: '1000' }, isBilled: false
            });
            
            batch.set(lr4Ref, {
                companyName: 'GLOBAL LOGISTICS', lrNumber: '1003', bookingDate: '2026-03-08',
                truckDetails: { truckNumbers: ['AP16TH1111'] }, loadingDetails: { loadingPoint: 'Mumbai', unloadingPoint: 'Delhi', articles: '100 Bags', weight: '10' },
                consignor: { name: party2.name, address: party2.address, gstin: party2.gstin }, consignee: { name: party1.name, address: party1.address, gstin: party1.gstin },
                billDetails: { amount: '10000', ratePerTon: '1000' }, isBilled: false
            });

            const bill1Ref = doc(collection(db, getPath('bills')));
            batch.set(bill1Ref, {
                billNumber: 'B-100', billDate: '2026-03-10', companyName: 'SAI KUMAR TRANSPORT',
                billTo: 'Consignee', partyName: party2.name, lrIds: [lr1Ref.id, lr2Ref.id],
                totalAmount: 22500, status: 'Paid',
                receivedAmount: 22000, deductionAmount: 500, deductionReason: 'Shortage', remarks: 'Paid via RTGS', paymentDate: '2026-03-12'
            });

            await batch.commit();
            showAlert("Test Data Loaded", "Successfully injected mock Parties, LRs, and Bills into your dashboard.");
        } catch (e) {
            console.error(e);
            showAlert("Error", "Could not load test data.");
        }
    };

    const renderView = () => {
        const props = { userId: user?.uid, setView: handleSetView, lrs, bills, parties, handleDeleteRequest, handleDelete, showAlert, onEditParty: handleOpenPartyModal, selectedMonth, setSelectedMonth, companyConfigs: configs, setCompanyConfigs: setConfigs, handleEditBill, editingBill };
        switch (view) {
            case 'add_lr': return <LrForm {...props} existingLr={editingLr} />;
            case 'billing': return <BillingView {...props} />;
            case 'create_bill': return <CreateBillForm {...props} />;
            case 'parties': return <PartiesView {...props} />;
            case 'statements': return <StatementView {...props}/>;
            case 'company_settings': return <CompanySettingsView {...props} />; 
            case 'lrs': default: return <LrView {...props} handleEditLr={handleEditLr} />;
        }
    };

    if (loading || !user || (!dataLoaded && user) || (!scriptsLoaded && user)) return <div className="min-h-screen flex items-center justify-center bg-slate-50"><p className="text-xl font-semibold text-slate-500">Loading Application...</p></div>;
    
    return (
        <div className="bg-slate-50 min-h-screen font-sans text-slate-800">
            {isPartyModalOpen && <PartyFormModal party={editingParty} onSave={handleSaveParty} onCancel={() => setIsPartyModalOpen(false)} showAlert={showAlert} />}
            {confirmation && <ConfirmModal message={confirmation.message} onConfirm={handleConfirmDelete} onCancel={handleCancelDelete} />}
            {alertInfo && <AlertModal title={alertInfo.title} message={alertInfo.message} onClose={() => setAlertInfo(null)} />}
            <div className="container mx-auto p-2 sm:p-4">
                <header className="bg-white rounded-lg shadow p-4 mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="flex items-center gap-3"><TruckIcon className="h-8 w-8 text-indigo-600" /><h1 className="text-xl sm:text-2xl font-bold">Transport Dashboard</h1></div>
                    <button onClick={() => handleDeleteRequest("This will add mock data for testing. Proceed?", injectTestData)} className="text-sm bg-indigo-100 text-indigo-700 font-semibold px-3 py-1.5 rounded-md hover:bg-indigo-200 transition-colors">
                        Load Test Data
                    </button>
                </header>
                <nav className="bg-white rounded-lg shadow p-2 flex flex-wrap gap-2 mb-6">
                    <NavButton icon={<FileTextIcon />} label="LRs" active={view === 'lrs' || view === 'add_lr'} onClick={() => handleSetView('lrs')} />
                    <NavButton icon={<DollarSignIcon />} label="Billing" active={view === 'billing' || view === 'create_bill'} onClick={() => handleSetView('billing')} />
                    <NavButton icon={<UsersIcon />} label="Parties" active={view === 'parties'} onClick={() => handleSetView('parties')} />
                    <NavButton icon={<BriefcaseIcon />} label="Statements" active={view === 'statements'} onClick={() => handleSetView('statements')} />
                    <NavButton icon={<SettingsIcon />} label="Settings" active={view === 'company_settings'} onClick={() => handleSetView('company_settings')} />
                </nav>
                <main className="bg-white rounded-lg shadow p-4 sm:p-6">{renderView()}</main>
            </div>
        </div>
    );
}

export default App;