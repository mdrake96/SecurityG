import React, { useState } from 'react';
import {
  Box,
  Typography,
  Rating,
  TextField,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Alert
} from '@mui/material';
import { Star as StarIcon } from '@mui/icons-material';

interface RatingSystemProps {
  assignmentId: string;
  onRate: (rating: number, comment: string) => Promise<void>;
  existingRating?: {
    score: number;
    comment: string;
  };
}

const RatingSystem: React.FC<RatingSystemProps> = ({
  assignmentId,
  onRate,
  existingRating
}) => {
  const [open, setOpen] = useState(false);
  const [rating, setRating] = useState<number>(existingRating?.score || 0);
  const [comment, setComment] = useState(existingRating?.comment || '');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) {
      setError('Please select a rating');
      return;
    }

    try {
      await onRate(rating, comment);
      setSuccess(true);
      setTimeout(() => {
        setOpen(false);
        setSuccess(false);
      }, 2000);
    } catch (err) {
      setError('Failed to submit rating. Please try again.');
    }
  };

  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Rating
          value={existingRating?.score || 0}
          readOnly
          precision={0.5}
          icon={<StarIcon fontSize="inherit" />}
        />
        {!existingRating && (
          <Button
            variant="outlined"
            size="small"
            onClick={() => setOpen(true)}
          >
            Rate Assignment
          </Button>
        )}
      </Box>

      <Dialog open={open} onClose={() => setOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Rate Assignment</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography component="legend">Rating</Typography>
            <Rating
              value={rating}
              onChange={(_, value) => {
                setRating(value || 0);
                setError('');
              }}
              precision={0.5}
              icon={<StarIcon fontSize="inherit" />}
            />
          </Box>
          <TextField
            fullWidth
            multiline
            rows={4}
            label="Comments"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            sx={{ mt: 2 }}
          />
          {error && (
            <Alert severity="error" sx={{ mt: 2 }}>
              {error}
            </Alert>
          )}
          {success && (
            <Alert severity="success" sx={{ mt: 2 }}>
              Rating submitted successfully!
            </Alert>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpen(false)}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            Submit Rating
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default RatingSystem; 