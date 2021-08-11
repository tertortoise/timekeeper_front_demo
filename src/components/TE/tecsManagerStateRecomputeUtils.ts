import { getWeek, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear } from "date-fns";

import { TimeSlice,  TimeSliceTypes, DateStartEndType,  DateGroupObjFull } from '../../interfaces/timeSliceInterfaces';
import { TimeEntry, TEDataSliceInt, CtrlUiStatus, TeLfData, TeLfEntityInfoTimeSlice, TecsStateMapIdCfg } from '../../interfaces/timeTracker';
import { TaskSelectionUnit } from "../../interfaces/tasks";
import { FetchStatus } from "../../interfaces/dataSyncable";
import { TecsLfState, TecsLfMapGroupingCfg, TecsEntitiesBeingEditedLocally, TecsManagerVisibilityGraph } from "./TecsManager";
import { idleFetchStatus } from "../../redux/fetchStatusUtils";

type EntitiesHashMap = {
  [key: string]: TeLfData
};

export const DATAFNS_WEEK_OPTIONS = {
  weekStartsOn: 1 as 0 | 1 | 2 | 3 | 4 | 5 | 6 | undefined,
}

const getDateGroupObjUtil = (dateInMs: number): DateGroupObjFull => {
  const localDate = new Date(dateInMs),
    date = localDate.getDate(),
    week = getWeek(localDate, DATAFNS_WEEK_OPTIONS),
    month = localDate.getMonth(),
    year = localDate.getFullYear();

  return { year, month, week, date };

}

const getTimeSliceStartEnd = ({ year, month, week, date }: DateGroupObjFull, timeSliceType: TimeSliceTypes, timeType: DateStartEndType): number => {
  //TODO derive date to set depending on timeslice type
  let dateToSet: Date;
  const currentDate = new Date(year, month, date);
  if (timeSliceType === TimeSliceTypes.DAY) {
    const timeToSet = timeType === 'start' ? [0, 0, 0, 0] : [23, 59, 59, 999];
    dateToSet = new Date(year, month, date, ...timeToSet)
  } else if (timeSliceType === TimeSliceTypes.WEEK) {
    dateToSet = timeType === 'start'
      ? startOfWeek(currentDate, DATAFNS_WEEK_OPTIONS)
      : endOfWeek(currentDate, DATAFNS_WEEK_OPTIONS);
  } else if (timeSliceType === TimeSliceTypes.MONTH) {
    dateToSet = timeType === 'start'
      ? startOfMonth(currentDate)
      : endOfMonth(currentDate);
  } else if (timeSliceType === TimeSliceTypes.YEAR) {
    dateToSet = timeType === 'start'
      ? startOfYear(currentDate)
      : endOfYear(currentDate);
  }

  return dateToSet!.valueOf();

}

function* generateTimeSlices(entityStart: number, entityEnd: number, timeSliceType?: TimeSliceTypes): Generator<TimeSlice, number, never> {
  let startMS: number = entityStart,
    startDateGroupObj: DateGroupObjFull,
    endOfSliceMS: number,
    stretchesToNextSlice: boolean = true,
    entityIsMultiSlice: boolean = false,
    timeSliceNumber = 1,
    endsInFuture = false,
    startsInPast = false;

  while (stretchesToNextSlice) {

    startDateGroupObj = getDateGroupObjUtil(startMS);
    endOfSliceMS = timeSliceType ? getTimeSliceStartEnd(startDateGroupObj, timeSliceType, 'end') : entityEnd;
    stretchesToNextSlice = timeSliceType ? entityEnd > endOfSliceMS : false;
    entityIsMultiSlice = entityIsMultiSlice || stretchesToNextSlice;
    endsInFuture = stretchesToNextSlice;
    yield {
      timeSlicingType: timeSliceType,
      sliceStart: startMS,
      sliceEnd: timeSliceType ? Math.min(entityEnd, endOfSliceMS) : entityEnd,
      startDateGroupObj,
      timeSliceNumber,
      entityIsMultiSlice,
      startsInPast: startsInPast,
      endsInFuture: endsInFuture
    };
    startMS = endOfSliceMS + 1;
    timeSliceNumber++;
    startsInPast = true;
  }
  return timeSliceNumber - 1;
}

const tsuCtrlStub = {
  status: CtrlUiStatus.OFF,
  tsuId: '',
  tsuOptions: [],
  tsuTaskSelectionList: [],
  tsuInputValue: '',
  tsuGetOptionLabel: () => 'stub'
}

const dscrCtrlStub = {
  status: CtrlUiStatus.OFF,
  currentValue: '',
}

const stubDate = new Date(0);

const startCtrlStub = {
  status: CtrlUiStatus.OFF,
  sliceStartMS: 0,
  sliceStartDate: stubDate,
  maxDate: stubDate,
}

const endCtrlStub = {
  status: CtrlUiStatus.OFF,
  sliceEndMS: 0,
  sliceEndDate: stubDate,
  minDate: stubDate,
}


const getTesStateMapId = (tecsStateMapIdCfg: TecsStateMapIdCfg): string => {
  const getTimeGroupIdentifierString = (dateObj: DateGroupObjFull, timeGroupType: TimeSliceTypes) => {
    let resultString = `${dateObj.year}-`;
    if (timeGroupType === TimeSliceTypes.MONTH) {
      resultString += `${dateObj.month}`;
    }
    if (timeGroupType === TimeSliceTypes.WEEK) {
      resultString += `${dateObj.week}`;
    }
    if (timeGroupType === TimeSliceTypes.DAY) {
      resultString += `${dateObj.month}-${dateObj.date}`;
    }
    return resultString;
  }
  switch (tecsStateMapIdCfg.teLfEntityType) {
    case 'teTimeSlice': {
      return `${tecsStateMapIdCfg.teId!}_${tecsStateMapIdCfg.timeSliceNumber}_${tecsStateMapIdCfg.timeSlicingString}`
    }
    case 'teTimeGroup': {
      return `${tecsStateMapIdCfg.teLFTimeGroupType}_${getTimeGroupIdentifierString(tecsStateMapIdCfg.dateGroupObj, tecsStateMapIdCfg.teLFTimeGroupType)}_${tecsStateMapIdCfg.timeSlicingString}`;
    }
    case 'teTaskGroup': {
      //taskId_parentTimeGroupNode?
      return tecsStateMapIdCfg.parentTimeGroupMapId ? `${tecsStateMapIdCfg.tsuId}_${tecsStateMapIdCfg.parentTimeGroupMapId}` : `${tecsStateMapIdCfg.tsuId}`;
    }
  }
}

const createTimeGroupNode = ({ entityInfo }: TeLfData, teLFTimeGroupType: TimeSliceTypes, tesStateMapId: string): TeLfData => {

  const groupObjOfTimeSlice = (entityInfo as TeLfEntityInfoTimeSlice).startDateGroupObj;

  const sliceEndMS = getTimeSliceStartEnd(groupObjOfTimeSlice, teLFTimeGroupType, 'end');
  const sliceStartMS = sliceEndMS;
  const timeSpanStartMS = getTimeSliceStartEnd(groupObjOfTimeSlice, teLFTimeGroupType, 'start');
  // const dateGroupObj = getDateGroupObjUtil(sliceEndMS);
  // year, month, week, date - getDataObject with sliceEnd
  let newTimeNode: TeLfData = {
    teLfCfg: {
      prefix: {
        status: CtrlUiStatus.STATIC_EDITABLE,
        textValue: `stub`, // number of children? 
      },
      tsu: tsuCtrlStub,
      dscr: dscrCtrlStub,
      start: startCtrlStub,
      end: endCtrlStub
    },
    entityInfo: {
      teLfEntityType: 'teTimeGroup',
      teLFTimeGroupType,
      tesStateMapId,
      sliceStartMS,
      sliceEndMS,
      durationMS: entityInfo.durationMS,
      timeSpanStartMS,
    },
    fetchStatus: idleFetchStatus,
  };
  return newTimeNode;
}

export interface recomputeTecsLfMapFuncArg {
  lteData: TEDataSliceInt[];
  taskSelectionList: TaskSelectionUnit[];
  tecsLfMapGroupingCfg: TecsLfMapGroupingCfg;
  tecsEntitiesBeingEditedLocally?: TecsEntitiesBeingEditedLocally;
  visibilityGraph?: TecsManagerVisibilityGraph;
}

//WIP
const sortTeLfStateMapEntities = (array: TeLfData[]): TeLfData[] => {
  return array.sort(({ entityInfo: { sliceStartMS: sliceStartMS_A } }, { entityInfo: { sliceStartMS: sliceStartMS_B } }) => {
    return sliceStartMS_B - sliceStartMS_A;
  })
}


const prepareSortedGroupedStateMap = (topLevelEntitiesHashMap: Map<string, TeLfData>, entitiesHashMap: EntitiesHashMap, visibilityGraph: TecsManagerVisibilityGraph): TeLfData[] => {

  const newTeLfEntitiesStateMap: TeLfData[] = [];

  const addEntitiesToStateMap = (entitiy: TeLfData): void => {
    newTeLfEntitiesStateMap.push(entitiy);

    if (visibilityGraph[entitiy.entityInfo.tesStateMapId].children?.size) {
      sortTeLfStateMapEntities(Array.from(visibilityGraph[entitiy.entityInfo.tesStateMapId].children!).map(childMapId => {
        return entitiesHashMap[childMapId];
      })).forEach(entity => addEntitiesToStateMap(entity))
    } else {
      return;
    }
  }

  sortTeLfStateMapEntities(Array.from(topLevelEntitiesHashMap.values())).forEach(entity => {
    addEntitiesToStateMap(entity);
  })

  return newTeLfEntitiesStateMap;
}

const makeRecomputeStateUtil = () => {

  //LteCache contains LTEData object -> array of TeLfData
  const lteCache = new WeakMap<TEDataSliceInt, TeLfData[]>();
  //previous value for taskSelectionList may be undefined in case no tasks created
  const taskSelectionListCache = new Map<TaskSelectionUnit[] | undefined, { tsuOptions: string[], tsuGetOptionLabel: (option: string) => string }>();
  let timeSlicingTypePrevValue: TimeSliceTypes | undefined;



  return ({ lteData, taskSelectionList, tecsLfMapGroupingCfg, tecsEntitiesBeingEditedLocally, visibilityGraph }: recomputeTecsLfMapFuncArg): TecsLfState => {
    performance.mark('RECOMPUTE')

    const { timeSlicingType, timeGroupingType, isTaskGrouping } = tecsLfMapGroupingCfg;
    const timeSlicingString = timeSlicingType ? timeSlicingType : 'none';
    let tsuOptions: string[];
    let tsuGetOptionLabel: (option: string) => string;
    let isTaskSelectionListTheSame: boolean = false;
    let isTimeSlicingTypeTheSame: boolean = false;
    if (taskSelectionListCache.has(taskSelectionList)) {
      isTaskSelectionListTheSame = true; // even in case if there were not tasks
      ({ tsuOptions, tsuGetOptionLabel } = taskSelectionListCache.get(taskSelectionList)!)
    } else {
      tsuOptions = taskSelectionList ? taskSelectionList.map(taskSelectionUnit => taskSelectionUnit.id) : [];
      tsuGetOptionLabel = (option: string) => {
        return taskSelectionList?.find(taskSelectionUnit => taskSelectionUnit.id === option)?.label ?? '';
      }
      taskSelectionListCache.clear();
      taskSelectionListCache.set(taskSelectionList, { tsuOptions, tsuGetOptionLabel })
    }

    if (timeSlicingTypePrevValue === timeSlicingType) {
      isTimeSlicingTypeTheSame = true;
    } else {
      timeSlicingTypePrevValue = timeSlicingType;
    }

    const teTimeSliceList: TeLfData[] = lteData.flatMap((timeEntryDataSlice, entityDataRefIdx) => {
      const tecsTimeSlices: TeLfData[] = [];
      const teData: TimeEntry = timeEntryDataSlice.data!;
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const teStatus: FetchStatus = timeEntryDataSlice.status!;

      // cases we get timeslices from cache and do not have to recreate them from scratch
      if (
        !teStatus.editing
        && lteCache.has(timeEntryDataSlice)
        && isTimeSlicingTypeTheSame
        && isTaskSelectionListTheSame
      ) {
        const timeSlicesInCache = lteCache.get(timeEntryDataSlice);
        Array.isArray(timeSlicesInCache) && tecsTimeSlices.push(...timeSlicesInCache);
      } else {
        // recreating time slices from scratch
        const timeSliceGenerator = generateTimeSlices(timeEntryDataSlice.data!.start, timeEntryDataSlice.data!.end!, timeSlicingType);
        let generatedTimeSlice: TimeSlice | number, done: boolean | undefined;
        while (!done) {
          ({ value: generatedTimeSlice, done } = timeSliceGenerator.next());
          if (!done && typeof generatedTimeSlice !== 'number') {
            const { timeSliceNumber, sliceStart: sliceStartMS, sliceEnd: sliceEndMS, startsInPast, endsInFuture } = generatedTimeSlice;
            const teStartMS = teData.start,
              teEndMS = teData.end!,
              tesStateMapId = getTesStateMapId({ teLfEntityType: 'teTimeSlice', teId: teData.id!, timeSliceNumber, timeSlicingString });

            let tsuId = teData.TSU ?? '',
              tsuInputValue = teData.TSU ? tsuGetOptionLabel(teData.TSU) : '',
              dscr = teData.description ?? '',
              editableControlsStatus: CtrlUiStatus = (teStatus.loading || teStatus.editing) ? CtrlUiStatus.STATIC_NONEDITABLE : CtrlUiStatus.STATIC_EDITABLE;
            let tsuStatus: CtrlUiStatus = editableControlsStatus,
              dscrStatus: CtrlUiStatus = editableControlsStatus,
              startStatus: CtrlUiStatus = editableControlsStatus,
              endStatus: CtrlUiStatus = editableControlsStatus;

            if (tecsEntitiesBeingEditedLocally && tecsEntitiesBeingEditedLocally[tesStateMapId]) {
              const tecsBeingEditedLocallyCtrlData = tecsEntitiesBeingEditedLocally[tesStateMapId];

              switch (tecsBeingEditedLocallyCtrlData.ctrlName) {
                case 'tsu':
                  tsuStatus = CtrlUiStatus.CTRL_ENABLED;
                  break;
                case 'dscr':
                  dscrStatus = CtrlUiStatus.CTRL_ENABLED;
                  dscr = tecsBeingEditedLocallyCtrlData.ctrlObj[tecsBeingEditedLocallyCtrlData.ctrlName].currentValue;
                  break;
                case 'start':
                  startStatus = CtrlUiStatus.CTRL_ENABLED;
                  break;
                case 'end':
                  endStatus = CtrlUiStatus.CTRL_ENABLED;
                  break;
              }
            }

            tecsTimeSlices.push({
              teLfCfg: {
                prefix: {
                  status: CtrlUiStatus.CTRL_DISABLED,
                  textValue: `${timeSliceNumber}/`,
                },
                tsu: {
                  status: tsuStatus,
                  tsuId,
                  tsuOptions: tsuOptions,
                  tsuTaskSelectionList: taskSelectionList,
                  tsuInputValue,
                  tsuGetOptionLabel
                },
                dscr: {
                  status: dscrStatus,
                  currentValue: dscr,
                },
                start: {
                  status: startsInPast ? CtrlUiStatus.STATIC_NONEDITABLE : startStatus,
                  sliceStartMS,
                  sliceStartDate: new Date(sliceStartMS),
                  maxDate: new Date(teEndMS),
                },
                end: {
                  status: endsInFuture ? CtrlUiStatus.STATIC_NONEDITABLE : endStatus,
                  sliceEndMS,
                  sliceEndDate: new Date(sliceEndMS),
                  minDate: new Date(teStartMS),
                }
              },
              entityInfo: {
                teLfEntityType: 'teTimeSlice',
                timeSlicingType: timeSlicingType,
                tesStateMapId,
                teId: teData.id!,
                // TODO deprecate
                // teRefIdx: entityDataRefIdx,
                timeSliceNumber,
                timeSliceCount: 0, //assigned later
                sliceStartMS,
                sliceEndMS,
                durationMS: sliceEndMS - sliceStartMS,
                startDateGroupObj: generatedTimeSlice.startDateGroupObj,
                tsuId,
                tsuInputValue,
                dscr,
                teIsMultiSlice: generatedTimeSlice.entityIsMultiSlice,
                startsInPast,
                endsInFuture,
                teStartMS,
                teEndMS,
              },
              fetchStatus: {
                ...teStatus,
              }
            })

          } else if (done && typeof generatedTimeSlice === 'number') {
            // eslint-disable-next-line no-loop-func
            tecsTimeSlices.forEach(teTimeSlices => {
              teTimeSlices.teLfCfg.prefix.textValue += `${(generatedTimeSlice as number)}`;
              (teTimeSlices.entityInfo as TeLfEntityInfoTimeSlice).timeSliceCount = generatedTimeSlice as number;
            })
          }
        }
        lteCache.set(timeEntryDataSlice, tecsTimeSlices);
      }
      return tecsTimeSlices;
    })

    if (!isTaskGrouping && !timeSlicingType && !timeGroupingType) {
      return {
        tecsLfMap: sortTeLfStateMapEntities(teTimeSliceList),
        tecsLfMapGroupingCfg
      };
    }

    let entitiesHashMap = {} as EntitiesHashMap;
    let topLevelEntitiesHashMap = new Map<string, TeLfData>();
    let interimVisibilityGraph = {} as TecsManagerVisibilityGraph;

    teTimeSliceList.forEach(teTimeSlice => {
      const teTimeSliceEntityInfo = teTimeSlice.entityInfo as TeLfEntityInfoTimeSlice;
      const teTimeSliceDurationMS = teTimeSliceEntityInfo.durationMS;
      const teTimeSliceStartMS = teTimeSliceEntityInfo.sliceStartMS;
      const teTimeSliceEndMS = teTimeSliceEntityInfo.sliceEndMS;
      const teTimeSliceTesStateMapId = teTimeSlice.entityInfo.tesStateMapId
      //we need precheck for existing time and task node by mapId and then if no such node - create it
      //if node exists - increase duration and children counter?

      const [timeGroupingGroup, timeSlicingGroup] = [timeGroupingType, timeSlicingType].map(timeNodeType => {
        if (!timeNodeType) {
          return null;
        }
        let timeNode = {} as TeLfData;
        let tesStateMapId = getTesStateMapId({
          teLfEntityType: 'teTimeGroup',
          teLFTimeGroupType: timeNodeType,
          dateGroupObj: teTimeSliceEntityInfo.startDateGroupObj,
          timeSlicingString
        });
        if (entitiesHashMap[tesStateMapId]) {
          entitiesHashMap[tesStateMapId].entityInfo.durationMS += teTimeSliceDurationMS;
          timeNode = entitiesHashMap[tesStateMapId];
        } else {
          timeNode = createTimeGroupNode(teTimeSlice, timeNodeType!, tesStateMapId);
          entitiesHashMap[tesStateMapId] = timeNode;
        }
        return timeNode;
      })

      let taskGroup: TeLfData | undefined = undefined;
      if (isTaskGrouping && teTimeSliceEntityInfo.tsuId) {
        let tesStateMapId = getTesStateMapId({
          teLfEntityType: 'teTaskGroup',
          tsuId: teTimeSliceEntityInfo.tsuId,
          parentTimeGroupMapId: timeSlicingGroup?.entityInfo.tesStateMapId,
        });
        if (entitiesHashMap[tesStateMapId]) {
          entitiesHashMap[tesStateMapId].entityInfo.durationMS += teTimeSliceDurationMS;
          if (entitiesHashMap[tesStateMapId].entityInfo.sliceStartMS > teTimeSliceStartMS) {
            entitiesHashMap[tesStateMapId].entityInfo.sliceStartMS = teTimeSliceStartMS;
            entitiesHashMap[tesStateMapId].teLfCfg.start.sliceStartMS = teTimeSliceStartMS;
            entitiesHashMap[tesStateMapId].teLfCfg.start.sliceStartDate = teTimeSlice.teLfCfg.start.sliceStartDate;
          }
          if (entitiesHashMap[tesStateMapId].entityInfo.sliceEndMS < teTimeSliceEndMS) {
            entitiesHashMap[tesStateMapId].entityInfo.sliceEndMS = teTimeSliceEndMS;
            entitiesHashMap[tesStateMapId].teLfCfg.end.sliceEndMS = teTimeSliceEndMS;
            entitiesHashMap[tesStateMapId].teLfCfg.end.sliceEndDate = teTimeSlice.teLfCfg.end.sliceEndDate;
          }
          taskGroup = entitiesHashMap[tesStateMapId];
        } else {
          taskGroup = {
            teLfCfg: {
              prefix: {
                status: CtrlUiStatus.CTRL_ENABLED,
                textValue: `stub`, //  number of children? 
              },
              tsu: {
                status: CtrlUiStatus.STATIC_NONEDITABLE,
                tsuId: teTimeSliceEntityInfo.tsuId,
                tsuOptions: tsuOptions,
                tsuTaskSelectionList: taskSelectionList,
                tsuInputValue: teTimeSliceEntityInfo.tsuInputValue,
                tsuGetOptionLabel
              },
              dscr: dscrCtrlStub,
              start: {
                status: CtrlUiStatus.STATIC_NONEDITABLE,
                sliceStartMS: teTimeSliceStartMS,
                sliceStartDate: teTimeSlice.teLfCfg.start.sliceStartDate,
                maxDate: stubDate,
              },
              end: {
                status: CtrlUiStatus.STATIC_NONEDITABLE,
                sliceEndMS: teTimeSliceEndMS,
                sliceEndDate: teTimeSlice.teLfCfg.end.sliceEndDate,
                minDate: stubDate,
              }
            },
            entityInfo: {
              teLfEntityType: 'teTaskGroup',
              timeSlicingType,
              tesStateMapId,
              tecsIds: new Set([teTimeSliceEntityInfo.teId]),
              sliceStartMS: teTimeSliceStartMS,
              sliceEndMS: teTimeSliceEndMS,
              durationMS: teTimeSliceDurationMS,
              tsuId: teTimeSliceEntityInfo.tsuId,
              tsuInputValue: teTimeSliceEntityInfo.tsuInputValue,
            },
            fetchStatus: idleFetchStatus,
          };
          entitiesHashMap[tesStateMapId] = taskGroup;

        }
      }

      const localVisibilityNodesHierArray = [];
      timeGroupingGroup && localVisibilityNodesHierArray.push(timeGroupingGroup);
      timeSlicingGroup && localVisibilityNodesHierArray.push(timeSlicingGroup);
      taskGroup && localVisibilityNodesHierArray.push(taskGroup);

      let timeSliceParentMapId: string | undefined = undefined;

      let parentGroupsAreOpen = true;
      let parentGroupMapId: string | undefined = undefined;
      let topLevelNodeMapId: string | undefined = undefined;

      localVisibilityNodesHierArray.forEach((node, index, array) => {
        const nodeTesStateMapId = node.entityInfo.tesStateMapId;
        timeSliceParentMapId = nodeTesStateMapId;
        topLevelNodeMapId = topLevelNodeMapId ?? nodeTesStateMapId;
        const nextNodeTesStateMapId = array[index + 1]?.entityInfo.tesStateMapId;
        const existingNewVisibilityGraphNode = interimVisibilityGraph[nodeTesStateMapId];
        if (existingNewVisibilityGraphNode) {
          existingNewVisibilityGraphNode.children && existingNewVisibilityGraphNode.children.add(nextNodeTesStateMapId ?? teTimeSliceTesStateMapId)
          parentGroupsAreOpen = parentGroupsAreOpen && existingNewVisibilityGraphNode.isOpen;
        } else {
          const isOpen = visibilityGraph && visibilityGraph[nodeTesStateMapId] ? visibilityGraph[nodeTesStateMapId].isOpen : true;
          interimVisibilityGraph[nodeTesStateMapId] = {
            teLfEntityType: entitiesHashMap[nodeTesStateMapId].entityInfo.teLfEntityType,
            isVisible: parentGroupsAreOpen,
            isOpen,
            parent: parentGroupMapId ? parentGroupMapId : null,
            children: new Set([nextNodeTesStateMapId ?? teTimeSliceTesStateMapId])
          };
          parentGroupsAreOpen = parentGroupsAreOpen && isOpen;
        }
        parentGroupMapId = nodeTesStateMapId;
      })

      interimVisibilityGraph[teTimeSliceTesStateMapId] = {
        teLfEntityType: 'teTimeSlice',
        isOpen: true,
        isVisible: parentGroupsAreOpen,
        parent: timeSliceParentMapId ? timeSliceParentMapId : null,
        children: new Set(),
      };
      entitiesHashMap[teTimeSliceTesStateMapId] = teTimeSlice;
      const topLevelEntity = topLevelNodeMapId ? localVisibilityNodesHierArray[0] : teTimeSlice;
      topLevelNodeMapId = topLevelNodeMapId ?? teTimeSliceTesStateMapId;
      !topLevelEntitiesHashMap.has(topLevelNodeMapId) && topLevelEntitiesHashMap.set(topLevelNodeMapId, topLevelEntity);
    })

    //WIP
    let finalVisibilityGraph = {} as TecsManagerVisibilityGraph;
    //exclude task groups with a single child and put number of children in prefix
    if (isTaskGrouping) {
      for (const [entityMapId, entityVisibilityGraphValue] of Object.entries(interimVisibilityGraph)) {

        if (finalVisibilityGraph[entityMapId]) {
          continue;
        } else if (entityVisibilityGraphValue.teLfEntityType !== 'teTaskGroup') {

          finalVisibilityGraph[entityMapId] = entityVisibilityGraphValue;

        } else if (entityVisibilityGraphValue.children.size > 1) {
          finalVisibilityGraph[entityMapId] = entityVisibilityGraphValue;
          entitiesHashMap[entityMapId].teLfCfg.prefix.textValue = entityVisibilityGraphValue.children.size.toString();
        } else {
          //do not include in graph
          //modify parent and child in the resultant graph
          const [taskGroupSingleChildMapId] = Array.from(entityVisibilityGraphValue.children);
          const taskGroupParentMapId = entityVisibilityGraphValue.parent;
          //modify parent
          if (taskGroupParentMapId) {
            const childrenSetOfTaskGroupParent = interimVisibilityGraph[taskGroupParentMapId].children;
            childrenSetOfTaskGroupParent.delete(entityMapId);
            childrenSetOfTaskGroupParent.add(taskGroupSingleChildMapId);
            finalVisibilityGraph[taskGroupParentMapId] = {
              ...interimVisibilityGraph[taskGroupParentMapId],
              children: childrenSetOfTaskGroupParent,
            }
          }
          //modifying child
          finalVisibilityGraph[taskGroupSingleChildMapId] = {
            ...interimVisibilityGraph[taskGroupSingleChildMapId],
            parent: taskGroupParentMapId ? taskGroupParentMapId : null,
          }
        }
      }
    } else {
      finalVisibilityGraph = interimVisibilityGraph;
    }




    const resultStateMap = prepareSortedGroupedStateMap(topLevelEntitiesHashMap, entitiesHashMap, finalVisibilityGraph);


    performance.measure('RECOMPUTE', 'RECOMPUTE')
    return {
      tecsLfMap: resultStateMap,
      tecsLfMapGroupingCfg,
      visibilityGraph: finalVisibilityGraph
    };




  }
}

export const recomputeTecsLfMapUtil = makeRecomputeStateUtil();