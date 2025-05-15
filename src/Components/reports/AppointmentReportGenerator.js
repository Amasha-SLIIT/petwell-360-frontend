import React, { useState, useRef } from 'react';
import { 
  Button, Dialog, DialogActions, DialogContent, DialogTitle, 
  FormControl, FormControlLabel, Checkbox, Typography, Box, 
  CircularProgress, Grid, Card, CardContent, Divider, MenuItem, 
  Select, InputLabel, TextField, IconButton
} from '@mui/material';
import { 
  PictureAsPdf, Close, CalendarMonth, 
  FilterAlt, Download
} from '@mui/icons-material';
import { format } from 'date-fns';
import jsPDF from 'jspdf';
import 'jspdf-autotable';

const ArticleReportGenerator = ({ articles, doctorName }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewReady, setPreviewReady] = useState(false);
  const reportRef = useRef(null);
  const [reportOptions, setReportOptions] = useState({
    includeContent: true,
    includeMetadata: true,
    dateRange: 'all',
    customStartDate: '',
    customEndDate: '',
  });
  
  const handleOpen = () => {
    setOpen(true);
    setPreviewReady(false);
  };
  
  const handleClose = () => {
    setOpen(false);
  };
  
  const handleOptionChange = (event) => {
    const { name, checked, value } = event.target;
    setReportOptions({
      ...reportOptions,
      [name]: name === 'includeContent' || name === 'includeMetadata' ? checked : value
    });
    
    setPreviewReady(false);
  };
  
  const handleInputChange = (event) => {
    const { name, value } = event.target;
    setReportOptions({
      ...reportOptions,
      [name]: value
    });
    
    setPreviewReady(false);
  };
  
  const generatePreview = async () => {
    setLoading(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 100));
      setPreviewReady(true);
    } catch (error) {
      console.error('Error generating preview:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const generatePDF = async () => {
    if (!reportRef.current) return;
    
    setLoading(true);
    
    try {
      const doc = new jsPDF();
      
      // Add header
      doc.setFontSize(22);
      doc.setTextColor(41, 98, 255);
      doc.text('PetWell 360°', 105, 20, { align: 'center' });
      
      doc.setFontSize(16);
      doc.setTextColor(0, 0, 0);
      doc.text('Medical Articles Report', 105, 30, { align: 'center' });
      
      doc.setFontSize(10);
      doc.setTextColor(100, 100, 100);
      doc.text(`Generated on ${format(new Date(), 'MMMM d, yyyy')} by Dr. ${doctorName}`, 105, 38, { align: 'center' });
      
      // Add date range
      let dateRangeText = '';
      switch(reportOptions.dateRange) {
        case 'all': 
          dateRangeText = 'All time'; 
          break;
        case 'last7days': 
          dateRangeText = 'Last 7 days'; 
          break;
        case 'last30days': 
          dateRangeText = 'Last 30 days'; 
          break;
        case 'last90days': 
          dateRangeText = 'Last 90 days'; 
          break;
        case 'custom': 
          dateRangeText = `${format(new Date(reportOptions.customStartDate), 'MMM d, yyyy')} - ${format(new Date(reportOptions.customEndDate), 'MMM d, yyyy')}`;
          break;
        default: 
          dateRangeText = 'All time';
      }
      doc.text(`Date Range: ${dateRangeText}`, 105, 45, { align: 'center' });
      
      // Add separator line
      doc.setDrawColor(200, 200, 200);
      doc.line(20, 50, 190, 50);
      
      // Add summary section
      doc.setFontSize(14);
      doc.setTextColor(0, 0, 0);
      doc.text('Summary', 20, 60);
      
      doc.setFontSize(12);
      doc.text(`Total Articles: ${filteredArticles.length}`, 20, 70);
      
      // Add article details
      doc.setFontSize(14);
      doc.text('Article Details', 20, 85);
      
      let yPosition = 95;
      const pageWidth = doc.internal.pageSize.getWidth();
      
      // Loop through articles and add to document
      filteredArticles.forEach((article, index) => {
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }
        
        doc.setFontSize(12);
        doc.setTextColor(41, 98, 255);
        doc.text(`${index + 1}. ${article.title}`, 20, yPosition);
        yPosition += 8;
        
        if (reportOptions.includeMetadata) {
          doc.setFontSize(10);
          doc.setTextColor(100, 100, 100);
          doc.text(`Author: ${article.author} | Date: ${format(new Date(article.date), 'MMMM d, yyyy')}`, 20, yPosition);
          yPosition += 6;
        }
        
        if (reportOptions.includeContent) {
          doc.setFontSize(10);
          doc.setTextColor(0, 0, 0);
          
          // Split content into lines to fit page width
          const textLines = doc.splitTextToSize(article.content, pageWidth - 40);
          
          // Check if we need a new page for content
          if (yPosition + (textLines.length * 5) > 280) {
            doc.addPage();
            yPosition = 20;
          }
          
          doc.text(textLines, 20, yPosition);
          yPosition += (textLines.length * 5) + 10;
        }
        
        // Add a separator between articles
        doc.setDrawColor(220, 220, 220);
        doc.line(20, yPosition, 190, yPosition);
        yPosition += 10;
      });
      
      // Add footer
      const pageCount = doc.internal.getNumberOfPages();
      for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(10);
        doc.setTextColor(150, 150, 150);
        doc.text(`End of Report • PetWell 360° • ${format(new Date(), 'yyyy')} • Page ${i} of ${pageCount}`, 105, 285, { align: 'center' });
      }
      
      // Save the PDF
      doc.save(`PetWell360_Articles_Report_${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const filterArticlesByDate = () => {
    if (reportOptions.dateRange === 'all') {
      return articles;
    }
    
    const today = new Date();
    let startDate;
    
    if (reportOptions.dateRange === 'custom' && 
        reportOptions.customStartDate && 
        reportOptions.customEndDate) {
      startDate = new Date(reportOptions.customStartDate);
      const endDate = new Date(reportOptions.customEndDate);
      endDate.setHours(23, 59, 59, 999);
      
      return articles.filter(article => {
        const articleDate = new Date(article.date);
        return articleDate >= startDate && articleDate <= endDate;
      });
    }
    
    switch (reportOptions.dateRange) {
      case 'last7days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 7);
        break;
      case 'last30days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 30);
        break;
      case 'last90days':
        startDate = new Date(today);
        startDate.setDate(today.getDate() - 90);
        break;
      default:
        return articles;
    }
    
    return articles.filter(article => new Date(article.date) >= startDate);
  };
  
  const filteredArticles = filterArticlesByDate();
  
  return (
    <>
      <Button
        variant="outlined"
        color="primary"
        startIcon={<PictureAsPdf />}
        onClick={handleOpen}
        sx={{ mx: 1 }}
      >
        Generate Articles Report
      </Button>
      
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span>Generate Articles Report</span>
          <IconButton onClick={handleClose} size="small">
            <Close />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={3}>
            <Grid item xs={12} md={4}>
              <Card elevation={2} sx={{ height: '100%' }}>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    Report Options
                  </Typography>
                  <Divider sx={{ mb: 2 }} />
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Content Options
                    </Typography>
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={reportOptions.includeContent}
                          onChange={handleOptionChange}
                          name="includeContent"
                        />
                      }
                      label="Include Article Content"
                    />
                    <FormControlLabel
                      control={
                        <Checkbox 
                          checked={reportOptions.includeMetadata}
                          onChange={handleOptionChange}
                          name="includeMetadata"
                        />
                      }
                      label="Include Author & Date"
                    />
                  </Box>
                  
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Date Range
                    </Typography>
                    <FormControl fullWidth size="small" sx={{ mb: 2 }}>
                      <InputLabel>Filter by Date</InputLabel>
                      <Select
                        value={reportOptions.dateRange}
                        onChange={handleOptionChange}
                        name="dateRange"
                        label="Filter by Date"
                      >
                        <MenuItem value="all">All Time</MenuItem>
                        <MenuItem value="last7days">Last 7 Days</MenuItem>
                        <MenuItem value="last30days">Last 30 Days</MenuItem>
                        <MenuItem value="last90days">Last 90 Days</MenuItem>
                        <MenuItem value="custom">Custom Range</MenuItem>
                      </Select>
                    </FormControl>
                    
                    {reportOptions.dateRange === 'custom' && (
                      <Grid container spacing={2}>
                        <Grid item xs={6}>
                          <TextField
                            label="Start Date"
                            type="date"
                            name="customStartDate"
                            value={reportOptions.customStartDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                          />
                        </Grid>
                        <Grid item xs={6}>
                          <TextField
                            label="End Date"
                            type="date"
                            name="customEndDate"
                            value={reportOptions.customEndDate}
                            onChange={handleInputChange}
                            InputLabelProps={{ shrink: true }}
                            size="small"
                            fullWidth
                          />
                        </Grid>
                      </Grid>
                    )}
                  </Box>
                  
                  <Button
                    variant="contained"
                    color="primary"
                    fullWidth
                    startIcon={<FilterAlt />}
                    onClick={generatePreview}
                    disabled={loading}
                  >
                    Generate Preview
                  </Button>
                </CardContent>
              </Card>
            </Grid>
            
            <Grid item xs={12} md={8}>
              <Card elevation={2}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6">
                      Report Preview
                    </Typography>
                    {previewReady && (
                      <Button
                        variant="contained"
                        color="success"
                        size="small"
                        startIcon={<Download />}
                        onClick={generatePDF}
                        disabled={loading}
                      >
                        Download PDF
                      </Button>
                    )}
                  </Box>
                  <Divider sx={{ mb: 2 }} />
                  
                  {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 400 }}>
                      <CircularProgress />
                    </Box>
                  ) : previewReady ? (
                    <Box 
                      sx={{ 
                        height: 500, 
                        overflow: 'auto',
                        boxShadow: 'inset 0 0 5px rgba(0,0,0,0.1)'
                      }}
                    >
                      <Box 
                        ref={reportRef}
                        id="article-report-preview" 
                        sx={{ 
                          bgcolor: '#ffffff',
                          p: 3
                        }}
                      >
                        <Box sx={{ textAlign: 'center', mb: 4 }}>
                          <Typography variant="h4" color="primary" gutterBottom>
                            PetWell 360°
                          </Typography>
                          <Typography variant="h5" gutterBottom>
                            Medical Articles Report
                          </Typography>
                          <Typography variant="body2" color="textSecondary">
                            Generated on {format(new Date(), 'MMMM d, yyyy')} by Dr. {doctorName}
                          </Typography>
                          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', my: 1 }}>
                            <CalendarMonth fontSize="small" sx={{ mr: 0.5 }} />
                            <Typography variant="body2" color="textSecondary">
                              {reportOptions.dateRange === 'all' ? 'All time' : 
                               reportOptions.dateRange === 'last7days' ? 'Last 7 days' :
                               reportOptions.dateRange === 'last30days' ? 'Last 30 days' :
                               reportOptions.dateRange === 'last90days' ? 'Last 90 days' :
                               reportOptions.dateRange === 'custom' ? 
                               `${format(new Date(reportOptions.customStartDate), 'MMM d, yyyy')} - ${format(new Date(reportOptions.customEndDate), 'MMM d, yyyy')}` : ''}
                            </Typography>
                          </Box>
                        </Box>
                        
                        <Divider sx={{ mb: 3 }} />
                        
                        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
                          Summary
                        </Typography>
                        
                        <Grid container spacing={2} sx={{ mb: 3 }}>
                          <Grid item xs={12}>
                            <Card sx={{ bgcolor: '#f5f9ff', borderLeft: '4px solid #2196f3' }}>
                              <CardContent>
                                <Typography color="textSecondary" variant="subtitle2">
                                  Total Articles
                                </Typography>
                                <Typography variant="h4">
                                  {filteredArticles.length}
                                </Typography>
                              </CardContent>
                            </Card>
                          </Grid>
                        </Grid>
                        
                        <Typography variant="h6" gutterBottom sx={{ mt: 4, mb: 2 }}>
                          Article Details
                        </Typography>
                        
                        {filteredArticles.length > 0 ? (
                          filteredArticles.map((article, index) => (
                            <Card key={article._id} sx={{ mb: 2, border: '1px solid #e0e0e0' }}>
                              <CardContent>
                                <Typography variant="h6" color="primary" gutterBottom>
                                  {index + 1}. {article.title}
                                </Typography>
                                
                                {reportOptions.includeMetadata && (
                                  <Box sx={{ display: 'flex', mb: 1 }}>
                                    <Typography variant="body2" color="textSecondary" sx={{ mr: 2 }}>
                                      <strong>Author:</strong> {article.author}
                                    </Typography>
                                    <Typography variant="body2" color="textSecondary">
                                      <strong>Date:</strong> {format(new Date(article.date), 'MMMM d, yyyy')}
                                    </Typography>
                                  </Box>
                                )}
                                
                                {reportOptions.includeContent && (
                                  <Typography variant="body2" paragraph sx={{ mt: 1 }}>
                                    {article.content}
                                  </Typography>
                                )}
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Box sx={{ textAlign: 'center', py: 3 }}>
                            <Typography color="textSecondary">
                              No articles found for the selected date range.
                            </Typography>
                          </Box>
                        )}
                        
                        <Box sx={{ mt: 4, borderTop: '1px dashed #ccc', pt: 2, textAlign: 'center' }}>
                          <Typography variant="body2" color="textSecondary">
                            End of Report • PetWell 360° • {format(new Date(), 'yyyy')}
                          </Typography>
                        </Box>
                      </Box>
                    </Box>
                  ) : (
                    <Box sx={{ 
                      display: 'flex', 
                      justifyContent: 'center', 
                      alignItems: 'center', 
                      height: 400,
                      bgcolor: '#f9f9f9',
                      borderRadius: 1
                    }}>
                      <Typography color="textSecondary">
                        Click "Generate Preview" to see your report
                      </Typography>
                    </Box>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="inherit">
            Cancel
          </Button>
          {previewReady && (
            <Button 
              onClick={generatePDF} 
              variant="contained" 
              color="primary"
              startIcon={<Download />}
              disabled={loading}
            >
              Download PDF
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ArticleReportGenerator;
