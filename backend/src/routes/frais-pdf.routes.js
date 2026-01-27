const express = require("express");
const router = express.Router();
const PDFDocument = require("pdfkit");
const { pool } = require("../config/database");
const { authenticateToken } = require("../middleware/auth");
const path = require("path");
const fs = require("fs");

router.use(authenticateToken);

// POST /api/frais-pdf/export - Export filtered expenses to PDF
router.post("/export", async (req, res) => {
  try {
    const {
      date_debut, date_fin, categorie_id, type_categorie,
      numero_camion, mode_paiement
    } = req.body;

    let whereClause = 'WHERE 1=1';
    const params = [];

    if (date_debut) {
      whereClause += ' AND f.date_frais >= ?';
      params.push(date_debut);
    }
    if (date_fin) {
      whereClause += ' AND f.date_frais <= ?';
      params.push(date_fin);
    }
    if (categorie_id) {
      whereClause += ' AND f.categorie_id = ?';
      params.push(categorie_id);
    }
    if (type_categorie && ['Magasin', 'Camion', 'Autre'].includes(type_categorie)) {
      whereClause += ' AND c.type_categorie = ?';
      params.push(type_categorie);
    }
    if (numero_camion) {
      whereClause += ' AND f.numero_camion LIKE ?';
      params.push(`%${numero_camion}%`);
    }
    if (mode_paiement) {
      whereClause += ' AND f.mode_paiement = ?';
      params.push(mode_paiement);
    }

    // Récupérer les frais filtrés
    const [frais] = await pool.query(
      `SELECT f.*, c.nom as categorie_nom, c.type_categorie
       FROM frais f 
       JOIN categories_frais c ON f.categorie_id = c.id 
       ${whereClause}
       ORDER BY f.date_frais DESC, f.id DESC`,
      params
    );

    if (frais.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'Aucun frais trouvé avec ces filtres'
      });
    }

    // Calculer les totaux
    const totalGeneral = frais.reduce((sum, f) => sum + parseFloat(f.montant), 0);

    // Totaux par type
    const totauxParType = {
      Magasin: 0,
      Camion: 0,
      Autre: 0
    };
    frais.forEach(f => {
      totauxParType[f.type_categorie] += parseFloat(f.montant);
    });

    // Créer le PDF
    const doc = new PDFDocument({ margin: 50, size: 'A4' });

    res.setHeader("Content-Type", "application/pdf");
    const filename = `frais_export_${new Date().toISOString().split('T')[0]}.pdf`;
    res.setHeader("Content-Disposition", `attachment; filename=${filename}`);

    doc.pipe(res);

    // Check if logo exists
    const logoPath = path.join(__dirname, "../assets/logogargaa.png");
    const hasLogo = fs.existsSync(logoPath);

    // ========== HEADER SECTION ==========
    const headerY = 50;

    // Logo on the left (if exists)
    if (hasLogo) {
      try {
        doc.image(logoPath, 50, headerY, { width: 80, height: 80 });
      } catch (err) {
        console.log("Could not load logo:", err);
      }
    }

    // Company name and info on the right
    doc.fontSize(16)
      .font("Helvetica-Bold")
      .fillColor("#1e40af")
      .text("GARGAA TRANSPORT SARL", 300, headerY, { align: "right" });

    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#666666")
      .text("Rapport des Frais / Dépenses", 300, headerY + 20, { align: "right" });

    // Date in top right
    const today = new Date().toLocaleDateString("fr-FR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
    doc.fontSize(9)
      .fillColor("#333333")
      .text(`Généré le ${today}`, 300, headerY + 35, { align: "right" });

    doc.moveDown(3);

    // ========== FILTER SUMMARY ==========
    let currentY = 150;


    doc.fontSize(9)
      .font("Helvetica")
      .fillColor("#666666");

    if (date_debut && date_fin) {
      doc.text(`Période : du ${new Date(date_debut).toLocaleDateString("fr-FR")} au ${new Date(date_fin).toLocaleDateString("fr-FR")}`, 50, currentY);
      currentY += 15;
    } else if (date_debut) {
      doc.text(`À partir du : ${new Date(date_debut).toLocaleDateString("fr-FR")}`, 50, currentY);
      currentY += 15;
    } else if (date_fin) {
      doc.text(`Jusqu'au : ${new Date(date_fin).toLocaleDateString("fr-FR")}`, 50, currentY);
      currentY += 15;
    }

    if (type_categorie) {
      doc.text(`Type : ${type_categorie}`, 50, currentY);
      currentY += 15;
    }

    if (numero_camion) {
      doc.text(`Camion : ${numero_camion}`, 50, currentY);
      currentY += 15;
    }

    if (mode_paiement) {
      doc.text(`Mode de paiement : ${mode_paiement}`, 50, currentY);
      currentY += 15;
    }

    currentY += 20;

    // ========== EXPENSES TABLE ==========
    doc.fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("Note de frais", 50, currentY);

    currentY += 25;

    const tableLeft = 50;
    const tableWidth = 495;

    // Column widths
    const colWidths = {
      date: 70,
      type: 60,
      categorie: 110,
      montant: 70,
      paiement: 70,
      description: 115
    };

    // Helper to draw table cell
    const drawCell = (x, y, width, height, text, options = {}) => {
      const {
        bold = false,
        bgColor = null,
        textColor = "#000000",
        align = "left",
        fontSize = 8,
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
      const truncatedText = text.length > 30 ? text.substring(0, 27) + '...' : text;
      doc.text(truncatedText, x + 3, textY, {
        width: width - 6,
        align: align,
        lineBreak: false
      });
    };

    // Table header
    const headerHeight = 20;
    let colX = tableLeft;

    drawCell(colX, currentY, colWidths.date, headerHeight, "Date",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
    colX += colWidths.date;

    drawCell(colX, currentY, colWidths.type, headerHeight, "Type",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
    colX += colWidths.type;

    drawCell(colX, currentY, colWidths.categorie, headerHeight, "Catégorie",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
    colX += colWidths.categorie;

    drawCell(colX, currentY, colWidths.montant, headerHeight, "Montant",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
    colX += colWidths.montant;

    drawCell(colX, currentY, colWidths.paiement, headerHeight, "Paiement",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
    colX += colWidths.paiement;

    drawCell(colX, currentY, colWidths.description, headerHeight, "Description",
      { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });

    currentY += headerHeight;

    // Table rows
    const rowHeight = 18;
    const maxRowsPerPage = 30;
    let rowCount = 0;

    frais.forEach((f, index) => {
      // Check if we need a new page
      if (rowCount >= maxRowsPerPage) {
        doc.addPage();
        currentY = 50;
        rowCount = 0;

        // Redraw header on new page
        colX = tableLeft;
        drawCell(colX, currentY, colWidths.date, headerHeight, "Date",
          { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
        colX += colWidths.date;
        drawCell(colX, currentY, colWidths.type, headerHeight, "Type",
          { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
        colX += colWidths.type;
        drawCell(colX, currentY, colWidths.categorie, headerHeight, "Catégorie",
          { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
        colX += colWidths.categorie;
        drawCell(colX, currentY, colWidths.montant, headerHeight, "Montant",
          { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
        colX += colWidths.montant;
        drawCell(colX, currentY, colWidths.paiement, headerHeight, "Paiement",
          { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
        colX += colWidths.paiement;
        drawCell(colX, currentY, colWidths.description, headerHeight, "Description",
          { bold: true, bgColor: "#e5e7eb", align: "center", fontSize: 7 });
        currentY += headerHeight;
      }

      colX = tableLeft;
      const dateStr = new Date(f.date_frais).toLocaleDateString("fr-FR");
      const montantStr = parseFloat(f.montant).toFixed(2) + " DH";
      const descStr = f.description || f.numero_camion || "-";

      drawCell(colX, currentY, colWidths.date, rowHeight, dateStr, { fontSize: 7 });
      colX += colWidths.date;

      drawCell(colX, currentY, colWidths.type, rowHeight, f.type_categorie, { fontSize: 7 });
      colX += colWidths.type;

      drawCell(colX, currentY, colWidths.categorie, rowHeight, f.categorie_nom, { fontSize: 7 });
      colX += colWidths.categorie;

      drawCell(colX, currentY, colWidths.montant, rowHeight, montantStr, { align: "right", fontSize: 7 });
      colX += colWidths.montant;

      drawCell(colX, currentY, colWidths.paiement, rowHeight, f.mode_paiement, { fontSize: 7 });
      colX += colWidths.paiement;

      drawCell(colX, currentY, colWidths.description, rowHeight, descStr, { fontSize: 7 });

      currentY += rowHeight;
      rowCount++;
    });

    // ========== SUMMARY SECTION ==========
    currentY += 10;

    if (currentY > 650) {
      doc.addPage();
      currentY = 50;
    }

    doc.fontSize(12)
      .font("Helvetica-Bold")
      .fillColor("#000000")
      .text("Résumé", 50, currentY);

    currentY += 25;

    // Summary box
    const summaryBoxWidth = 250;
    const summaryBoxX = 545 - summaryBoxWidth - 50; // Right align
    const summaryRowHeight = 20;

    // Totaux par type
    if (totauxParType.Magasin > 0) {
      drawCell(summaryBoxX, currentY, 150, summaryRowHeight, "Total Magasin",
        { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
      drawCell(summaryBoxX + 150, currentY, 100, summaryRowHeight,
        totauxParType.Magasin.toFixed(2) + " DH",
        { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
      currentY += summaryRowHeight;
    }

    if (totauxParType.Camion > 0) {
      drawCell(summaryBoxX, currentY, 150, summaryRowHeight, "Total Camion",
        { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
      drawCell(summaryBoxX + 150, currentY, 100, summaryRowHeight,
        totauxParType.Camion.toFixed(2) + " DH",
        { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
      currentY += summaryRowHeight;
    }

    if (totauxParType.Autre > 0) {
      drawCell(summaryBoxX, currentY, 150, summaryRowHeight, "Total Autre",
        { bold: true, bgColor: "#f3f4f6", fontSize: 9 });
      drawCell(summaryBoxX + 150, currentY, 100, summaryRowHeight,
        totauxParType.Autre.toFixed(2) + " DH",
        { bold: true, bgColor: "#f3f4f6", align: "right", fontSize: 9 });
      currentY += summaryRowHeight;
    }

    // Total général
    drawCell(summaryBoxX, currentY, 150, summaryRowHeight, "TOTAL GÉNÉRAL",
      { bold: true, bgColor: "#dbeafe", fontSize: 10 });
    drawCell(summaryBoxX + 150, currentY, 100, summaryRowHeight,
      totalGeneral.toFixed(2) + " DH",
      { bold: true, bgColor: "#dbeafe", align: "right", fontSize: 10 });

    // ========== WATERMARK LOGO ==========
    if (hasLogo) {
      try {
        doc.save();
        const watermarkSize = 400;
        const watermarkX = (595.28 - watermarkSize) / 2;
        const watermarkY = 250;
        doc.opacity(0.1);
        doc.image(logoPath, watermarkX, watermarkY, {
          width: watermarkSize,
          height: watermarkSize,
          align: 'center'
        });
        doc.restore();
      } catch (err) {
        console.log("Could not add watermark:", err);
      }
    }

    // ========== FOOTER ==========
    const footerY = 750;
    doc.fontSize(7)
      .font("Helvetica")
      .fillColor("#666666")
      .text("GARGAA TRANSPORT SARL - Rapport généré automatiquement",
        50, footerY, { width: 495, align: "center" });

    doc.end();
  } catch (error) {
    console.error("Erreur export PDF frais:", error);
    res.status(500).json({ success: false, message: "Erreur export PDF" });
  }
});

module.exports = router;
