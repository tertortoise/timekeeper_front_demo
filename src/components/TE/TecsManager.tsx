import React, { ChangeEvent, FC, FocusEvent, Reducer, useMemo, useReducer, useState } from "react";
import clsx from 'clsx';
import { useSelector, useDispatch } from "react-redux";
import { makeStyles, createStyles } from '@material-ui/core/styles';
import { Paper, Theme } from '@material-ui/core';

import ProgressbarWrapper from '../ProgressBarWrapper/ProgressBarWrapper';
import { TimeSliceTypes, DateStartEndType } from '../../interfaces/timeSliceInterfaces';
import { TimeEntry, TEDataSliceInt, TeLfCfg, CtrlUiStatus, TeLfEntityInfo, TeLfData, TeLfEntityInfoTimeSlice, TeLfCtrlKeysWithLocalState, TeLfCtrlsWithLocalState, TeLfEntityInfoTaskGroup, TeLfEntityType, TeLfEntityInfoTimeGroup } from '../../interfaces/timeTracker';
import TeLf from "./TeLf";
import TimeGroupCmp from "./TimeGroupCmp";
import TecsManagerGroupingCfg from "./TecsManagerGroupingCfg";
import { tasksSelectionListSelector } from '../../redux/tfmSlice';
import { selectLTEData, selectLTEFetchStatus, CRUD_LTE_TEC_EditingStart, CRUD_LTE_TEC_EditingStop } from "../../redux/LTESlice";
import { LDC_LTE_TEC_Saga, LDC_LTE_TEC_TEA_Saga, LDD_LTE_TEC_Saga, LDU_LTE_TEC_Saga } from '../../redux/LTESaga';
import { recomputeTecsLfMapUtil } from "./tecsManagerStateRecomputeUtils";
import { TaskSelectionUnit } from "../../interfaces/tasks";


const useStyles = makeStyles((theme: Theme) => {
  const padding = `${theme.spacing(1)}px`;
  return createStyles({
    timeEntriesContainer: {
      marginTop: 8,
    },
    timeGroupBlockCntr: {
      width: '100%',
      marginBlockEnd: theme.spacing(1),
      // marginBlockEnd: theme.spacing(1)
    },
    timeSliceBlockCntr: {
      width: 'calc(100% - 8px)',
      marginInlineStart: theme.spacing(1),
      marginBlock: theme.spacing(1),
      borderInlineStart: `${theme.palette.primary.main} 1px solid`
    },
    containerTE: {
      padding: padding,
      position: 'relative',
    },
    childOfTaskGroup: {
      backgroundColor: 'rgba(102, 86, 209, 0.05)',
    }
  })
})

// const tasksSelectionListSelector = createSelector(
//   selectTfm,
//   (tasksFlatMap) => {
//     if (tasksFlatMap) {
//       return parseTasksFlatMapToSelectionList(tasksFlatMap);
//     };
//   },
// )

export interface TecsEntitiesBeingEditedLocallyCtrlData {
  ctrlObj: TeLfCfg;
  ctrlName: Exclude<TeLfCtrlKeysWithLocalState, 'prefix'>;
}

export interface TecsEntitiesBeingEditedLocally {
  //mapId of type: lteKey_sliceNumber_timeSlicingType || taskId_timeGroupKey_timeSlicingType
  [tecsLfMapId: string]: TecsEntitiesBeingEditedLocallyCtrlData;
}

export interface TecsLfMapGroupingCfg {
  timeSlicingType?: TimeSliceTypes;
  timeGroupingType?: TimeSliceTypes;
  isTaskGrouping: boolean;
}

export interface TecsManagerVisibilityGraphEntity {
  teLfEntityType: TeLfEntityType;
  isVisible: boolean;
  isOpen: boolean;
  parent: string | null;
  children: Set<string>;
}

// export interface TecsManagerVisibilityGraphLeaf {
//   isGroup: false;
//   isVisible: boolean;
//   parent?: string; //if no timeSlicing and no timeGrouping, only taskGrouping - parent may be absent
// }

//done only when 
export interface TecsManagerVisibilityGraph {
  [key: string]: TecsManagerVisibilityGraphEntity;
};

export interface TecsLfState {
  tecsLfMap: TeLfData[];
  tecsLfMapGroupingCfg: TecsLfMapGroupingCfg;
  visibilityGraph?: TecsManagerVisibilityGraph;
}

//TODO it should be array of updates
interface TecsLfStateActionChangeCtrlLocalState {
  type: 'changeCtrlLocalState';
  payload: {
    ctrlName: TeLfCtrlKeysWithLocalState;
    fieldNameToUpdate: any;
    fieldNewValue: any;
    entityInfo: TeLfEntityInfo;
  };
}

interface TecsLfStateActionRecomputeLteData {
  type: 'recomputeLteData';
  payload: {
    lteData: TEDataSliceInt[];
    taskSelectionList: TaskSelectionUnit[];
  };
}

interface TecsLfStateActionRecomputeGroupingCfg {
  type: 'recomputeGroupingCfg';
  payload: {
    lteData: TEDataSliceInt[];
    taskSelectionList: TaskSelectionUnit[];
    groupingCfgChange: Partial<TecsLfMapGroupingCfg>;
  }
}

interface TecsLfStateActionToggleFolding {
  type: 'foldingGroups';
  payload: {
    tesStateMapId: string;
    foldingType: 'open' | 'close' | 'toggle'
  }
}


type TecsLfStateAction = TecsLfStateActionChangeCtrlLocalState | TecsLfStateActionRecomputeLteData | TecsLfStateActionRecomputeGroupingCfg | TecsLfStateActionToggleFolding;


const tecsManagerStateReducer: Reducer<TecsLfState, TecsLfStateAction> = (state: TecsLfState, action: TecsLfStateAction) => {

  // TODO extract timeEntry slices being edited into a seperate slice in state
  const getTecsEntitiesBeingEditedLocallyWithCtrlKey = (): TecsEntitiesBeingEditedLocally | undefined => {
    let tecsBeingEditedLocally: TecsEntitiesBeingEditedLocally | undefined = undefined;
    state.tecsLfMap.forEach(teLfData => {
      const { teLfCfg } = teLfData;
      let tecsBeingEditedLocallyCtrlData: TecsEntitiesBeingEditedLocallyCtrlData | undefined = undefined;
      if (teLfCfg.tsu && teLfCfg.tsu.status === CtrlUiStatus.CTRL_ENABLED) {
        tecsBeingEditedLocallyCtrlData = {
          ctrlName: 'tsu',
          ctrlObj: teLfCfg,
        }
      } else if (teLfCfg.dscr && teLfCfg.dscr.status === CtrlUiStatus.CTRL_ENABLED) {
        tecsBeingEditedLocallyCtrlData = {
          ctrlName: 'dscr',
          ctrlObj: teLfCfg,
        }
      } else if (teLfCfg.start && teLfCfg.start.status === CtrlUiStatus.CTRL_ENABLED) {
        tecsBeingEditedLocallyCtrlData = {
          ctrlName: 'start',
          ctrlObj: teLfCfg,
        }
      } else if (teLfCfg.end && teLfCfg.end.status === CtrlUiStatus.CTRL_ENABLED) {
        tecsBeingEditedLocallyCtrlData = {
          ctrlName: 'end',
          ctrlObj: teLfCfg,
        }
      }

      if (tecsBeingEditedLocallyCtrlData) {
        if (!tecsBeingEditedLocally) {
          tecsBeingEditedLocally = {
            [teLfData.entityInfo.tesStateMapId]: tecsBeingEditedLocallyCtrlData,
          }
        } else {
          tecsBeingEditedLocally[teLfData.entityInfo.tesStateMapId] = tecsBeingEditedLocallyCtrlData;
        }
      }
    })
    return tecsBeingEditedLocally;
  }

  switch (action.type) {
    case 'changeCtrlLocalState': {
      const { entityInfo: { tesStateMapId }, ctrlName, fieldNameToUpdate, fieldNewValue } = action.payload;
      let idx: number | undefined = undefined;
      const teLfData = state.tecsLfMap.find((teLfDataObj, teLfDataObjIdx) => {
        if (teLfDataObj.entityInfo.tesStateMapId === tesStateMapId) {
          idx = teLfDataObjIdx;
          return true;
        } else {
          return false;
        }
      })
      if (!teLfData || idx === undefined) {
        return state;
      }
      // const teLfData = state.tecsLfMap[idx];
      const teLfCfgObj = teLfData.teLfCfg;
      const ctrlObj = teLfCfgObj[ctrlName];

      if (ctrlObj[fieldNameToUpdate as keyof TeLfCtrlsWithLocalState] === fieldNewValue) {
        return state;
      }

      const newState = { ...state };
      newState.tecsLfMap[idx] = {
        entityInfo: teLfData.entityInfo,
        fetchStatus: teLfData.fetchStatus,
        teLfCfg: {
          ...teLfCfgObj,
          [ctrlName]: {
            ...ctrlObj,
            [fieldNameToUpdate]: fieldNewValue
            // [action.payload.fieldNameToUpdate]: action.payload.fieldNewValue
          }
        }
      }
      return newState;
    }
    case 'recomputeLteData': {
      const { lteData, taskSelectionList } = action.payload;
      const { tecsLfMapGroupingCfg, visibilityGraph } = state;
      const newTecsManagerState = recomputeTecsLfMapUtil({
        lteData,
        taskSelectionList,
        tecsLfMapGroupingCfg,
        tecsEntitiesBeingEditedLocally: getTecsEntitiesBeingEditedLocallyWithCtrlKey(),
        visibilityGraph
      });
      return newTecsManagerState;
    }
    case 'recomputeGroupingCfg': {
      const { lteData, taskSelectionList, groupingCfgChange } = action.payload;
      const { tecsLfMapGroupingCfg, visibilityGraph } = state;
      const newGroupingCfg = {
        ...tecsLfMapGroupingCfg,
        ...groupingCfgChange,
      }
      const newTecsManagerState = recomputeTecsLfMapUtil({
        lteData,
        taskSelectionList,
        tecsLfMapGroupingCfg: newGroupingCfg,
        tecsEntitiesBeingEditedLocally: getTecsEntitiesBeingEditedLocallyWithCtrlKey(),
        visibilityGraph
      });
      return newTecsManagerState;
    }
    case 'foldingGroups': {
      // so far only toggle is implemented
      const { tesStateMapId } = action.payload;
      const { visibilityGraph } = state;
      const newVisibilityGraph = {
        ...visibilityGraph,
      }
      //only toggle is implemented
      const toggleVisibilityRecursively = (tesStateMapId: string, parentGroupsAreOpen: boolean): void => {

        newVisibilityGraph[tesStateMapId].children.forEach(childTesStateMapId => {
          newVisibilityGraph[childTesStateMapId].isVisible = parentGroupsAreOpen;
          if (newVisibilityGraph[childTesStateMapId].children.size) {

            const currentGroupOpenState = newVisibilityGraph[childTesStateMapId].isOpen;
            const childrenShouldBeVisible = parentGroupsAreOpen && currentGroupOpenState;
            toggleVisibilityRecursively(childTesStateMapId, childrenShouldBeVisible);
          } else {
            return;
          }
        })
      }
      const groupIsOpenNewState = !newVisibilityGraph[tesStateMapId].isOpen;
      newVisibilityGraph[tesStateMapId].isOpen = groupIsOpenNewState;

      toggleVisibilityRecursively(tesStateMapId, groupIsOpenNewState);

      return {
        ...state,
        visibilityGraph: newVisibilityGraph
      };

    }
  }
  return state;
}


const TecsManager: FC = () => {
  const classes = useStyles();
  const lteData = useSelector(selectLTEData);
  const dispatch = useDispatch();
  const tasksSelectionList = useSelector(tasksSelectionListSelector) ?? [];

  const initialTecsLfMapGroupingCfg = {
    timeSlicingType: TimeSliceTypes.DAY,
    timeGroupingType: TimeSliceTypes.WEEK,
    isTaskGrouping: true,
  };


  const [prevLteData, setPrevLteData] = useState(lteData);

  const { loading: LTELoading} = useSelector(selectLTEFetchStatus);

  const initialState = useMemo(() => {
    return recomputeTecsLfMapUtil({ lteData, taskSelectionList: tasksSelectionList, tecsLfMapGroupingCfg: initialTecsLfMapGroupingCfg });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const [{ tecsLfMap, visibilityGraph, tecsLfMapGroupingCfg }, dispatchTecsLfStateChange] = useReducer<Reducer<TecsLfState, TecsLfStateAction>>(tecsManagerStateReducer, initialState);

  if (lteData !== prevLteData) {
    dispatchTecsLfStateChange({ type: 'recomputeLteData', payload: { lteData, taskSelectionList: tasksSelectionList } });
    setPrevLteData(lteData)
  }

  //#region handlers

  const toggleCtrlHandler = (entityInfo: TeLfEntityInfo, teLfCtrlTypeName: TeLfCtrlKeysWithLocalState, fieldNewValue: CtrlUiStatus.CTRL_ENABLED | CtrlUiStatus.STATIC_EDITABLE) => {
    //setting all teSlices to non-editable in the first render
    dispatchTecsLfStateChange({ type: 'changeCtrlLocalState', payload: { ctrlName: teLfCtrlTypeName, fieldNameToUpdate: 'status', fieldNewValue, entityInfo } })
    //setting local ctrl to 
    if (entityInfo.teLfEntityType === 'teTimeSlice') {
      fieldNewValue === CtrlUiStatus.CTRL_ENABLED && dispatch(CRUD_LTE_TEC_EditingStart(entityInfo.teId));
      fieldNewValue === CtrlUiStatus.STATIC_EDITABLE && dispatch(CRUD_LTE_TEC_EditingStop(entityInfo.teId));
    }


  }

  const tsuValueChangeHandlerWithEntityInfo = (entityInfo: TeLfEntityInfo, event: ChangeEvent<{}>, newValue: string | null): void => {
    if ((entityInfo.teLfEntityType === 'teTimeSlice') && newValue !== entityInfo.tsuId) {
      dispatchTecsLfStateChange({ type: 'changeCtrlLocalState', payload: { ctrlName: 'tsu', fieldNameToUpdate: 'tsuId', fieldNewValue: newValue, entityInfo } });
      dispatchTecsLfStateChange({ type: 'changeCtrlLocalState', payload: { ctrlName: 'tsu', fieldNameToUpdate: 'status', fieldNewValue: CtrlUiStatus.STATIC_EDITABLE, entityInfo } })
      dispatch({
        type: LDU_LTE_TEC_Saga,
        payload: { fieldNameToUpdate: 'TSU', fieldNewValue: newValue },
        meta: { entityId: entityInfo.teId }
      })
    }
  };

  const tsuInputValueChangeHandlerWithEntityInfo = (entityInfo: TeLfEntityInfo, event: ChangeEvent<{}>, newInputValue: string): void => {
    dispatchTecsLfStateChange({ type: 'changeCtrlLocalState', payload: { ctrlName: 'tsu', fieldNameToUpdate: 'tsuInputValue', fieldNewValue: newInputValue, entityInfo } });
  }

  const dscrValueChangeHandlerWithEntityInfo = (entityInfo: TeLfEntityInfoTimeSlice, event: ChangeEvent<{}>, newInputValue: string): void => {
    dispatchTecsLfStateChange({ type: 'changeCtrlLocalState', payload: { ctrlName: 'dscr', fieldNameToUpdate: 'currentValue', fieldNewValue: newInputValue, entityInfo } });
  }

  const dscrBlurHandlerWithEntityInfo = (entityInfo: TeLfEntityInfoTimeSlice, event: FocusEvent<HTMLInputElement>, value: string): void => {
    dispatchTecsLfStateChange({ type: 'changeCtrlLocalState', payload: { ctrlName: 'dscr', fieldNameToUpdate: 'status', fieldNewValue: CtrlUiStatus.STATIC_EDITABLE, entityInfo } });
    if (entityInfo.teLfEntityType === 'teTimeSlice') {
      if (entityInfo.dscr !== value) {
        dispatch({
          type: LDU_LTE_TEC_Saga,
          payload: { fieldNameToUpdate: 'description', fieldNewValue: value },
          meta: { entityId: entityInfo.teId }
        })
      } else {
        dispatch(CRUD_LTE_TEC_EditingStop(entityInfo.teId));
      }
    }

  }

  const dateChangeHandlerWithEntityInfo = (entityInfo: TeLfEntityInfoTimeSlice, date: Date | null, dateStartEndType: DateStartEndType) => {
    if (!Number.isNaN(date?.valueOf()) && date !== null) {
      let dateToSet: Date, dateToSetMS: number, dateToCompareAgainst: number;
      const dateTypeIsStart = dateStartEndType === 'start' ? true : false;
      if (dateTypeIsStart) {
        dateToCompareAgainst = entityInfo.teStartMS;
        dateToSet = date > new Date(entityInfo.teEndMS) ? new Date(entityInfo.teEndMS - 60 * 1000) : date;
      } else {
        dateToCompareAgainst = entityInfo.teEndMS;
        dateToSet = date < new Date(entityInfo.teStartMS) ? new Date(entityInfo.teStartMS + 60 * 1000) : date;
      }
      dateToSetMS = dateToSet.valueOf();
      if (dateToSetMS !== dateToCompareAgainst) {
        dispatch({
          type: LDU_LTE_TEC_Saga,
          payload: { fieldNameToUpdate: dateStartEndType, fieldNewValue: dateToSetMS },
          meta: { entityId: entityInfo.teId }
        })
      }
    }
  }

  const duplicateTeHandlerWithEntityInfo = (entityInfo: TeLfEntityInfoTimeSlice) => {
    const timeEntryObject: TimeEntry = {
      start: entityInfo.teStartMS,
      end: entityInfo.teEndMS,
    }
    if (entityInfo.dscr) {
      timeEntryObject.description = entityInfo.dscr;
    }
    if (entityInfo.tsuId) {
      timeEntryObject.TSU = entityInfo.tsuId;
    }
    dispatch({ type: LDC_LTE_TEC_Saga, payload: timeEntryObject })
  }

  const deleteTeHandlerWithEntityInfo = (entityInfo: TeLfEntityInfoTimeSlice) => {
    dispatch({
      type: LDD_LTE_TEC_Saga,
      meta: { entityId: entityInfo.teId }
    })
  }

  const createTeaHandlerWithEntityInfo = (entityInfo: TeLfEntityInfoTimeSlice) => {
    const timeEntryObject: TimeEntry = {
      start: Date.now(),
    }
    if (entityInfo.dscr) {
      timeEntryObject.description = entityInfo.dscr;
    }
    if (entityInfo.tsuId) {
      timeEntryObject.TSU = entityInfo.tsuId;
    }
    dispatch({ type: LDC_LTE_TEC_TEA_Saga, payload: timeEntryObject })
  }

  const foldHandlerWithEntityInfo = (entityInfo: TeLfEntityInfoTaskGroup | TeLfEntityInfoTimeGroup) => {
    dispatchTecsLfStateChange({
      type: 'foldingGroups',
      payload: {
        tesStateMapId: entityInfo.tesStateMapId,
        foldingType: 'toggle'
      }
    })
  }

  const handlersFromProps = {
    toggleCtrlHandler,
    tsuValueChangeHandlerWithEntityInfo,
    tsuInputValueChangeHandlerWithEntityInfo,
    dscrValueChangeHandlerWithEntityInfo,
    dscrBlurHandlerWithEntityInfo,
    dateChangeHandlerWithEntityInfo,
    duplicateTeHandlerWithEntityInfo,
    deleteTeHandlerWithEntityInfo,
    createTeaHandlerWithEntityInfo,
    foldHandlerWithEntityInfo
  }

  const handleGroupingCfgChange = (groupingCfgChange: Partial<TecsLfMapGroupingCfg>) => {
    dispatchTecsLfStateChange(
      {
        type: 'recomputeGroupingCfg',
        payload: {
          lteData,
          taskSelectionList: tasksSelectionList,
          groupingCfgChange
        }
      });
  }

  //#endregion


  const getTecsBlock = (): JSX.Element[] => {

    let map: JSX.Element[] = [];
    //if no time slicing / grouping and therefore taskgrouping  - return simpleMap
    if (!tecsLfMapGroupingCfg.timeGroupingType && !tecsLfMapGroupingCfg.timeSlicingType) {
      map = tecsLfMap.map(teLfData => <TeLf
        key={teLfData.entityInfo.tesStateMapId}
        teLfCfg={teLfData.teLfCfg}
        entityInfo={teLfData.entityInfo}
        fetchStatus={teLfData.fetchStatus}
        handlersFromProps={handlersFromProps}
      />)
    }
    //else
    // initialize  Blocks with empty children array
    let timeGroupBlockElm: JSX.Element | undefined;
    let timeGroupBlockChildren: JSX.Element[] = [];
    let timeSliceBlockElm: JSX.Element | undefined;
    let timeSliceBlockChildren: JSX.Element[] = [];
    const getTimeSliceTargetCntr = () => tecsLfMapGroupingCfg.timeGroupingType ? timeGroupBlockChildren : map;

    tecsLfMap.forEach((teLfData: TeLfData, idx: number) => {
      const { tesStateMapId, teLfEntityType } = teLfData.entityInfo;

      if (!visibilityGraph?.[tesStateMapId].isVisible) {
        return;
      }

      const { entityInfo } = teLfData;
      if (entityInfo.teLfEntityType === 'teTimeGroup') {

        if (tecsLfMapGroupingCfg.timeGroupingType && (entityInfo.teLFTimeGroupType === TimeSliceTypes.MONTH || entityInfo.teLFTimeGroupType === TimeSliceTypes.WEEK)) {

          timeSliceBlockElm && timeSliceBlockChildren.length && timeGroupBlockChildren.push(React.cloneElement(
            timeSliceBlockElm,
            undefined,
            [...timeSliceBlockChildren]
          ))
          timeGroupBlockElm && timeGroupBlockChildren.length && map.push(React.cloneElement(
            timeGroupBlockElm,
            undefined,
            [...timeGroupBlockChildren]
          ));
          timeGroupBlockElm = (<Paper
            key={`timeGroupBlock_${tesStateMapId}`}
            elevation={3}
            className={clsx(classes.timeGroupBlockCntr)} />);
          timeGroupBlockChildren = [];
          timeSliceBlockChildren = [];
          timeGroupBlockChildren.push(<TimeGroupCmp
            key={tesStateMapId}
            entityInfo={teLfData.entityInfo as TeLfEntityInfoTimeGroup}
            isOpen={visibilityGraph![tesStateMapId].isOpen}
            foldHandlerWithEntityInfo={foldHandlerWithEntityInfo}
          />);
        } else {

          timeSliceBlockElm && timeSliceBlockChildren.length && getTimeSliceTargetCntr().push(React.cloneElement(
            timeSliceBlockElm,
            undefined,
            [...timeSliceBlockChildren]
          ))

          timeSliceBlockElm = (
            <div 
              key={`timeSliceBlock_${teLfData.entityInfo.tesStateMapId}`}
              className={clsx(classes.timeSliceBlockCntr)} />
          )

          timeSliceBlockChildren = [];

          timeSliceBlockChildren.push(<TimeGroupCmp
            key={tesStateMapId}
            entityInfo={teLfData.entityInfo as TeLfEntityInfoTimeGroup}
            isOpen={visibilityGraph![tesStateMapId].isOpen}
            foldHandlerWithEntityInfo={foldHandlerWithEntityInfo}
          />);
        }
      } else {
        //teTimeSlice or taskGroup

        let teLfElmL0: JSX.Element = <TeLf
          key={tesStateMapId}
          teLfCfg={teLfData.teLfCfg}
          entityInfo={teLfData.entityInfo}
          fetchStatus={teLfData.fetchStatus}
          handlersFromProps={handlersFromProps}
        />;

        if (tecsLfMapGroupingCfg.isTaskGrouping) {
          if (teLfEntityType === 'teTaskGroup') {
            teLfElmL0 = <TeLf
              key={tesStateMapId}
              teLfCfg={teLfData.teLfCfg}
              entityInfo={teLfData.entityInfo}
              fetchStatus={teLfData.fetchStatus}
              handlersFromProps={handlersFromProps}
              isOpen={visibilityGraph[tesStateMapId].isOpen}
            />;
          } else {
            let isChildOfTaskGroup = false;
            const parentEntityMapId = visibilityGraph[tesStateMapId].parent;
            if (parentEntityMapId) {
              const parentEntityInVisibilityGraph = visibilityGraph[parentEntityMapId];
              isChildOfTaskGroup = parentEntityInVisibilityGraph.teLfEntityType === 'teTaskGroup';
              if (isChildOfTaskGroup) {
                teLfElmL0 = (<div key={tesStateMapId} className={classes.childOfTaskGroup}><TeLf
                  teLfCfg={teLfData.teLfCfg}
                  entityInfo={teLfData.entityInfo}
                  fetchStatus={teLfData.fetchStatus}
                  handlersFromProps={handlersFromProps}
                /></div>)
              }
            }
          }
        }
        timeSliceBlockChildren.push(teLfElmL0)
      }
    })

    timeSliceBlockElm && timeSliceBlockChildren.length && getTimeSliceTargetCntr().push(React.cloneElement(
      timeSliceBlockElm,
      undefined,
      [...timeSliceBlockChildren]
    ))
    timeGroupBlockElm && timeGroupBlockChildren.length && map.push(React.cloneElement(
      timeGroupBlockElm,
      undefined,
      [...timeGroupBlockChildren]
    ));

    return map;
  }

  const tecsBlock = getTecsBlock();



  return (
    <div className={clsx(classes.timeEntriesContainer)}>
      <TecsManagerGroupingCfg
        timeSlicingType={tecsLfMapGroupingCfg.timeSlicingType}
        timeGroupingType={tecsLfMapGroupingCfg.timeGroupingType}
        isTaskGrouping={tecsLfMapGroupingCfg.isTaskGrouping}
        handleGroupingCfgChange={handleGroupingCfgChange}
      />
      <ProgressbarWrapper
        hidden={!LTELoading}
      />


      {/* {!timeEntriesBlock.length
        ? <div>No time entries</div>
        : <div>{timeEntriesBlock}</div>} */}

      {!tecsBlock.length
        ? <div>No time entries</div>
        : <div>{tecsBlock}</div>}

    </div>
  )
}

export default TecsManager;