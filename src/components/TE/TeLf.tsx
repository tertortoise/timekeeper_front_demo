import React, { ChangeEvent, memo, useCallback, useMemo, FocusEvent } from 'react';
import { Grid, TextField, Theme } from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ChevronRightIcon from '@material-ui/icons/ChevronRight';
import { makeStyles } from '@material-ui/core/styles';
import { DateTimePicker } from '@material-ui/pickers';
import { Autocomplete } from '@material-ui/lab';
import clsx from 'clsx';
import { format } from 'date-fns'

import { TimeSliceTypes } from '../../interfaces/timeSliceInterfaces';
import { TeCtrlTypes, CtrlUiStatus, TeLfEntityInfo, TeLfData, TeLfEntityInfoTimeSlice, TeLfEntityInfoTaskGroup } from '../../interfaces/timeTracker';
import { getTimeDurationString } from '../../utils/timeDateUtils';
import MenuButton from '../MenuButton/MenuButton';

const useStyles = makeStyles((theme: Theme) => {
  const padding = `${theme.spacing(1)}px`;
  return ({
    textEllipsis: {
      whiteSpace: 'nowrap',
      flexWrap: 'wrap',
      overflow: 'hidden',
      textOverflow: 'ellipsis',
      maxWidth: '100%'
    },
    lfContainer: {
      fontSize: '1rem',
      height: '2.5rem',
      width: '100%',
      [theme.breakpoints.down('sm')]: {
        height: '7.5rem',
      }
    },
    lfContainerTaskGroup: {
      cursor: 'pointer',
      fontStyle: 'italic',
      [theme.breakpoints.down('sm')]: {
        height: '5rem',
      }
    },
    dscrContainerTaskGroup: {
      [theme.breakpoints.down('sm')]: {
        display: 'none!important'
      }
    },
    staticEditable: {
      textDecoration: 'underline',
      cursor: 'pointer'
    },
    staticEditableNoValue: {
      color: 'rgba(0, 0, 0, 0.4)',
    },
    prefixCtrl: {
      fontSize: '0.875rem',
      textAlign: 'center'
    },
    flexBlock: {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
    },
    taskGroup: {
      '& > :nth-child(1)': {
        flex: '0 1 12%',
        minWidth: 40,
      },
      '& > :nth-child(2)': {
        flex: '1 1 88%',
      }
    },
    timeGroup: {
      gap: 4,
      '& > div': {
        flex: '0 1 33%',
      },

    },
    loading: {
      background: 'linear-gradient(90deg, rgba(102, 86, 209, 0.1), rgba(102, 86, 209, 0.4), rgba(102, 86, 209, 0.2), rgba(102, 86, 209, 0.6));',
      backgroundSize: '400% 400%',
      animation: '$loading 3000ms ease infinite',
    },
    '@keyframes loading': {
      '0%': {
        backgroundPosition: '0% 50%',
      },
      '50%': {
        backgroundPosition: '100% 50%',
      },
      '100%': {
        backgroundPosition: '0% 50%',
      }
    },
    containerButtons: {
      justifyContent: 'center',
    },
    displayDiv: {
      fontSize: '1rem',
    },
    displayDivCenterBold: {
      textAlign: 'center',
      fontWeight: 600,
    },
    inputAdornment: {
      '& .MuiOutlinedInput-adornedEnd': {
        paddingRight: 0,
      },
    },
    buttonStyles: {
      background: 'initial',
      fontSize: '1rem',
      border: 'initial',
      borderRadius: '50%',
      paddingInline: 0,
      cursor: 'pointer',
      '&:hover': {
        background: 'rgba(102, 86, 209, 0.1)'
      }
    },
    hiddenTecsText: {
      fontStyle: 'italic'
    },
    progressBar: {
      position: 'absolute',
      width: `calc(100% - 2 * ${padding})`,
      bottom: 1
    },
    hide: {
      visibility: 'hidden'
    }
  })
})



type HandlerWithEntityInfo = (entityInfo: TeLfEntityInfo, ...args: any[]) => void;
type HandlerWithTimeSliceTypeEntityInfo = (entityInfo: TeLfEntityInfoTimeSlice, ...args: any[]) => void;
type HandlerWithTaskGroupTypeEntityInfo = (entityInfo: TeLfEntityInfoTaskGroup, ...args: any[]) => void;

export interface TeLfChangeHandlers {
  toggleCtrlHandler: HandlerWithEntityInfo;
  tsuValueChangeHandlerWithEntityInfo: HandlerWithEntityInfo;
  tsuInputValueChangeHandlerWithEntityInfo: HandlerWithEntityInfo;
  dscrValueChangeHandlerWithEntityInfo: HandlerWithTimeSliceTypeEntityInfo;
  dscrBlurHandlerWithEntityInfo: HandlerWithTimeSliceTypeEntityInfo;
  dateChangeHandlerWithEntityInfo: HandlerWithTimeSliceTypeEntityInfo;
  duplicateTeHandlerWithEntityInfo: HandlerWithTimeSliceTypeEntityInfo;
  deleteTeHandlerWithEntityInfo: HandlerWithTimeSliceTypeEntityInfo;
  createTeaHandlerWithEntityInfo: HandlerWithTimeSliceTypeEntityInfo;
  foldHandlerWithEntityInfo: HandlerWithTaskGroupTypeEntityInfo;
}

interface PropsTeLf extends TeLfData {
  handlersFromProps: TeLfChangeHandlers;
  isOpen?: boolean
}

const TeLf = ({ teLfCfg: { prefix: prefixCfg, tsu: tsuCfg, dscr: dscrCfg, start: startDateCfg, end: endDateCfg }, entityInfo, fetchStatus, handlersFromProps, isOpen }: PropsTeLf): JSX.Element => {

  const classes = useStyles();

  const isTaskGroup = entityInfo.teLfEntityType === 'teTaskGroup' ? true : false;

  const dateCtrlFormat = useMemo(() => {
    if (entityInfo.timeSlicingType !== TimeSliceTypes.DAY) {
      return 'HH:mm dd/MM'
    } else {
      return 'HH:mm'
    }
  }, [entityInfo])

  //#region handlers

  const toggleCtrlHandler = useCallback(
    (teLfCtrlTypeName: TeCtrlTypes, fieldNewValue: CtrlUiStatus.CTRL_ENABLED | CtrlUiStatus.STATIC_EDITABLE) => {
      handlersFromProps.toggleCtrlHandler(entityInfo, teLfCtrlTypeName, fieldNewValue);
    }, [entityInfo, handlersFromProps]);

  const tsuValueChangeHandler = useCallback(
    (event: ChangeEvent<{}>, newValue: string | null) => {
      handlersFromProps.tsuValueChangeHandlerWithEntityInfo(entityInfo, event, newValue);
    }, [entityInfo, handlersFromProps]);

  const tsuInputChangeHandler = useCallback(
    (event: ChangeEvent<{}>, newInputValue: string | null) => {
      handlersFromProps.tsuInputValueChangeHandlerWithEntityInfo(entityInfo, event, newInputValue);
    }, [entityInfo, handlersFromProps]);

  const dscrValueChangeHandler = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      handlersFromProps.dscrValueChangeHandlerWithEntityInfo(entityInfo as TeLfEntityInfoTimeSlice, event, event.target.value);
    }, [entityInfo, handlersFromProps]);

  const dscrBlurHandler = useCallback(
    (event: FocusEvent<HTMLInputElement>) => {
      handlersFromProps.dscrBlurHandlerWithEntityInfo(entityInfo as TeLfEntityInfoTimeSlice, event, event.target.value);
    }, [entityInfo, handlersFromProps]);

  const changeHandlerStartDate = useCallback((date: Date | null): void => {
    handlersFromProps.dateChangeHandlerWithEntityInfo(entityInfo as TeLfEntityInfoTimeSlice, date, 'start');
  }, [entityInfo, handlersFromProps]);

  const changeHandlerEndDate = useCallback((date: Date | null): void => {
    handlersFromProps.dateChangeHandlerWithEntityInfo(entityInfo as TeLfEntityInfoTimeSlice, date, 'end');
  }, [entityInfo, handlersFromProps]);

  const duplicateTeHandler = useCallback(() => {
    handlersFromProps.duplicateTeHandlerWithEntityInfo(entityInfo as TeLfEntityInfoTimeSlice);
  }, [entityInfo, handlersFromProps])

  const deleteTeHandler = useCallback(() => {
    handlersFromProps.deleteTeHandlerWithEntityInfo(entityInfo as TeLfEntityInfoTimeSlice);
  }, [entityInfo, handlersFromProps])

  const createTeaHandler = useCallback(() => {
    handlersFromProps.createTeaHandlerWithEntityInfo(entityInfo as TeLfEntityInfoTimeSlice);
  }, [entityInfo, handlersFromProps])

  const foldHandler = useCallback(() => {
    entityInfo.teLfEntityType === 'teTaskGroup' && handlersFromProps.foldHandlerWithEntityInfo(entityInfo as TeLfEntityInfoTaskGroup);
  }, [entityInfo, handlersFromProps])

  //#endregion


  const prefixCtrl = useMemo(() => {
    if (prefixCfg.status === CtrlUiStatus.OFF) {
      return null;
    }
    if (prefixCfg.status === CtrlUiStatus.CTRL_DISABLED) {
      return (
        <div
          className={clsx(classes.prefixCtrl)}
        >
          {prefixCfg.textValue !== '1/1' ? prefixCfg.textValue : null}
        </div>
      );
    }
    if (prefixCfg.status === CtrlUiStatus.CTRL_ENABLED) {
      return <div className={clsx(classes.flexBlock, classes.containerButtons)} >
        {isOpen
          ? <button className={clsx(classes.buttonStyles, classes.staticEditable)}><ExpandMoreIcon color="primary" /></button>
          : <button className={clsx(classes.buttonStyles, classes.staticEditable)}><ChevronRightIcon color="primary" /></button>}
      </div>

    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prefixCfg, isOpen])

  const tsuCtrl = useMemo(() => {
    const { status, tsuId, tsuOptions, tsuInputValue, tsuGetOptionLabel } = tsuCfg;
    let entityInfoTsuInputValue: string = '';
    if (entityInfo.teLfEntityType === 'teTimeSlice' || entityInfo.teLfEntityType === 'teTaskGroup') {
      entityInfoTsuInputValue = entityInfo.tsuInputValue;
    }
    if (status === CtrlUiStatus.STATIC_NONEDITABLE) {
      return <div
        className={clsx({ [classes.staticEditableNoValue]: !entityInfoTsuInputValue })}
      >{entityInfoTsuInputValue ? entityInfoTsuInputValue : 'No description'}</div>;
    }
    if (status === CtrlUiStatus.STATIC_EDITABLE) {
      return <div
        className={clsx(classes.staticEditable, { [classes.staticEditableNoValue]: !entityInfoTsuInputValue })}
        onClick={(e) => toggleCtrlHandler('tsu', CtrlUiStatus.CTRL_ENABLED)}
      >{entityInfoTsuInputValue ? entityInfoTsuInputValue : 'No task selected'}</div>;
    }
    if (status === CtrlUiStatus.CTRL_ENABLED) {
      return <Autocomplete
        openOnFocus
        value={tsuId}
        onChange={tsuValueChangeHandler}
        inputValue={tsuInputValue}
        onInputChange={tsuInputChangeHandler}
        onClose={() => toggleCtrlHandler('tsu', CtrlUiStatus.STATIC_EDITABLE)}
        options={tsuOptions}
        getOptionLabel={tsuGetOptionLabel}
        noOptionsText="No tasks created"
        blurOnSelect
        selectOnFocus
        // groupBy={({category}) => category.name}
        renderInput={(params: any) => (
          <TextField
            {...params}
            autoFocus
            placeholder="No task selected"
            size="small"
          />
        )}
      />
    }
    //default case for OFF status
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tsuCfg, entityInfo])

  const dscrCtrl = useMemo(() => {
    const { status, currentValue } = dscrCfg;
    if (status === CtrlUiStatus.STATIC_NONEDITABLE) {
      return <div
        className={clsx(classes.textEllipsis, { [classes.staticEditableNoValue]: !currentValue })}
      >{currentValue ? currentValue : 'No description'}</div>;
    }
    if (status === CtrlUiStatus.STATIC_EDITABLE) {
      return <div
        className={clsx(classes.textEllipsis, classes.staticEditable, { [classes.staticEditableNoValue]: !currentValue })}
        onClick={() => toggleCtrlHandler('dscr', CtrlUiStatus.CTRL_ENABLED)}
      >{currentValue ? currentValue : 'No description'}</div>;
    }
    if (status === CtrlUiStatus.CTRL_ENABLED) {
      return <TextField
        fullWidth
        autoFocus
        value={currentValue}
        inputProps={{ maxLength: 200 }}
        onChange={dscrValueChangeHandler}
        onBlur={dscrBlurHandler}
        placeholder="No description"
        size="small"
      />
    }
    //default case for OFF status
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dscrCfg, entityInfo])

  const startDateCtrl = useMemo(() => {
    const { status, sliceStartDate, maxDate } = startDateCfg;
    const startTimeString = format(sliceStartDate, dateCtrlFormat);
    // const startTimeString = sliceStartDate.toLocaleTimeString([], {hourCycle: 'h23'});
    if (status === CtrlUiStatus.STATIC_NONEDITABLE) {
      return <div className={clsx(classes.textEllipsis)}>{startTimeString}</div>;
    }
    if (status === CtrlUiStatus.STATIC_EDITABLE) {
      return <div
        className={clsx(classes.textEllipsis, classes.staticEditable)}
        onClick={(e) => toggleCtrlHandler('start', CtrlUiStatus.CTRL_ENABLED)}
      >{startTimeString}</div>;
    }
    if (status === CtrlUiStatus.CTRL_ENABLED) {
      return <DateTimePicker
        ampm={false}
        margin="normal"
        value={sliceStartDate}
        format={dateCtrlFormat}
        maxDate={maxDate}
        open
        autoFocus
        onChange={changeHandlerStartDate}
        onClose={() => toggleCtrlHandler('start', CtrlUiStatus.STATIC_EDITABLE)}
        strictCompareDates
        TextFieldComponent={(params) =>
          <TextField
            className={clsx(classes.inputAdornment)}
            {...params}
            size="small"
            margin="none"
          />}
      />
    }
    //default case for OFF status
    return undefined;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [startDateCfg, entityInfo])

  const endDateCtrl = useMemo(() => {
    const { status, sliceEndDate, minDate } = endDateCfg;
    const endTimeString = format(sliceEndDate, dateCtrlFormat);
    // const startTimeString = sliceStartDate.toLocaleTimeString([], {hourCycle: 'h23'});
    if (status === CtrlUiStatus.STATIC_NONEDITABLE) {
      return <div className={clsx(classes.textEllipsis)}>{endTimeString}</div>;
    }
    if (status === CtrlUiStatus.STATIC_EDITABLE) {
      return <div
        className={clsx(classes.textEllipsis, classes.staticEditable)}
        onClick={(e) => toggleCtrlHandler('end', CtrlUiStatus.CTRL_ENABLED)}
      >{endTimeString}</div>;
    }
    if (status === CtrlUiStatus.CTRL_ENABLED) {
      return <DateTimePicker
        ampm={false}
        margin="normal"
        value={sliceEndDate}
        format={dateCtrlFormat}
        minDate={minDate}
        open
        autoFocus
        onChange={changeHandlerEndDate}
        onClose={() => toggleCtrlHandler('end', CtrlUiStatus.STATIC_EDITABLE)}
        strictCompareDates
        TextFieldComponent={(params) =>
          <TextField
            className={clsx(classes.inputAdornment)}
            {...params}
            size="small"
            margin="none"
          />}
      />
    }
    //default case for OFF status
    return undefined;

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [endDateCfg, entityInfo])

  const duplicateTeBtn = useMemo(() => {
    return <span key="duplicateTeBtn" onClick={duplicateTeHandler}>Duplicate existing time entry</span>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityInfo]);

  const newTeaBtn = useMemo(() => {
    return <span key="newTeaBtn" onClick={createTeaHandler}>Start new timer</span>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityInfo]);

  const deleteTeBtn = useMemo(() => {
    return <span key="deleteTeBtn" onClick={deleteTeHandler}>Delete time entry</span>
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityInfo]);

  const menuButtonItems = useMemo(() => {
    if (entityInfo.teLfEntityType === 'teTimeSlice') {
      return [newTeaBtn, duplicateTeBtn, deleteTeBtn];
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [entityInfo])

  return (
    <div
      onClick={foldHandler}
      className={clsx(classes.lfContainer, { [classes.lfContainerTaskGroup]: isTaskGroup })}
    >
      <Grid
        container
        spacing={1}
        className={clsx({ [classes.loading]: fetchStatus.loading })}>
        <Grid item xs={12} md={4} className={clsx(classes.flexBlock, classes.taskGroup)}>
          {prefixCtrl}
          {tsuCtrl}
        </Grid>
        <Grid item xs={12} md={3} lg={4} className={clsx(classes.flexBlock, { [classes.dscrContainerTaskGroup]: isTaskGroup })}>
          {!isTaskGroup
            ? dscrCtrl
            : isOpen
              ? <div className={clsx(classes.textEllipsis, classes.hiddenTecsText)}>{prefixCfg.textValue} time entries are in this task group</div>
              : <div className={clsx(classes.textEllipsis, classes.hiddenTecsText)}>{prefixCfg.textValue} time entries are hidden</div>
          }
          { }
        </Grid>
        <Grid item xs={9} md={4} lg={3} className={clsx(classes.flexBlock, classes.timeGroup)}>
          {startDateCtrl}
          {endDateCtrl}
          <div className={clsx(classes.displayDiv, classes.displayDivCenterBold)}>
            {getTimeDurationString(entityInfo.durationMS)}
            {/* {isTaskGroup
            ? getTimeDurationString(endDateCfg.sliceEndMS - startDateCfg.sliceStartMS)
            : getTimeDurationString(entityInfo.durationMS)
          } */}
          </div>
        </Grid>
        <Grid item xs={3} md={1} className={clsx(classes.flexBlock, classes.containerButtons)}>
          {!isTaskGroup
            ? <MenuButton
              disabled={fetchStatus.editing || !!fetchStatus.loading}
            >
              {menuButtonItems}
            </MenuButton>
            : <button
              className={clsx(classes.buttonStyles, classes.staticEditable)}
            >
              {prefixCfg.textValue}
            </button>
          }
        </Grid>
      </Grid>
    </div>
  )
}

const propsAreEqual = (prevProps: PropsTeLf, nextProps: PropsTeLf): boolean => {

  if (prevProps.teLfCfg === nextProps.teLfCfg && prevProps.entityInfo === nextProps.entityInfo && prevProps.fetchStatus === nextProps.fetchStatus && prevProps.isOpen === nextProps.isOpen) {
    return true;
  }

  return false;
}

export default memo(TeLf, propsAreEqual);