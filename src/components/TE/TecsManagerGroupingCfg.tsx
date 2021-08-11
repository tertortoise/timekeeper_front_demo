import { memo, useMemo, ChangeEvent } from 'react';
import { FormControl, MenuItem, Select, FormControlLabel, Checkbox, Theme } from '@material-ui/core';
import { makeStyles, createStyles } from '@material-ui/core/styles';
import clsx from 'clsx';
import { TimeSliceTypes } from '../../interfaces/timeSliceInterfaces';

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    cfgLine: {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
    },
    formControl: {
      marginInlineStart: 8,
      minWidth: 120,
    },
    groupingTypeLabel: {
      fontSize: '1rem'
    }

  })
})

type TimeGroupingSelectValue = 'weekDay' | 'monthDay' | 'monthOnly' | 'weekOnly' | 'dayOnly' | 'none';

interface CmpProps {
  timeSlicingType?: TimeSliceTypes;
  timeGroupingType?: TimeSliceTypes;
  isTaskGrouping: boolean;
  handleGroupingCfgChange: Function;
}

const conversionMatrix = {
  weekDay: {
    timeGroupingType: TimeSliceTypes.WEEK,
    timeSlicingType: TimeSliceTypes.DAY,
  },
  monthDay: {
    timeGroupingType: TimeSliceTypes.MONTH,
    timeSlicingType: TimeSliceTypes.DAY,
  },
  weekOnly: {
    timeGroupingType: undefined,
    timeSlicingType: TimeSliceTypes.WEEK,
  },
  monthOnly: {
    timeGroupingType: undefined,
    timeSlicingType: TimeSliceTypes.MONTH,
  },
  dayOnly: {
    timeGroupingType: undefined,
    timeSlicingType: TimeSliceTypes.DAY,
  },
  none: {
    timeGroupingType: undefined,
    timeSlicingType: undefined,
    isTaskGrouping: false,
  }
}


const TecsManagerGroupingCfg = ({ timeSlicingType, timeGroupingType, isTaskGrouping, handleGroupingCfgChange }: CmpProps): JSX.Element => {

  const classes = useStyles();

  const timeGroupingSelectValue: TimeGroupingSelectValue = useMemo(() => {
    let resultValue: TimeGroupingSelectValue = 'none';
    if (timeGroupingType === TimeSliceTypes.WEEK) { //slicing maybe day only
      resultValue = 'weekDay';
    } else if (timeGroupingType === TimeSliceTypes.MONTH) {
      resultValue = 'monthDay';
    } else if (timeSlicingType === TimeSliceTypes.WEEK) {
      resultValue = 'weekOnly';
    } else if (timeSlicingType === TimeSliceTypes.MONTH) {
      resultValue = 'monthOnly';
    } else if (timeSlicingType === TimeSliceTypes.DAY) {
      resultValue = 'dayOnly';
    }
    return resultValue;
  }, [timeSlicingType, timeGroupingType])

  const handleTimeGroupingChange = (e: ChangeEvent<{ value: unknown }>) => {
    const newValue = e.target.value;
    const result = conversionMatrix[(newValue as TimeGroupingSelectValue)];
    handleGroupingCfgChange({ ...result });
  }

  const handleTaskGroupingCheckedChange = (event: ChangeEvent<HTMLInputElement>) => {
    console.log('task grouping changed')
    handleGroupingCfgChange({ isTaskGrouping: event.target.checked });
  }


  return (
    <div className={clsx(classes.cfgLine)}>
      <div className={clsx(classes.groupingTypeLabel)}>Grouping type</div>
      <FormControl className={classes.formControl}>
        <Select
          id="selectGrouping"
          value={timeGroupingSelectValue}
          onChange={handleTimeGroupingChange}
        >
          <MenuItem value={'weekDay'}>Week / Day</MenuItem>
          <MenuItem value={'monthDay'}>Month / Day</MenuItem>
          <MenuItem value={'weekOnly'}>Week only</MenuItem>
          <MenuItem value={'monthOnly'}>Month only</MenuItem>
          <MenuItem value={'dayOnly'}>Day only</MenuItem>
          <MenuItem value={'none'}>No time grouping</MenuItem>
        </Select>
      </FormControl>
      <FormControlLabel
        label="Subgroup by task"
        labelPlacement="start"
        control={
          <Checkbox
            color="primary"
            checked={isTaskGrouping && timeGroupingSelectValue !== 'none'}
            disabled={timeGroupingSelectValue === 'none'}
            onChange={handleTaskGroupingCheckedChange}
            inputProps={{ 'aria-label': 'primary checkbox' }}
          />
        }
      />
    </div>)
}

export default memo(TecsManagerGroupingCfg);