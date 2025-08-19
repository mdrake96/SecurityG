import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Box,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  FormHelperText
} from '@mui/material';
import { Add as AddIcon, FilterList as FilterIcon } from '@mui/icons-material';
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
  securityType: 'event' | 'construction' | 'retail' | 'corporate' | 'other';
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
  numberOfGuards: number;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  client: {
    _id: string;
    firstName: string;
    lastName: string;
  };
}

const Jobs: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openFilter, setOpenFilter] = useState(false);
  const [filters, setFilters] = useState({
    securityType: '',
    paymentSchedule: '',
    minRate: '',
    maxRate: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      const response = await axios.get('/api/jobs');
      setJobs(response.data);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch jobs');
      setLoading(false);
    }
  };

  const handleSelectChange = (event: SelectChangeEvent<string>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleInputChange = (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = event.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const applyFilters = () => {
    // Implement filter logic here
    setOpenFilter(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatRate = (rate: { amount: number; currency: string; paymentSchedule: 'hourly' | 'daily' | 'weekly' }) => {
    return `${rate.currency} ${rate.amount}/${rate.paymentSchedule}`;
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Typography variant="h4" component="h1">
          Security Guard Positions
        </Typography>
        <Box>
          <IconButton onClick={() => setOpenFilter(true)} sx={{ mr: 2 }}>
            <FilterIcon />
          </IconButton>
          {user?.role === 'client' && (
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => navigate('/jobs/new')}
            >
              Post a Job
            </Button>
          )}
        </Box>
      </Box>

      <Grid container spacing={3}>
        {jobs.map((job) => (
          <Grid item xs={12} md={6} lg={4} key={job._id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'transform 0.2s',
                '&:hover': {
                  transform: 'scale(1.02)',
                  cursor: 'pointer'
                }
              }}
              onClick={() => navigate(`/jobs/${job._id}`)}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  {job.title}
                </Typography>
                <Chip
                  label={job.securityType}
                  color="primary"
                  size="small"
                  sx={{ mb: 2 }}
                />
                <Typography variant="body2" color="text.secondary" paragraph>
                  {job.description}
                </Typography>
                <Box sx={{ mb: 2 }}>
                  <Typography variant="body2">
                    <strong>Duration:</strong> {formatDate(job.duration.startDate)} - {formatDate(job.duration.endDate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Hours per day:</strong> {job.duration.hoursPerDay}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Rate:</strong> {formatRate(job.rate)}
                  </Typography>
                  <Typography variant="body2">
                    <strong>Guards needed:</strong> {job.numberOfGuards}
                  </Typography>
                </Box>
                <Typography variant="body2" color="text.secondary">
                  Posted by: {job.client.firstName} {job.client.lastName}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Dialog open={openFilter} onClose={() => setOpenFilter(false)}>
        <DialogTitle>Filter Jobs</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 1 }}>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Security Type</InputLabel>
                <Select
                  name="securityType"
                  value={filters.securityType}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="event">Event Security</MenuItem>
                  <MenuItem value="construction">Construction Site</MenuItem>
                  <MenuItem value="retail">Retail Security</MenuItem>
                  <MenuItem value="corporate">Corporate Security</MenuItem>
                  <MenuItem value="other">Other</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <FormControl fullWidth>
                <InputLabel>Payment Schedule</InputLabel>
                <Select
                  name="paymentSchedule"
                  value={filters.paymentSchedule}
                  onChange={handleSelectChange}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="hourly">Hourly</MenuItem>
                  <MenuItem value="daily">Daily</MenuItem>
                  <MenuItem value="weekly">Weekly</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Min Rate"
                name="minRate"
                type="number"
                value={filters.minRate}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Max Rate"
                name="maxRate"
                type="number"
                value={filters.maxRate}
                onChange={handleInputChange}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="Start Date"
                name="startDate"
                type="date"
                value={filters.startDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid item xs={6}>
              <TextField
                fullWidth
                label="End Date"
                name="endDate"
                type="date"
                value={filters.endDate}
                onChange={handleInputChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenFilter(false)}>Cancel</Button>
          <Button onClick={applyFilters} variant="contained" color="primary">
            Apply Filters
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Jobs; 