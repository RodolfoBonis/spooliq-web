import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

/**
 * Export dashboard to PDF
 */
export async function exportDashboardToPDF(): Promise<void> {
  const element = document.getElementById('dashboard-content');

  if (!element) {
    throw new Error('Dashboard content not found');
  }

  try {
    // Capture the dashboard as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    const imgData = canvas.toDataURL('image/png');

    // Create PDF
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();

    const imgWidth = pdfWidth;
    const imgHeight = (canvas.height * pdfWidth) / canvas.width;

    let heightLeft = imgHeight;
    let position = 0;

    // Add first page
    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pdfHeight;

    // Add additional pages if content is longer than one page
    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    // Download PDF
    const fileName = `spooliq-dashboard-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  } catch (error) {
    console.error('Error exporting dashboard to PDF:', error);
    throw error;
  }
}

/**
 * Export dashboard to PNG image
 */
export async function exportDashboardToPNG(): Promise<void> {
  const element = document.getElementById('dashboard-content');

  if (!element) {
    throw new Error('Dashboard content not found');
  }

  try {
    // Capture the dashboard as canvas
    const canvas = await html2canvas(element, {
      scale: 2, // Higher quality
      useCORS: true,
      logging: false,
      backgroundColor: '#ffffff',
    });

    // Convert to blob and download
    canvas.toBlob((blob) => {
      if (!blob) {
        throw new Error('Failed to create image blob');
      }

      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      const fileName = `spooliq-dashboard-${new Date().toISOString().split('T')[0]}.png`;

      link.href = url;
      link.download = fileName;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Clean up
      URL.revokeObjectURL(url);
    });
  } catch (error) {
    console.error('Error exporting dashboard to PNG:', error);
    throw error;
  }
}
