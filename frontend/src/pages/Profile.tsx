import React, { useState, useEffect } from 'react';
import {
  Container,
  Paper,
  Typography,
  Box,
  Grid,
  TextField,
  Button,
  Avatar,
  Divider,
  Alert,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Rating
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Review {
  _id: string;
  rating: number;
  comment: string;
  reviewer: {
    firstName: string;
    lastName: string;
  };
  createdAt: string;
}

interface ProfileData {
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  bio?: string;
  experience?: string;
  certifications?: string[];
}

const Profile: React.FC = () => {
  const { user, updateUser } = useAuth();
  const [profile, setProfile] = useState<ProfileData>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    location: '',
    bio: '',
    experience: '',
    certifications: []
  });
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editing, setEditing] = useState(false);
  const [newCertification, setNewCertification] = useState('');
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [review, setReview] = useState({
    rating: 0,
    comment: ''
  });

  useEffect(() => {
    fetchProfile();
    if (user?.role === 'guard') {
      fetchReviews();
    }
  }, []);

  const fetchProfile = async () => {
    try {
      const response = await axios.get('/api/users/profile');
      setProfile(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch profile');
      setLoading(false);
    }
  };

  const fetchReviews = async () => {
    try {
      if (!user) return;
      const response = await axios.get(`/api/reviews/user/${user._id}`);
      setReviews(response.data.reviews);
    } catch (err) {
      setError('Failed to fetch reviews');
    }
  };

  const handleProfileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setProfile(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveProfile = async () => {
    try {
      const response = await axios.put('/api/users/profile', profile);
      updateUser(response.data);
      setEditing(false);
    } catch (err) {
      setError('Failed to update profile');
    }
  };

  const handleAddCertification = () => {
    if (newCertification.trim()) {
      setProfile(prev => ({
        ...prev,
        certifications: [...(prev.certifications || []), newCertification.trim()]
      }));
      setNewCertification('');
    }
  };

  const handleRemoveCertification = (index: number) => {
    setProfile(prev => ({
      ...prev,
      certifications: prev.certifications?.filter((_, i) => i !== index)
    }));
  };

  const handleReviewChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setReview(prev => ({
      ...prev,
      comment: value
    }));
  };

  const handleSubmitReview = async () => {
    try {
      await axios.post('/api/reviews', {
        ...review,
        jobId: '',
      });
      setOpenReviewDialog(false);
      setReview({ rating: 0, comment: '' });
      fetchReviews();
    } catch (err) {
      setError('Failed to submit review');
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Grid container spacing={4} sx={{ mt: 2 }}>
        {/* Profile Information */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 4 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h4" component="h1">
                Profile
              </Typography>
              <Button
                variant="outlined"
                startIcon={<EditIcon />}
                onClick={() => setEditing(!editing)}
              >
                {editing ? 'Cancel' : 'Edit Profile'}
              </Button>
            </Box>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            <Grid container spacing={3}>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="First Name"
                  name="firstName"
                  value={profile.firstName}
                  onChange={handleProfileChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Last Name"
                  name="lastName"
                  value={profile.lastName}
                  onChange={handleProfileChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Email"
                  name="email"
                  value={profile.email}
                  disabled
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Phone"
                  name="phone"
                  value={profile.phone}
                  onChange={handleProfileChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Location"
                  name="location"
                  value={profile.location}
                  onChange={handleProfileChange}
                  disabled={!editing}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  fullWidth
                  label="Bio"
                  name="bio"
                  value={profile.bio}
                  onChange={handleProfileChange}
                  multiline
                  rows={4}
                  disabled={!editing}
                />
              </Grid>

              {user?.role === 'guard' && (
                <>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Experience"
                      name="experience"
                      value={profile.experience}
                      onChange={handleProfileChange}
                      multiline
                      rows={4}
                      disabled={!editing}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Typography variant="h6" gutterBottom>
                      Certifications
                    </Typography>
                    <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
                      <TextField
                        fullWidth
                        label="Add Certification"
                        value={newCertification}
                        onChange={(e) => setNewCertification(e.target.value)}
                        disabled={!editing}
                      />
                      <Button
                        variant="contained"
                        onClick={handleAddCertification}
                        disabled={!editing}
                      >
                        Add
                      </Button>
                    </Box>
                    <List>
                      {profile.certifications?.map((cert, index) => (
                        <ListItem key={index}>
                          <ListItemText primary={cert} />
                          {editing && (
                            <ListItemSecondaryAction>
                              <IconButton
                                edge="end"
                                onClick={() => handleRemoveCertification(index)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </ListItemSecondaryAction>
                          )}
                        </ListItem>
                      ))}
                    </List>
                  </Grid>
                </>
              )}

              {editing && (
                <Grid item xs={12}>
                  <Button
                    variant="contained"
                    color="primary"
                    onClick={handleSaveProfile}
                  >
                    Save Changes
                  </Button>
                </Grid>
              )}
            </Grid>
          </Paper>
        </Grid>

        {/* Reviews Section (for guards) */}
        {user?.role === 'guard' && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 4 }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h5">
                  Reviews
                </Typography>
                <Button
                  variant="outlined"
                  onClick={() => setOpenReviewDialog(true)}
                >
                  Add Review
                </Button>
              </Box>

              <List>
                {reviews.map(review => (
                  <React.Fragment key={review._id}>
                    <ListItem alignItems="flex-start">
                      <ListItemText
                        primary={
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                            <Typography variant="subtitle1">
                              {review.reviewer.firstName} {review.reviewer.lastName}
                            </Typography>
                            <Rating value={review.rating} readOnly size="small" />
                          </Box>
                        }
                        secondary={
                          <>
                            <Typography
                              component="span"
                              variant="body2"
                              color="text.primary"
                            >
                              {review.comment}
                            </Typography>
                            <Typography variant="caption" display="block" color="text.secondary">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Typography>
                          </>
                        }
                      />
                    </ListItem>
                    <Divider component="li" />
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          </Grid>
        )}
      </Grid>

      {/* Review Dialog */}
      <Dialog open={openReviewDialog} onClose={() => setOpenReviewDialog(false)}>
        <DialogTitle>Add Review</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <Rating
              value={review.rating}
              onChange={(_, value) => setReview(prev => ({ ...prev, rating: value || 0 }))}
              sx={{ mb: 2 }}
            />
            <TextField
              fullWidth
              label="Comment"
              multiline
              rows={4}
              value={review.comment}
              onChange={handleReviewChange}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenReviewDialog(false)}>Cancel</Button>
          <Button onClick={handleSubmitReview} variant="contained">
            Submit Review
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Profile; 