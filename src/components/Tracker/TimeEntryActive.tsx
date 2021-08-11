import { Paper, Grid, IconButton, TextField, Theme } from '@material-ui/core';
import { makeStyles } from '@material-ui/core/styles';
import CancelIcon from '@material-ui/icons/Cancel';
import PlayCircleOutlineIcon from '@material-ui/icons/PlayCircleOutline';
import StopIcon from '@material-ui/icons/Stop';
import Autocomplete from '@material-ui/lab/Autocomplete';
import { KeyboardDateTimePicker } from '@material-ui/pickers';
import clsx from 'clsx';
import { ChangeEvent, memo, useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { } from '../../interfaces/firebaseInterfaces';
import { TimeEntry } from '../../interfaces/timeTracker';
import { LDC_LTE_TEC_Saga } from '../../redux/LTESaga';
import { tasksSelectionListSelector } from '../../redux/tfmSlice';
import { LDC_TEA_Saga, LDD_TEA_Saga, LDU_TEA_Saga } from '../../redux/timeEntryActiveSaga';
import { selectTEADataSlice } from '../../redux/timeEntryActiveSlice';
import { ActionCreatorWithPayload, makeActionCreatorWithPayload } from '../../redux/utils';
import { getDateNoLaterThanNow } from '../../utils/timeDateUtils';
import ProgressBarWrapper from '../ProgressBarWrapper/ProgressBarWrapper';
import Stopwatch from '../Stopwatch/Stopwatch';


const useStyles = makeStyles((theme: Theme) => {
  const padding = `${theme.spacing(1)}px`;
  return ({
    containerTE: {
      width: '100%',
      margin: 4, //compensate grid spacing
      paddingInline: padding,
      position: 'relative',
      opacity: 0.9,
      backgroundColor: 'white',
      '& input': {
        paddingBlock: 5,
      }
    },
    taskGroup: {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      '& > button': {
        flex: '0 1 12%',
        minWidth: 40,
      },
      '& > div': {
        flex: '1 1 88%',
      }
    },
    controlsGroup: {
      display: 'flex',
      flexWrap: 'nowrap',
      alignItems: 'center',
      '& > div': {
        flex: '0 1 50%',
      }
    },
    containerButtons: {
      height: 32,
      '& > button': {
        minWidth: 14,
        flex: '0 1 50%',
      }
    },
    stopWatch: {
        fontSize: '1.2rem',
        textAlign: 'center',
        fontWeight: 'bold',
        color: theme.palette.primary.main,
    },
    inputAdornment: {
      '& button': {
        padding: 0,
      },
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

function TimeEntryComponent(): JSX.Element {
  //#region config, selectors
  const classes = useStyles();
  const dispatch = useDispatch();
  const dataTSL = useSelector(tasksSelectionListSelector);
  const { data: timeEntryData, status: { loading: timeEntryStatusLoading} } = useSelector(selectTEADataSlice);

  let start: number | undefined = timeEntryData?.start,
    sagaActionCreatorLDU_TE: ActionCreatorWithPayload = makeActionCreatorWithPayload<never>(LDU_TEA_Saga);
  //#endregion


  //#region change handlers
  const propsTSUId = timeEntryData?.TSU;
  const propsInputValueTSU = useMemo(() => {
    return dataTSL?.find(TSU => TSU.id === propsTSUId)?.label;
  }, [propsTSUId, dataTSL]);

  const [valueTSU, setValueTSU] = useState<string | null>(propsTSUId ?? null);
  const changeHandlerValueTSU = (event: ChangeEvent<{}>, newValue: string | null) => {
    // update local state
    setValueTSU(newValue);
    if (propsTSUId !== newValue) {
      dispatch(sagaActionCreatorLDU_TE({ fieldNameToUpdate: 'TSU', fieldNewValue: newValue ? newValue : null }))
    }
  };

  const [inputValueTSU, setInputValueTSU] = useState(propsInputValueTSU ?? '');
  const changeHandlerInputValueTSU = (event: unknown, newInputValue: string) => {
    setInputValueTSU(newInputValue);
  }

  const propsDescription = timeEntryData?.description ?? '';

  const [description, setDescription] = useState(propsDescription);

  const changeHandlerDescription = (e: ChangeEvent<HTMLInputElement>) => {
    setDescription(e.target.value);
  }

  const blurHandlerDescription = () => {
    if (propsDescription !== description) {
      dispatch(sagaActionCreatorLDU_TE({ fieldNameToUpdate: 'description', fieldNewValue: description ? description : '' }))
    }
  }

  //#region  Handling dates

  const [startDate, setStartDate] = useState<Date | null>(start ? new Date(start) : null);

  const changeHandlerStartDate = (date: Date | null, value?: string | null): void => {
    if (!date || Number.isNaN(date?.valueOf())) {
      return;
    }

    let dateToSet = getDateNoLaterThanNow(date!);
    
    if (timeEntryData && timeEntryData.start !== dateToSet.valueOf()) {
      dispatch(sagaActionCreatorLDU_TE({ fieldNameToUpdate: 'start', fieldNewValue: dateToSet!.valueOf() }))
    }
  }

  const blurHandlerStartDate = () => {
    if (startDate) {
      const newDate = new Date(startDate?.valueOf())
      setStartDate(newDate);
    }
  }

  //#endregion

  const handleStartClick = () => {
    const newTEA: TimeEntry = {
      start: Date.now(),
    }
    if (description) {
      newTEA.description = description;
    }
    if (valueTSU) {
      newTEA.TSU = valueTSU;
    }
    dispatch({ type: LDC_TEA_Saga, payload: newTEA });
  }

  const handleStopClick = () => {

    const timeEntryObject: TimeEntry = {
      start: startDate!.valueOf(),
      end: Date.now(),
    }
    if (description) {
      timeEntryObject.description = description;
    }
    if (valueTSU) {
      timeEntryObject.TSU = valueTSU;
    }
    dispatch({ type: LDC_LTE_TEC_Saga, payload: timeEntryObject })
    dispatch({ type: LDD_TEA_Saga })
  }

  const handleCancelClick = () => {
    dispatch({ type: LDD_TEA_Saga });
  }
  //#endregion

  //#region useEffects

  useEffect(() => {
    propsTSUId !== valueTSU && setValueTSU(propsTSUId ?? null);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsTSUId, propsTSUId])


  useEffect(() => {
    if (description === propsDescription) {
      return;
    }
    propsDescription !== description && setDescription(propsDescription);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [propsDescription])

  useEffect(() => {
    if (start !== startDate?.valueOf()) {
      setStartDate(start ? new Date(start) : null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [start])

  //#endregion

  const getControlsGroup = (): JSX.Element[] => {

    const result: JSX.Element[] = [];
    const play = <IconButton
      key='play_button'
      disabled={!!timeEntryStatusLoading}
      onClick={handleStartClick}
    >
      <PlayCircleOutlineIcon />
    </IconButton>;
    const stop = <IconButton
      key='stop_button'
      disabled={!!timeEntryStatusLoading}
      color="secondary"
      onClick={handleStopClick}
    >
      <StopIcon />
    </IconButton>
    const cancel = <IconButton
      key='cancel_button'
      disabled={!timeEntryData || !!timeEntryStatusLoading}
      onClick={handleCancelClick}>
      <CancelIcon />
    </IconButton>;
    if (timeEntryData) {
      result.push(stop, cancel);
    } else {
      result.push(play, cancel);
    }
    return result;
  }





  // performance.measure('TIMEENTRY', 'TIMEENTRY')
  return (
    <>
      {
        <Paper elevation={3} className={clsx(classes.containerTE)}>
          <Grid container spacing={1}>
            <Grid item xs={12} md={3}>
              <div className={clsx(classes.taskGroup)}>
                <Autocomplete
                  value={valueTSU}
                  onChange={changeHandlerValueTSU}
                  inputValue={inputValueTSU}
                  onInputChange={changeHandlerInputValueTSU}
                  options={dataTSL ? dataTSL.map(data => data.id) : []}
                  getOptionLabel={(option) => {
                    const optionObj = dataTSL?.find(data => data.id === option);
                    return optionObj ? optionObj.label : '';
                  }}
                  noOptionsText="No options are available"
                  blurOnSelect
                  disabled={!timeEntryData}
                  // groupBy={({category}) => category.name}
                  renderInput={(params) => (
                    <TextField
                      {...params}
                      // label="Task"
                      placeholder="No task selected"
                      // variant="outlined"
                      size="small"
                    />
                  )}
                />
              </div>

            </Grid>
            <Grid item xs={12} md={4} lg={5} style={{ display: 'flex' }}>
              <div style={{ width: '100%' }}>
                <TextField
                  fullWidth
                  value={description}
                  onChange={changeHandlerDescription}
                  onBlur={blurHandlerDescription}
                  placeholder="Description"
                  // variant="outlined"
                  // label="Description"
                  size="small"
                  inputProps={{ maxLength: 100 }}
                  disabled={!timeEntryData}
                />
              </div>
            </Grid>
            <Grid item xs={9} md={4} lg={3}>
              <div className={clsx(classes.controlsGroup)}>
                <KeyboardDateTimePicker
                    ampm={false}
                    // inputVariant="outlined"
                    margin="normal"
                    // label="Start"
                    value={startDate}
                    format="HH:mm"
                    disableFuture={true}
                    onChange={changeHandlerStartDate}
                    onBlur={blurHandlerStartDate}
                    strictCompareDates
                    TextFieldComponent={(params) =>
                      <TextField
                        className={clsx(classes.inputAdornment)}
                        {...params}
                        size="small"
                        margin="none"
                        disabled={!timeEntryData}
                      />}
                    KeyboardButtonProps={{
                      'aria-label': 'change time',
                    }}
                    disabled={!timeEntryData}
                  />
                  <Stopwatch
                    startTime={startDate?.valueOf()}
                    renderShowElement={(timeToShow) =>
                      <div className={clsx(classes.stopWatch)}>{timeToShow}</div>
                    }
                  />
              </div>
            </Grid>
            <Grid item xs={3} md={1}>
              <div className={clsx(classes.controlsGroup, classes.containerButtons)}>
                {getControlsGroup()}
              </div>
            </Grid>
            <div className={clsx(classes.progressBar)}>
            <ProgressBarWrapper
              hidden={!timeEntryStatusLoading}
              height={2}
            />
          </div>
          </Grid>
        </Paper>
      }
    </>
  )
}

export default memo(TimeEntryComponent);