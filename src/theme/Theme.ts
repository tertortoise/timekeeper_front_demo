import { createMuiTheme } from '@material-ui/core/styles';
import purple from '@material-ui/core/colors/purple';
import { Theme } from '@material-ui/core';

const palettePrimaryMain = purple[500];
const palettePrimaryActionSelected = 'rgba(102, 86, 209, 0.15)'

//override default theme
export const theme: Theme = createMuiTheme({
  palette: {
    primary: {
      main: palettePrimaryMain
    },
    action: {
      selected: palettePrimaryActionSelected
    }
  },
  overrides: {
    // Style sheet name ⚛️
    MuiIconButton: {
      // Name of the rule
      root: {
        color: palettePrimaryMain,
        '&$disabled': {
          cursor: 'not-allowed',
          pointerEvents: 'inherit',
        }
      }
    },
    MuiInputBase: {
      root: {
        //another alternative for the rule '&.Mui-disabled': {}
        '&$disabled': {
          background: 'rgba(0, 0, 0, 0.08)',
          cursor: 'not-allowed',
        },
        '&$disabled fieldset': {
          pointerEvents: 'inherit'
        } 
      },
    }

  },
  props: {
    // Name of the component ⚛️
    MuiButtonBase: {
      // The default props to change
      disableRipple: true, // No more ripple, on the whole application 💣!
    },
  },
});

