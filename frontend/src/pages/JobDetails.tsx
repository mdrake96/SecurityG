import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Container,
  Paper,
  Typography,
  Box,
  Button,
  Chip,
  Grid,
  Divider,
  Alert,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField
} from '@mui/material';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

interface Job {
  _id: string;
  title: string;
  description: string;
  location: {
    type: string;
    coordinates: number[];
  };
  requirements: string[];
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  client: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  };
  duration: {
    startDate: string;
    endDate: string;
    hoursPerDay: number;
  };
  rate: {
    amount: number;
    currency: string;
    paymentSchedule: 'hourly' | 'daily' | 'weekly';
  };
  applications: string[];
  createdAt: string;
}

const JobDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openDialog, setOpenDialog] = useState(false);
  const [application, setApplication] = useState({
    coverLetter: ''
  });

  useEffect(() => {
    fetchJobDetails();
  }, [id]);

  const fetchJobDetails = async () => {
    try {
      const response = await axios.get(`/api/jobs/${id}`);
      setJob(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch job details');
      setLoading(false);
    }
  };

  const handleApplicationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setApplication(prev => ({
      ...prev,
      coverLetter: value
    }));
  };

  const handleApply = async () => {
    try {
      await axios.post(`/api/jobs/${id}/apply`, application);
      setOpenDialog(false);
      setApplication({ coverLetter: '' });
      fetchJobDetails();
    } catch (err) {
      setError('Failed to submit application');
    }
  };

  const handleHireGuard = async (guardId: string) => {
    try {
      await axios.post(`/api/jobs/${id}/hire`, { guardId });
      fetchJobDetails();
    } catch (err) {
      setError('Failed to hire guard');
    }
  };

  if (loading) {
    return (
      <Container>
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (!job) {
    return (
      <Container>
        <Alert severity="error">Job not found</Alert>
      </Container>
    );
  }

  const hasApplied = job.applications.includes(user?._id || '');

  return (
    <Container>
      <Paper sx={{ p: 4, mt: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        <Box sx={{ mb: 4 }}>
          <Typography variant="h4" component="h1" gutterBottom>
            {job.title}
          </Typography>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Chip
              label={job.status}
              color={job.status === 'open' ? 'success' : 'default'}
              sx={{ mr: 2 }}
            />
            <Typography color="text.secondary">
              Posted on {new Date(job.createdAt).toLocaleDateString()}
            </Typography>
          </Box>
        </Box>

        <Grid container spacing={4}>
          <Grid item xs={12} md={8}>
            <Typography variant="h6" gutterBottom>
              Description
            </Typography>
            <Typography paragraph>
              {job.description}
            </Typography>

            <Typography variant="h6" gutterBottom>
              Requirements
            </Typography>
            <Box sx={{ mb: 3 }}>
              {job.requirements.map((req, index) => (
                <Chip
                  key={index}
                  label={req}
                  sx={{ mr: 1, mb: 1 }}
                />
              ))}
            </Box>

            <Typography variant="h6" gutterBottom>
              Schedule
            </Typography>
            <Typography paragraph>
              {new Date(job.duration.startDate).toLocaleDateString()} - {new Date(job.duration.endDate).toLocaleDateString()} ({job.duration.hoursPerDay}h/day)
            </Typography>
            <Typography variant="h6" gutterBottom>
              Rate
            </Typography>
            <Typography paragraph>
              {job.rate.currency} {job.rate.amount}/{job.rate.paymentSchedule}
            </Typography>
          </Grid>

          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 3, bgcolor: 'grey.50' }}>
              <Typography variant="h6" gutterBottom>
                Client Information
              </Typography>
              <Typography>
                {job.client.firstName} {job.client.lastName}
              </Typography>
              <Typography color="text.secondary">
                {job.client.email}
              </Typography>

              <Divider sx={{ my: 2 }} />

              {user?.role === 'guard' && job.status === 'open' && (
                <Button
                  variant="contained"
                  fullWidth
                  onClick={() => setOpenDialog(true)}
                  disabled={hasApplied}
                >
                  {hasApplied ? 'Already Applied' : 'Apply Now'}
                </Button>
              )}

              {user?.role === 'client' && user._id === job.client._id && (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    Applicants
                  </Typography>
                  {job.applications.length === 0 ? (
                    <Typography color="text.secondary">
                      No applicants yet
                    </Typography>
                  ) : (
                    <Box>
                      {job.applications.map((applicantId: string) => (
                        <Button
                          key={applicantId}
                          variant="outlined"
                          fullWidth
                          sx={{ mb: 1 }}
                          onClick={() => handleHireGuard(applicantId)}
                        >
                          Hire Guard
                        </Button>
                      ))}
                    </Box>
                  )}
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      </Paper>

      {/* Application Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Apply for Position</DialogTitle>
        <DialogContent>
          <Box sx={{ pt: 2 }}>
            <TextField
              fullWidth
              label="Cover Letter"
              multiline
              rows={6}
              value={application.coverLetter}
              onChange={handleApplicationChange}
              helperText="Explain why you're a good fit for this position"
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button onClick={handleApply} variant="contained">
            Submit Application
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default JobDetails; 