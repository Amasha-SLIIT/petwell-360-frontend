import React, { useState, useEffect } from 'react';
import { 
  Container, Typography, Box, Grid, Card, CardContent, 
  Divider, CircularProgress, TextField, InputAdornment,
  Paper, Chip
} from '@mui/material';
import { Search, Article as ArticleIcon, DateRange } from '@mui/icons-material';
import { getAllArticles } from '../services/articleService';
import Header from "../Components/Header";
import Footer from "../Components/Footer";
import '../styles/Articles.css';

const Articles = () => {
  const [articles, setArticles] = useState([]);
  const [filteredArticles, setFilteredArticles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedArticle, setSelectedArticle] = useState(null);

  useEffect(() => {
    fetchArticles();
  }, []);

  useEffect(() => {
    if (searchTerm.trim() === '') {
      setFilteredArticles(articles);
    } else {
      const filtered = articles.filter(article => 
        article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
        article.author.toLowerCase().includes(searchTerm.toLowerCase())
      );
      setFilteredArticles(filtered);
    }
  }, [searchTerm, articles]);

  const fetchArticles = async () => {
    try {
      setLoading(true);
      const data = await getAllArticles();
      setArticles(data);
      setFilteredArticles(data);
    } catch (error) {
      console.error("Error fetching articles:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const handleArticleClick = (article) => {
    setSelectedArticle(article);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <Box className="articles-page">
      <Header />
      
      <Container maxWidth="lg" className="articles-container">
        <Box className="articles-header">
          <Typography variant="h4" component="h1" className="articles-title">
            <ArticleIcon className="articles-icon" />
            Pet Health Articles
          </Typography>
          <Typography variant="subtitle1" className="articles-subtitle">
            Expert advice and information for pet owners
          </Typography>
        </Box>

        <Divider className="articles-divider" />
        
        <Box className="search-container">
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Search articles by title, content, or author..."
            value={searchTerm}
            onChange={handleSearchChange}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <Search />
                </InputAdornment>
              ),
            }}
            className="search-field"
          />
        </Box>
        
        {loading ? (
          <Box className="loading-container">
            <CircularProgress />
            <Typography>Loading articles...</Typography>
          </Box>
        ) : filteredArticles.length === 0 ? (
          <Paper className="empty-state">
            <Typography variant="h6">No articles found</Typography>
            <Typography variant="body1">
              {searchTerm ? "Try adjusting your search terms." : "Check back later for new articles."}
            </Typography>
          </Paper>
        ) : (
          <Grid container spacing={4} className="articles-content">
            {selectedArticle ? (
              <Grid item xs={12}>
                <Paper className="article-detail">
                  <Box className="article-detail-header">
                    <Typography variant="h4" className="article-detail-title">
                      {selectedArticle.title}
                    </Typography>
                    <Box className="article-meta">
                      <Chip 
                        icon={<DateRange />} 
                        label={formatDate(selectedArticle.date)} 
                        variant="outlined" 
                        className="date-chip"
                      />
                      <Typography variant="subtitle1" className="article-author">
                        By: {selectedArticle.author}
                      </Typography>
                    </Box>
                  </Box>
                  <Divider className="article-divider" />
                  <Box className="article-detail-content">
                    <Typography variant="body1" paragraph>
                      {selectedArticle.content.split('\n').map((paragraph, index) => (
                        <React.Fragment key={index}>
                          {paragraph}
                          <br /><br />
                        </React.Fragment>
                      ))}
                    </Typography>
                  </Box>
                  <Box className="back-link">
                    <Typography 
                      variant="body2" 
                      color="primary" 
                      onClick={() => setSelectedArticle(null)}
                      className="back-to-articles"
                    >
                      ← Back to all articles
                    </Typography>
                  </Box>
                </Paper>
              </Grid>
            ) : (
              <>
                {filteredArticles.map((article) => (
                  <Grid item xs={12} md={6} lg={4} key={article._id}>
                    <Card 
                      className="article-card" 
                      onClick={() => handleArticleClick(article)}
                    >
                      <CardContent className="article-card-content">
                        <Typography variant="h6" className="article-card-title">
                          {article.title}
                        </Typography>
                        <Typography variant="body2" color="textSecondary" className="article-card-date">
                          {formatDate(article.date)}
                        </Typography>
                        <Typography variant="body2" className="article-card-author">
                          By: {article.author}
                        </Typography>
                        <Divider className="article-card-divider" />
                        <Typography variant="body2" className="article-card-excerpt">
                          {article.content.length > 150 
                            ? `${article.content.substring(0, 150)}...` 
                            : article.content}
                        </Typography>
                        <Typography variant="body2" color="primary" className="read-more">
                          Read more →
                        </Typography>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </>
            )}
          </Grid>
        )}
      </Container>
      
      <Footer />
    </Box>
  );
};

export default Articles;
