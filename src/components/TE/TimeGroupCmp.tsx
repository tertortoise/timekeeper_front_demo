import { memo, useCallback, useMemo } from "react"
import { createStyles, makeStyles, Theme } from "@material-ui/core"
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import clsx from "clsx"
import { format, isToday, isYesterday, isThisWeek, isThisMonth } from 'date-fns'

import { TeLfEntityInfoTimeGroup } from "../../interfaces/timeTracker"
import { getTimeDurationString } from "../../utils/timeDateUtils";
import { TimeSliceTypes } from "../../interfaces/timeSliceInterfaces";
import { DATAFNS_WEEK_OPTIONS } from "./tecsManagerStateRecomputeUtils";

const useStyles = makeStyles((theme: Theme) => {
  return createStyles({
    flexBlock: {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
    },
    textEllipsis: {
      whiteSpace: 'nowrap',
      flexWrap: 'wrap',
      textOverflow: 'ellipsis'
    },
    accentedText: {
      fontSize: '1rem',
      fontWeight: 'bold'
    },
    cmpContainer: {
      fontSize: '1rem',
      backgroundColor: 'rgba(102, 86, 209, 0.15)'
    },
    openBtnBlock: {
      flex: '0 0 30px',
      minWidth: 30,
      justifyContent: 'center',
    },
    contentContainer: {
      flex: '1 1 100%',
      display: 'flex',
      alignItems: 'center',
      flexWrap: 'wrap'
    },
    timePeriodBlock: {
      flex: '1 1 auto',
      minWidth: 300
    },
    durationBlock: {
      textAlign: 'end',
      flex: '0 0 20%',
      paddingInline: '24px 8px',

      minWidth: 'max-content',
      maxWidth: 300,
    },
    buttonStyles: {
      width: 30,
      background: 'initial',
      border: 'initial',
      borderRadius: '50%',
      paddingInline: 0,
      cursor: 'pointer',
      '&:hover': {
        background: 'rgba(102, 86, 209, 0.1)'
      }
    },
  })
})

interface TimeGroupCmpProps {
  entityInfo: TeLfEntityInfoTimeGroup;
  isOpen: boolean;
  foldHandlerWithEntityInfo: (entityInfo: TeLfEntityInfoTimeGroup, ...args: any[]) => void;
}

const TimeGroupCmp = ({ entityInfo, isOpen, foldHandlerWithEntityInfo }: TimeGroupCmpProps) => {

  const classes = useStyles();

  const foldHandler = useCallback(() => {
    foldHandlerWithEntityInfo(entityInfo);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityInfo])

  const dataToDisplay = useMemo(() => {
    const periodType = entityInfo.teLFTimeGroupType;
    const periodEndTimeMS = entityInfo.sliceStartMS; //actually end date time
    const periodEndDate = new Date(periodEndTimeMS);
    let periodDisplayData: string = periodEndDate.toISOString();
    if (periodType === TimeSliceTypes.DAY) {
      periodDisplayData = isToday(periodEndDate) ? 'Today' : isYesterday(periodEndDate) ? 'Yesterday' : format(periodEndDate, 'dd/MMM/yyyy EEE');
    } else if (periodType === TimeSliceTypes.WEEK) {
      periodDisplayData = isThisWeek(periodEndDate, DATAFNS_WEEK_OPTIONS) ? 'This week' : `Week ending ${format(periodEndDate, 'dd/MMM/yyyy')}`
    } else if (periodType === TimeSliceTypes.MONTH) {
      periodDisplayData = isThisMonth(periodEndDate) ? 'This month' : `${format(periodEndDate, 'MMM yyy')}`
    }

    return {
      periodType: periodType.toLowerCase(),
      duration: getTimeDurationString(entityInfo.durationMS),
      periodDisplayData
    }
  }, [entityInfo])

  const openBtnBlock = useMemo(() => {
    return (<div className={clsx(classes.flexBlock, classes.openBtnBlock)}>
      {
        isOpen
          ? <button className={clsx(classes.buttonStyles)}><ExpandMoreIcon color="primary" /></button>
          : <button className={clsx(classes.buttonStyles)}><ChevronRightIcon color="primary" /></button>
      }
    </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen])

  const timePeriodBlock = useMemo(() => {
    return (
      <div className={clsx(classes.textEllipsis, classes.timePeriodBlock)}>{dataToDisplay.periodDisplayData}</div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityInfo])

  const durationBlock = useMemo(() => {
    return (
      <div className={clsx(classes.textEllipsis, classes.durationBlock)}>
        <span>{`${dataToDisplay.periodType}: `}</span>
        <span className={clsx(classes.accentedText)}>{`${dataToDisplay.duration}`}</span> 
      </div>
    )
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityInfo])

  return (
    <div
      onClick={foldHandler}
      className={clsx(classes.flexBlock, classes.cmpContainer)}
    >
      {openBtnBlock}
      <div className={clsx(classes.contentContainer)}>
        {timePeriodBlock}
        {durationBlock}
      </div>


    </div>
  )
}

const propsAreEqual = (prevProps: TimeGroupCmpProps, nextProps: TimeGroupCmpProps): boolean => {

  if (prevProps.entityInfo === nextProps.entityInfo && prevProps.isOpen === nextProps.isOpen) {
    return true;
  }

  return false;
}

export default memo(TimeGroupCmp, propsAreEqual)