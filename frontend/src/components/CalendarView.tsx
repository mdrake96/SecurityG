import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Chip,
  Tooltip
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon
} from '@mui/icons-material';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';

export interface Assignment {
  _id: string;
  title: string;
  startDate: string;
  endDate: string;
  securityType: string;
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  rating?: {
    score: number;
    comment: string;
  };
}

interface CalendarViewProps {
  assignments: Assignment[];
  onDateClick: (date: Date) => void;
  onAssignmentClick: (assignment: Assignment) => void;
}

const CalendarView: React.FC<CalendarViewProps> = ({
  assignments,
  onDateClick,
  onAssignmentClick
}) => {
  const [currentDate, setCurrentDate] = useState(new Date());

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd });

  const getAssignmentsForDate = (date: Date) => {
    return assignments.filter(assignment => {
      const start = new Date(assignment.startDate);
      const end = new Date(assignment.endDate);
      return isSameDay(date, start) || isSameDay(date, end) || (date > start && date < end);
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'primary';
      case 'in-progress':
        return 'warning';
      case 'completed':
        return 'success';
      case 'cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  const previousMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1));
  };

  const nextMonth = () => {
    setCurrentDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1));
  };

  return (
    <Paper sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <IconButton onClick={previousMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ flex: 1, textAlign: 'center' }}>
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={nextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography
              variant="subtitle2"
              align="center"
              sx={{ fontWeight: 'bold', mb: 1 }}
            >
              {day}
            </Typography>
          </Grid>
        ))}

        {days.map((day: Date) => {
          const dayAssignments = getAssignmentsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);

          return (
            <Grid item xs={12/7} key={day.toString()}>
              <Box
                sx={{
                  p: 1,
                  minHeight: 100,
                  border: '1px solid',
                  borderColor: 'divider',
                  bgcolor: isCurrentDay ? 'action.hover' : 'background.paper',
                  opacity: isCurrentMonth ? 1 : 0.5,
                  cursor: 'pointer',
                  '&:hover': {
                    bgcolor: 'action.hover'
                  }
                }}
                onClick={() => onDateClick(day)}
              >
                <Typography
                  variant="body2"
                  sx={{
                    mb: 1,
                    fontWeight: isCurrentDay ? 'bold' : 'normal'
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                {dayAssignments.map(assignment => (
                  <Tooltip
                    key={assignment._id}
                    title={`${assignment.title} (${assignment.securityType})`}
                  >
                    <Chip
                      label={assignment.title}
                      size="small"
                      color={getStatusColor(assignment.status)}
                      onClick={(e) => {
                        e.stopPropagation();
                        onAssignmentClick(assignment);
                      }}
                      sx={{ mb: 0.5, width: '100%', justifyContent: 'flex-start' }}
                    />
                  </Tooltip>
                ))}
              </Box>
            </Grid>
          );
        })}
      </Grid>
    </Paper>
  );
};

export default CalendarView; 