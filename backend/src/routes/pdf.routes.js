const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const path = require("path");
const fs = require("fs");

// GET /api/pdf/facture/model - Générer un modèle de facture PDF vide (public, no auth required)
router.get("/facture/model", async (req, res) => {
  try {
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=facture_modele.pdf`
    );

    doc.pipe(res);

    // Check if logo exists
    const logoHeaderPath = path.join(__dirname, "../assets/logoHeader.png");
    const hasLogoHeader = fs.existsSync(logoHeaderPath);
    const logoPath = path.join(__dirname, "../assets/logogargaa.png");
    const hasLogo = fs.existsSync(logoPath);

    // ========== HEADER SECTION ==========
    const headerY = 50;

    // Logo on the left (if exists)
    if (hasLogoHeader) {
      try {
        doc.image(logoHeaderPath, 40, 40, { width: 150, height: 100 });
      } catch (err) {
        console.log("Could not load logo:", err);
      }
    }

    // Company name and info on the right
    doc.fontSize(16)
      .font("Times-Bold")
      .fillColor("#1e40af")
      .text("STE GARGAA TRANS SARL", 300, headerY, { align: "right" });

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#666666")
      .text("TRANSPORT DE MARCHANDISES", 300, headerY + 20, { align: "right" });

    // Date placeholder
    doc.fontSize(10)
      .fillColor("#333333")
      .text(`Ait Melloul le ..............................`, 300, headerY + 50, { align: "right" });

    doc.moveDown(4);

    // ========== CLIENT INFO BOX ==========
    const boxY = 160;
    const boxWidth = 350;
    const boxHeight = 70;
    const boxX = (595.28 - boxWidth) / 2; // Center on A4 width

    // Draw bordered box
    doc.strokeColor("#333333")
      .lineWidth(2)
      .rect(boxX, boxY, boxWidth, boxHeight)
      .stroke();

    // Client info inside box
    doc.fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#ea0e1a")
      .text(`Client : ..............................................................`, boxX + 20, boxY + 20, {
        width: boxWidth - 40,
        align: "left"
      });

    // ICE number placeholder
    doc.fontSize(10)
      .font("Helvetica")
      .text(`ICE : ................................................................`, boxX + 20, boxY + 45, {
        width: boxWidth - 40,
        align: "left"
      });

    // ========== INVOICE NUMBER ==========
    doc.fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(`Facture N° : ........................`, 50, boxY + boxHeight + 25);

    // ========== INVOICE TABLE ==========
    const tableY = 360;
    const tableLeft = 50;

    // Column widths
    const colWidths = {
      trajet: 120,
      designation: 200,
      pu: 85,
      ptht: 90
    };

    let currentY = tableY;

    // Helper to draw table cell
    const drawCell = (x, y, width, height, text, options = {}) => {
      const {
        bold = false,
        bgColor = null,
        textColor = "#000000",
        align = "left",
        fontSize = 10,
        border = true
      } = options;

      if (bgColor) {
        doc.fillColor(bgColor).rect(x, y, width, height).fill();
      }

      if (border) {
        doc.strokeColor("#333333").lineWidth(0.5).rect(x, y, width, height).stroke();
      }

      if (text) {
        doc.fillColor(textColor)
          .font(bold ? "Helvetica-Bold" : "Helvetica")
          .fontSize(fontSize);

        const textY = y + (height / 2) - (fontSize / 2);
        doc.text(text, x + 5, textY, {
          width: width - 10,
          align: align,
          lineBreak: false
        });
      }
    };

    // Table header
    const headerHeight = 25;
    drawCell(tableLeft, currentY, colWidths.trajet, headerHeight, "TRAJET",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet, currentY, colWidths.designation, headerHeight, "DESIGNATION",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation, currentY, colWidths.pu, headerHeight, "P.U",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation + colWidths.pu, currentY, colWidths.ptht, headerHeight, "P.T HT",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });

    currentY += headerHeight;

    // Table content rows (Empty rows for manual filling)
    const rowHeight = 30;
    const numRows = 5;

    for (let i = 0; i < numRows; i++) {
      drawCell(tableLeft, currentY, colWidths.trajet, rowHeight, "", { fontSize: 9 });
      drawCell(tableLeft + colWidths.trajet, currentY, colWidths.designation, rowHeight, "", { fontSize: 9 });
      drawCell(tableLeft + colWidths.trajet + colWidths.designation, currentY, colWidths.pu, rowHeight, "",
        { align: "right", fontSize: 9 });
      drawCell(tableLeft + colWidths.trajet + colWidths.designation + colWidths.pu, currentY, colWidths.ptht, rowHeight, "",
        { align: "right", fontSize: 9 });
      currentY += rowHeight;
    }

    // Totals section
    const totalsX = tableLeft + colWidths.trajet + colWidths.designation;
    const totalRowHeight = 25;

    // TOTAL HT
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, "TOTAL HT",
      { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, "",
      { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // TVA
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, "TVA 10%",
      { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, "",
      { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // TOTAL TTC
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, "TOTAL TTC",
      { bold: true, bgColor: "#dbeafe", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, "",
      { bold: true, bgColor: "#dbeafe", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // ========== WATERMARK LOGO ==========
    if (hasLogo) {
      try {
        doc.save();
        const watermarkSize = 400;
        const watermarkX = (595.28 - watermarkSize) / 2;
        const watermarkY = 250;
        doc.opacity(0.15);
        doc.image(logoPath, watermarkX, watermarkY, {
          width: 450,
          height: 300,
          align: 'center'
        });
        doc.restore();
      } catch (err) {
        console.log("Could not add watermark:", err);
      }
    }

    // ========== AMOUNT IN WORDS ==========
    currentY += 20;

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#333333")
      .text(`La présente facture est arrêtée à la somme de : ................................................................................................`,
        50, currentY, { width: 495, align: "left" });

    doc.text(`....................................................................................................................................................................`,
      50, currentY + 15, { width: 495, align: "left" });

    // ========== FOOTER ==========
    const footerY = 650;
    const pageWidth = 595.28;
    const footerLeft = 50;
    const footerWidth = pageWidth - 100;

    // Draw a decorative line above footer
    doc.strokeColor("#1e40af")
      .lineWidth(1)
      .moveTo(footerLeft, footerY - 5)
      .lineTo(footerLeft + footerWidth, footerY - 5)
      .stroke();

    // Company name and capital - TOP LINE
    doc.fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#1e40af")
      .text("Société Gargaa Trans - Au capital de 100.000,00 Dirhams",
        footerLeft, footerY, { width: footerWidth, align: "center" });

    // Address line
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Adresse : RDC NR 100 BLOC C LOTISSEMENT ADMINE AIT MELLOUL",
        footerLeft, footerY + 12, { width: footerWidth, align: "center" });

    // Email line - THIRD LINE
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Email : gargaatrans@gmail.com",
        footerLeft, footerY + 24, { width: footerWidth, align: "center" });

    // Phone line
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Tél : 0528243694 / 0619348787",
        footerLeft, footerY + 36, { width: footerWidth, align: "center" });

    // Legal info line
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("ICE 003855059000033 | TP 49818274 | RC 34567 | IF 71003179 | CNSS 6580902",
        footerLeft, footerY + 48, { width: footerWidth, align: "center" });

    // Bank info line
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("ATTIJARI WAFA BANK - RIB : 007 022 0012965000000270 47",
        footerLeft, footerY + 60, { width: footerWidth, align: "center" });

    // Draw a decorative line below footer
    doc.strokeColor("#1e40af")
      .lineWidth(1)
      .moveTo(footerLeft, footerY + 75)
      .lineTo(footerLeft + footerWidth, footerY + 75)
      .stroke();

    doc.end();
  } catch (error) {
    console.error("Erreur génération modèle PDF:", error);
    res.status(500).json({ success: false, message: "Erreur génération modèle PDF" });
  }
});

// Apply authentication to all routes below this point
router.use(authenticateToken);

// Helper function to convert number to French words
function numberToFrenchWords(num) {
  if (num === 0) return "zéro";

  const units = ["", "un", "deux", "trois", "quatre", "cinq", "six", "sept", "huit", "neuf"];
  const teens = ["dix", "onze", "douze", "treize", "quatorze", "quinze", "seize", "dix-sept", "dix-huit", "dix-neuf"];
  const tens = ["", "", "vingt", "trente", "quarante", "cinquante", "soixante", "soixante-dix", "quatre-vingt", "quatre-vingt-dix"];

  function convertLessThanThousand(n) {
    if (n === 0) return "";
    if (n < 10) return units[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) {
      const ten = Math.floor(n / 10);
      const unit = n % 10;
      if (ten === 7 || ten === 9) {
        return tens[ten - 1] + "-" + teens[unit];
      }
      return tens[ten] + (unit ? "-" + units[unit] : "");
    }

    const hundred = Math.floor(n / 100);
    const rest = n % 100;
    let result = hundred === 1 ? "cent" : units[hundred] + " cent";
    if (rest) result += " " + convertLessThanThousand(rest);
    return result;
  }

  if (num < 1000) return convertLessThanThousand(num);

  const thousand = Math.floor(num / 1000);
  const rest = num % 1000;
  let result = thousand === 1 ? "mille" : convertLessThanThousand(thousand) + " mille";
  if (rest) result += " " + convertLessThanThousand(rest);
  return result;
}

// GET /api/pdf/facture/:id - Générer une facture PDF
router.get("/facture/:id", async (req, res) => {
  try {
    const [expeditions] = await pool.query(
      `SELECT e.*, c.nom_entite, c.numero_telephone as telephone_client, 
              c.adresse_complete as adresse_client, c.type_client, c.email, c.ice
       FROM expeditions e 
       JOIN clients c ON e.client_id = c.id 
       WHERE e.id = ?`,
      [req.params.id]
    );

    if (expeditions.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Expédition non trouvée" });
    }

    const exp = expeditions[0];
    const doc = new PDFDocument({ margin: 20, size: 'A4' });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=facture_${exp.numero_expedition}.pdf`
    );

    doc.pipe(res);

    // Check if logo exists
    const logoHeaderPath = path.join(__dirname, "../assets/logoHeader.png");
    const hasLogoHeader = fs.existsSync(logoHeaderPath);
    const logoPath = path.join(__dirname, "../assets/logogargaa.png");
    const hasLogo = fs.existsSync(logoPath);

    // ========== HEADER SECTION ==========
    const headerY = 50;

    // Logo on the left (if exists)
    if (hasLogoHeader) {
      try {
        doc.image(logoHeaderPath, 40, 40, { width: 130, height: 100 });
      } catch (err) {
        console.log("Could not load logo:", err);
      }
    }

    // Company name and info on the right
    doc.fontSize(16)
      .font("Times-Bold")
      .fillColor("#1e40af")
      .text("STE GARGAA TRANS SARL AU", 300, headerY, { align: "right" });

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#666666")
      .text("TRANSPORT DE MARCHANDISES", 300, headerY + 20, { align: "right" });

    // Date in top right
    const dateStr = new Date(exp.date_expedition).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    doc.fontSize(10)
      .fillColor("#333333")
      .text(`Ait Melloul le ${dateStr}`, 300, headerY + 50, { align: "right" });

    doc.moveDown(4);

    // ========== CLIENT INFO BOX ==========
    const boxY = 160;
    const boxWidth = 350;
    const boxHeight = 70;
    const boxX = (595.28 - boxWidth) / 2; // Center on A4 width

    // Draw bordered box
    doc.strokeColor("#333333")
      .lineWidth(2)
      .rect(boxX, boxY, boxWidth, boxHeight)
      .stroke();

    // Client info inside box
    doc.fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#333333")
      .text(`Client : ${exp.nom_entite}`, boxX + 20, boxY + 20, {
        width: boxWidth - 40,
        align: "center"
      });

    // ICE number (if available)
    const iceDisplay = exp.ice || 'A/C';
    doc.fontSize(10)
      .font("Helvetica")
      .text(`ICE : ${iceDisplay}`, boxX + 20, boxY + 40, {
        width: boxWidth - 40,
        align: "center"
      });

    // ========== INVOICE NUMBER ==========
    doc.fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(`Facture N° : ${exp.numero_expedition}`, 50, boxY + boxHeight + 25);

    // ========== INVOICE TABLE ==========
    const tableY = 360; // Position table in the middle of the page
    const tableLeft = 50;
    const tableWidth = 495;

    // Column widths
    const colWidths = {
      trajet: 120,
      designation: 200,
      pu: 85,
      ptht: 90
    };

    let currentY = tableY;

    // Helper to draw table cell
    const drawCell = (x, y, width, height, text, options = {}) => {
      const {
        bold = false,
        bgColor = null,
        textColor = "#000000",
        align = "left",
        fontSize = 10,
        border = true
      } = options;

      // Background
      if (bgColor) {
        doc.fillColor(bgColor).rect(x, y, width, height).fill();
      }

      // Border
      if (border) {
        doc.strokeColor("#333333").lineWidth(0.5).rect(x, y, width, height).stroke();
      }

      // Text
      doc.fillColor(textColor)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(fontSize);

      const textY = y + (height / 2) - (fontSize / 2);
      doc.text(text, x + 5, textY, {
        width: width - 10,
        align: align,
        lineBreak: false
      });
    };

    // Table header
    const headerHeight = 25;
    drawCell(tableLeft, currentY, colWidths.trajet, headerHeight, "TRAJET",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet, currentY, colWidths.designation, headerHeight, "DESIGNATION",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation, currentY, colWidths.pu, headerHeight, "P.U",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation + colWidths.pu, currentY, colWidths.ptht, headerHeight, "P.T HT",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });

    currentY += headerHeight;

    // Table content row
    const rowHeight = 30;
    const trajet = `${exp.ville_depart} vers ${exp.ville_arrivee}`.toUpperCase();
    const designation = exp.type_marchandises || "TRANSPORT DE MARCHANDISE";
    const pu = parseFloat(exp.prix_ht).toFixed(2);
    const ptht = parseFloat(exp.prix_ht).toFixed(2);

    drawCell(tableLeft, currentY, colWidths.trajet, rowHeight, trajet, { fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet, currentY, colWidths.designation, rowHeight, designation, { fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation, currentY, colWidths.pu, rowHeight, pu,
      { align: "right", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation + colWidths.pu, currentY, colWidths.ptht, rowHeight, ptht,
      { align: "right", fontSize: 9 });

    currentY += rowHeight;

    // Totals section (right aligned)
    const totalsX = tableLeft + colWidths.trajet + colWidths.designation;
    const totalsWidth = colWidths.pu + colWidths.ptht;
    const totalRowHeight = 25;

    // TOTAL HT
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, "TOTAL HT",
      { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, ptht,
      { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // TVA
    const tvaAmount = parseFloat(exp.montant_taxe).toFixed(2);
    const tvaLabel = `TVA ${parseFloat(exp.taux_tva)}%`;
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, tvaLabel,
      { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, tvaAmount,
      { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // TOTAL TTC
    const ttc = parseFloat(exp.prix_ttc).toFixed(2);
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, "TOTAL TTC",
      { bold: true, bgColor: "#dbeafe", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, ttc,
      { bold: true, bgColor: "#dbeafe", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // ========== WATERMARK LOGO (CENTER OF PAGE) ==========
    if (hasLogo) {
      try {
        // Save the current graphics state
        doc.save();

        // Calculate center position for watermark
        const watermarkSize = 400; // Larger size for watermark
        const watermarkX = (595.28 - watermarkSize) / 2; // Center on A4 width
        const watermarkY = 250; // Middle of page vertically

        // Set opacity for watermark effect
        doc.opacity(0.15); // 15% opacity for subtle watermark

        // Draw the watermark logo
        doc.image(logoPath, watermarkX, watermarkY, {
          width: 450,
          height: 300,
          align: 'center'
        });

        // Restore the graphics state (reset opacity)
        doc.restore();
      } catch (err) {
        console.log("Could not add watermark:", err);
      }
    }

    // ========== AMOUNT IN WORDS ==========
    currentY += 20;
    const ttcInteger = Math.floor(parseFloat(exp.prix_ttc));
    const amountInWords = numberToFrenchWords(ttcInteger);

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#333333")
      .text(`La présente facture est arrêtée à la somme de : ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} Dirhams`,
        50, currentY, { width: 495, align: "left" });

    // ========== FOOTER - COMPANY LEGAL INFO ==========
    const footerY = 720;
    const pageWidth = 595.28;
    const footerLeft = 50;
    const footerWidth = pageWidth - 100;

    // Draw a decorative line above footer
    doc.strokeColor("#1e40af")
      .lineWidth(1)
      .moveTo(footerLeft, footerY - 5)
      .lineTo(footerLeft + footerWidth, footerY - 5)
      .stroke();

    // Company name and capital - TOP LINE
    doc.fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#1e40af")
      .text("Société Gargaa Trans - Au capital de 100.000,00 Dirhams",
        footerLeft, footerY, { width: footerWidth, align: "center" });

    // Address line
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Adresse : RDC NR 100 BLOC C LOTISSEMENT ADMINE AIT MELLOUL",
        footerLeft, footerY + 12, { width: footerWidth, align: "center" });

    // Email line - THIRD LINE
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Email : gargaatrans@gmail.com",
        footerLeft, footerY + 24, { width: footerWidth, align: "center" });

    // Phone line
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Tél : 0528243694 / 0619348787",
        footerLeft, footerY + 36, { width: footerWidth, align: "center" });

    // Legal info line
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("ICE 003855059000033 | TP 49818274 | RC 34567 | IF 71003179 | CNSS 6580902",
        footerLeft, footerY + 48, { width: footerWidth, align: "center" });

    // Bank info line
    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("ATTIJARI WAFA BANK - RIB : 007 022 0012965000000270 47",
        footerLeft, footerY + 60, { width: footerWidth, align: "center" });

    // Draw a decorative line below footer
    doc.strokeColor("#1e40af")
      .lineWidth(1)
      .moveTo(footerLeft, footerY + 75)
      .lineTo(footerLeft + footerWidth, footerY + 75)
      .stroke();

    doc.end();
  } catch (error) {
    console.error("Erreur génération PDF:", error);
    res.status(500).json({ success: false, message: "Erreur génération PDF" });
  }
});

// GET /api/pdf/devis/:id - Générer un devis PDF
router.get("/devis/:id", async (req, res) => {
  try {
    const [devis] = await pool.query(
      `SELECT d.*, c.nom_entite, c.numero_telephone as telephone_client, 
              c.adresse_complete as adresse_client, c.type_client, c.email, c.ice
       FROM devis d 
       JOIN clients c ON d.client_id = c.id 
       WHERE d.id = ?`,
      [req.params.id]
    );

    if (devis.length === 0) {
      return res
        .status(404)
        .json({ success: false, message: "Devis non trouvé" });
    }

    const dev = devis[0];
    const doc = new PDFDocument({ margin: 20, size: 'A4' });

    res.setHeader("Content-Type", "application/pdf");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=devis_${dev.numero_devis}.pdf`
    );

    doc.pipe(res);

    // Check if logo exists
    const logoHeaderPath = path.join(__dirname, "../assets/logoHeader.png");
    const hasLogoHeader = fs.existsSync(logoHeaderPath);
    const logoPath = path.join(__dirname, "../assets/logogargaa.png");
    const hasLogo = fs.existsSync(logoPath);

    // ========== HEADER SECTION ==========
    const headerY = 50;

    // Logo on the left (if exists)
    if (hasLogoHeader) {
      try {
        doc.image(logoHeaderPath, 40, 40, { width: 130, height: 100 });
      } catch (err) {
        console.log("Could not load logo:", err);
      }
    }

    // Company name and info on the right
    doc.fontSize(16)
      .font("Times-Bold")
      .fillColor("#1e40af")
      .text("STE GARGAA TRANS SARL AU", 300, headerY, { align: "right" });

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#666666")
      .text("TRANSPORT DE MARCHANDISES", 300, headerY + 20, { align: "right" });

    // Date in top right
    const dateStr = new Date(dev.date_devis).toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    doc.fontSize(10)
      .fillColor("#333333")
      .text(`Ait Melloul le ${dateStr}`, 300, headerY + 50, { align: "right" });

    doc.moveDown(4);

    // ========== CLIENT INFO BOX ==========
    const boxY = 160;
    const boxWidth = 350;
    const boxHeight = 70;
    const boxX = (595.28 - boxWidth) / 2; // Center on A4 width

    // Draw bordered box
    doc.strokeColor("#333333")
      .lineWidth(2)
      .rect(boxX, boxY, boxWidth, boxHeight)
      .stroke();

    // Client info inside box
    doc.fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#333333")
      .text(`Client : ${dev.nom_entite}`, boxX + 20, boxY + 20, {
        width: boxWidth - 40,
        align: "center"
      });

    // ICE number (if available)
    const iceDisplay = dev.ice || 'A/C';
    doc.fontSize(10)
      .font("Helvetica")
      .text(`ICE : ${iceDisplay}`, boxX + 20, boxY + 40, {
        width: boxWidth - 40,
        align: "center"
      });

    // ========== DEVIS NUMBER ==========
    doc.fontSize(11)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text(`Devis N° : ${dev.numero_devis}`, 50, boxY + boxHeight + 25);

    // ========== DEVIS TABLE ==========
    const tableY = 360; // Position table in the middle of the page
    const tableLeft = 50;
    const tableWidth = 495;

    // Col widths
    const colWidths = {
      trajet: 120,
      designation: 200,
      pu: 85,
      ptht: 90
    };

    let currentY = tableY;

    // Helper to draw table cell (Copied helper from above scope won't work unless duplicated or moved out)
    // DUPLICATING helper for safety as it's defined inside the other route handler
    const drawCell = (x, y, width, height, text, options = {}) => {
      const {
        bold = false,
        bgColor = null,
        textColor = "#000000",
        align = "left",
        fontSize = 10,
        border = true
      } = options;

      if (bgColor) {
        doc.fillColor(bgColor).rect(x, y, width, height).fill();
      }

      if (border) {
        doc.strokeColor("#333333").lineWidth(0.5).rect(x, y, width, height).stroke();
      }

      doc.fillColor(textColor)
        .font(bold ? "Helvetica-Bold" : "Helvetica")
        .fontSize(fontSize);

      const textY = y + (height / 2) - (fontSize / 2);
      doc.text(text, x + 5, textY, {
        width: width - 10,
        align: align,
        lineBreak: false
      });
    };

    // Table header
    const headerHeight = 25;
    drawCell(tableLeft, currentY, colWidths.trajet, headerHeight, "TRAJET",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet, currentY, colWidths.designation, headerHeight, "DESIGNATION",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation, currentY, colWidths.pu, headerHeight, "P.U",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation + colWidths.pu, currentY, colWidths.ptht, headerHeight, "P.T HT",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 9 });

    currentY += headerHeight;

    // Table content row
    const rowHeight = 30;
    const trajet = `${dev.ville_depart} vers ${dev.ville_arrivee}`.toUpperCase();
    const designation = dev.type_marchandises || "TRANSPORT DE MARCHANDISE";
    const pu = parseFloat(dev.prix_ht).toFixed(2);
    const ptht = parseFloat(dev.prix_ht).toFixed(2); // Assuming Quantity 1

    drawCell(tableLeft, currentY, colWidths.trajet, rowHeight, trajet, { fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet, currentY, colWidths.designation, rowHeight, designation, { fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation, currentY, colWidths.pu, rowHeight, pu,
      { align: "right", fontSize: 9 });
    drawCell(tableLeft + colWidths.trajet + colWidths.designation + colWidths.pu, currentY, colWidths.ptht, rowHeight, ptht,
      { align: "right", fontSize: 9 });

    currentY += rowHeight;

    // Totals
    const totalsX = tableLeft + colWidths.trajet + colWidths.designation;
    const totalRowHeight = 25;

    // TOTAL HT
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, "TOTAL HT",
      { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, ptht,
      { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // TVA
    const montantTaxe = parseFloat(dev.prix_ttc) - parseFloat(dev.prix_ht);
    const tvaAmount = montantTaxe.toFixed(2);
    const tvaLabel = `TVA ${parseFloat(dev.taux_tva)}%`;
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, tvaLabel,
      { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, tvaAmount,
      { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // TOTAL TTC
    const ttc = parseFloat(dev.prix_ttc).toFixed(2);
    drawCell(totalsX, currentY, colWidths.pu, totalRowHeight, "TOTAL TTC",
      { bold: true, bgColor: "#dbeafe", fontSize: 9 });
    drawCell(totalsX + colWidths.pu, currentY, colWidths.ptht, totalRowHeight, ttc,
      { bold: true, bgColor: "#dbeafe", align: "right", fontSize: 9 });
    currentY += totalRowHeight;

    // Watermark
    if (hasLogo) {
      try {
        doc.save();
        const watermarkSize = 400;
        const watermarkX = (595.28 - watermarkSize) / 2;
        const watermarkY = 250;
        doc.opacity(0.15);
        doc.image(logoPath, watermarkX, watermarkY, {
          width: 450,
          height: 300,
          align: 'center'
        });
        doc.restore();
      } catch (err) {
        console.log("Could not add watermark:", err);
      }
    }

    // Amount in words
    currentY += 20;
    const ttcInteger = Math.floor(parseFloat(dev.prix_ttc));
    const amountInWords = numberToFrenchWords(ttcInteger);

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#333333")
      .text(`La présente facture (Devis) est arrêtée à la somme de : ${amountInWords.charAt(0).toUpperCase() + amountInWords.slice(1)} Dirhams`,
        50, currentY, { width: 495, align: "left" });

    // Footer
    const footerY = 720;
    const pageWidth = 595.28;
    const footerLeft = 50;
    const footerWidth = pageWidth - 100;

    doc.strokeColor("#1e40af")
      .lineWidth(1)
      .moveTo(footerLeft, footerY - 5)
      .lineTo(footerLeft + footerWidth, footerY - 5)
      .stroke();

    doc.fontSize(8)
      .font("Helvetica-Bold")
      .fillColor("#1e40af")
      .text("Société Gargaa Trans - Au capital de 100.000,00 Dirhams",
        footerLeft, footerY, { width: footerWidth, align: "center" });

    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Adresse : RDC NR 100 BLOC C LOTISSEMENT ADMINE AIT MELLOUL",
        footerLeft, footerY + 12, { width: footerWidth, align: "center" });

    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Email : gargaatrans@gmail.com",
        footerLeft, footerY + 24, { width: footerWidth, align: "center" });

    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("Tél : 0528243694 / 0619348787",
        footerLeft, footerY + 36, { width: footerWidth, align: "center" });

    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("ICE 003855059000033 | TP 49818274 | RC 34567 | IF 71003179 | CNSS 6580902",
        footerLeft, footerY + 48, { width: footerWidth, align: "center" });

    doc.fontSize(8)
      .font("Helvetica")
      .fillColor("#333333")
      .text("ATTIJARI WAFA BANK - RIB : 007 022 0012965000000270 47",
        footerLeft, footerY + 60, { width: footerWidth, align: "center" });

    doc.strokeColor("#1e40af")
      .lineWidth(1)
      .moveTo(footerLeft, footerY + 75)
      .lineTo(footerLeft + footerWidth, footerY + 75)
      .stroke();

    doc.end();
  } catch (error) {
    console.error("Erreur génération PDF Devis:", error);
    res.status(500).json({ success: false, message: "Erreur génération PDF" });
  }
});


module.exports = router;
