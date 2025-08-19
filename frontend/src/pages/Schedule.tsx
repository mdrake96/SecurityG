import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Box,
  Tabs,
  Tab
} from '@mui/material';
import CalendarView, { Assignment } from '../components/CalendarView';
import RatingSystem from '../components/RatingSystem';
import { useAuth } from '../contexts/AuthContext';
import axios from 'axios';

const Schedule: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      const response = await axios.get('/api/jobs');
      const jobs = response.data;
      const formattedAssignments = jobs.map((job: any) => ({
        _id: job._id,
        title: job.title,
        startDate: job.duration.startDate,
        endDate: job.duration.endDate,
        securityType: job.securityType,
        status: job.status,
        rating: job.rating
      }));
      setAssignments(formattedAssignments);
      setLoading(false);
    } catch (err) {
      setError('Failed to fetch assignments');
      setLoading(false);
    }
  };

  const handleDateClick = (date: Date) => {
    setSelectedDate(date);
    setTabValue(1);
  };

  const handleAssignmentClick = (assignment: Assignment) => {
    setSelectedAssignment(assignment);
    setTabValue(1);
  };

  const handleRate = async (rating: number, comment: string) => {
    if (!selectedAssignment) return;
    try {
      await axios.post(`/api/jobs/${selectedAssignment._id}/rate`, { rating, comment });
      await fetchAssignments();
    } catch (err) {
      throw new Error('Failed to submit rating');
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (error) return <Typography color="error">{error}</Typography>;

  return (
    <Container maxWidth="lg" sx={{ py: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Schedule & Ratings
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 3 }}>
        <Tabs value={tabValue} onChange={handleTabChange}>
          <Tab label="Calendar View" />
          <Tab label="Assignment Details" />
        </Tabs>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={8}>
          <CalendarView
            assignments={assignments}
            onDateClick={handleDateClick}
            onAssignmentClick={handleAssignmentClick}
          />
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>
              Assignment Details
            </Typography>
            {selectedAssignment ? (
              <Box>
                <Typography variant="subtitle1" gutterBottom>
                  {selectedAssignment.title}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Type: {selectedAssignment.securityType}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Status: {selectedAssignment.status}
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  Duration: {new Date(selectedAssignment.startDate).toLocaleDateString()} - {new Date(selectedAssignment.endDate).toLocaleDateString()}
                </Typography>
                {selectedAssignment.status === 'completed' && (
                  <RatingSystem
                    assignmentId={selectedAssignment._id}
                    onRate={handleRate}
                    existingRating={selectedAssignment.rating}
                  />
                )}
              </Box>
            ) : (
              <Typography color="text.secondary">
                Select an assignment to view details
              </Typography>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Schedule; 