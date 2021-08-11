import { useSelector } from "react-redux";

import TecsManager from '../TE/TecsManager';
import { InitialSyncDataSliceName, selectRusultInitialSyncStatusForDiffSlices } from '../../redux/initialSyncSlice';
import { RootState } from '../../interfaces/redux';

const dataSlicesForTrackerTE: InitialSyncDataSliceName[] = ['TFM', 'LTE'];

export default function AppTracker() {

    const showTrackerTE = useSelector((state: RootState) => selectRusultInitialSyncStatusForDiffSlices(state, dataSlicesForTrackerTE))

    return (
        <>
            {showTrackerTE
                ? <TecsManager />
                : <div>Fetching time entries</div>
            }
        </>
    )
}