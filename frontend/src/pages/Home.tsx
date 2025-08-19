import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardMedia
} from '@mui/material';
import Grid from '@mui/material/Grid';
import { useAuth } from '../contexts/AuthContext';

const features = [
  {
    title: 'Quick Security Coverage',
    description: 'Find qualified security guards for your immediate needs, whether it\'s for a day, week, or special event.',
    image: '/images/quick-coverage.jpg'
  },
  {
    title: 'Verified Guards',
    description: 'All security guards are thoroughly vetted, licensed, and experienced in temporary security assignments.',
    image: '/images/verified-guards.jpg'
  },
  {
    title: 'Flexible Booking',
    description: 'Book security guards for any duration - from a few hours to several weeks, with easy scheduling.',
    image: '/images/flexible-booking.jpg'
  },
  {
    title: 'Specialized Security',
    description: 'Find guards with specific expertise for events, construction sites, retail, or corporate security.',
    image: '/images/specialized-security.jpg'
  }
];

const Home: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <Box>
      {/* Hero Section */}
      <Box
        sx={{
          bgcolor: 'primary.main',
          color: 'white',
          py: 8,
          mb: 6
        }}
      >
        <Container maxWidth="md">
          <Typography
            component="h1"
            variant="h2"
            align="center"
            gutterBottom
            sx={{ fontWeight: 'bold' }}
          >
            Temporary Security Guard Hiring Made Simple
          </Typography>
          <Typography variant="h5" align="center" paragraph>
            Need security coverage for your event, business, or project? Find qualified security guards quickly and easily.
          </Typography>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            {user ? (
              <Button
                variant="contained"
                color="secondary"
                size="large"
                onClick={() => navigate('/jobs')}
                sx={{ mr: 2 }}
              >
                Find Security Guards
              </Button>
            ) : (
              <>
                <Button
                  variant="contained"
                  color="secondary"
                  size="large"
                  onClick={() => navigate('/register')}
                  sx={{ mr: 2 }}
                >
                  Post a Job
                </Button>
                <Button
                  variant="outlined"
                  color="inherit"
                  size="large"
                  onClick={() => navigate('/login')}
                >
                  Sign In
                </Button>
              </>
            )}
          </Box>
        </Container>
      </Box>

      {/* Features Section */}
      <Container maxWidth="lg" sx={{ mb: 8 }}>
        <Typography
          component="h2"
          variant="h3"
          align="center"
          gutterBottom
          sx={{ mb: 6 }}
        >
          Why Choose Our Platform
        </Typography>
        <Grid container spacing={4}>
          {features.map((feature, index) => (
            <Grid item key={index} xs={12} sm={6} md={3}>
              <Card
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s',
                  '&:hover': {
                    transform: 'scale(1.02)'
                  }
                }}
              >
                <CardMedia
                  component="img"
                  height="140"
                  image={feature.image}
                  alt={feature.title}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography gutterBottom variant="h5" component="h3">
                    {feature.title}
                  </Typography>
                  <Typography>
                    {feature.description}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* Call to Action */}
      <Box
        sx={{
          bgcolor: 'grey.100',
          py: 8,
          mt: 4
        }}
      >
        <Container maxWidth="md">
          <Typography variant="h4" align="center" gutterBottom>
            Ready to Find Your Security Guard?
          </Typography>
          <Typography variant="h6" align="center" color="text.secondary" paragraph>
            Post your security requirements and connect with qualified guards in minutes.
          </Typography>
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            {!user && (
              <Button
                variant="contained"
                color="primary"
                size="large"
                onClick={() => navigate('/register')}
              >
                Get Started
              </Button>
            )}
          </Box>
        </Container>
      </Box>
    </Box>
  );
};

export default Home; 