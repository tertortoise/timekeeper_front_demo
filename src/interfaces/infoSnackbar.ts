import { SnackbarOrigin } from '@material-ui/core/Snackbar';
import {Color as AlertColor} from '@material-ui/lab/Alert'

export interface InfoSnackbar {
  anchorOrigin?: SnackbarOrigin,
  message: string,
  id?: string,
  severity?: AlertColor
}